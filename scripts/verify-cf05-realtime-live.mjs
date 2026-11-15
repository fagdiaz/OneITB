import { createClient } from '../FrontEnd/OneItb-FE/node_modules/graphql-ws/lib/index.mjs';

const baseUrl = process.argv[2] || 'http://127.0.0.1:5098';
const wsUrl = process.argv[3] || 'ws://127.0.0.1:5098/graphql';
const httpUrl = `${baseUrl}/graphql`;

// Check for simulated failure flag to validate that the checker fails as expected
const simulateArg = process.argv.find((a) => a.startsWith('--simulate-negative='));
const simulatedFailure = simulateArg ? simulateArg.split('=')[1] : null;

console.log(`[CF-05 RUNNER] Target HTTP: ${httpUrl}`);
console.log(`[CF-05 RUNNER] Target WS:   ${wsUrl}`);
console.log(`[CF-05 RUNNER] graphql-ws version: 5.16.0 (unmocked)`);
if (simulatedFailure) {
  console.log(`[CF-05 RUNNER] [NEGATIVE CONTROL ACTIVE]: Simulating failure '${simulatedFailure}'`);
}

// Strict assertion helper: throws immediately on any condition failure
function assert(condition, message) {
  if (!condition) {
    const err = new Error(`[ASSERTION_FAILED]: ${message}`);
    err.name = 'AssertionError';
    throw err;
  }
}

let watchdogCleanup = null;
// Global safety timeout (35 seconds) to guarantee the process is finite
const globalTimeout = setTimeout(() => {
  console.error('\n[FATAL ERROR IN CF-05 RUNNER]: Global timeout of 35s exceeded. Executing emergency cleanup before exit.');
  if (watchdogCleanup) {
    try { watchdogCleanup(); } catch (_) {}
  }
  process.exit(1);
}, 35000);
globalTimeout.unref();

async function httpGraphQl(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(httpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
    }
    return json.data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Strict password acquisition: requires environment variable without fallback
const password = process.env.DEMO_USER_PASSWORD || process.env.TEST_PASSWORD;
if (!password) {
  console.error('[FATAL ERROR]: Missing DEMO_USER_PASSWORD or TEST_PASSWORD environment variable.');
  console.error('Password must be provided via external environment configuration.');
  process.exit(1);
}

async function login(email) {
  const mutation = `mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      id
      role
      isAuthenticated
    }
  }`;
  const data = await httpGraphQl(mutation, { input: { email, password } });
  assert(data?.login?.isAuthenticated, `Login for ${email} did not return isAuthenticated=true`);
  assert(data?.login?.token, `Login for ${email} returned null/empty token`);
  assert(data?.login?.id, `Login for ${email} returned null/empty user id`);
  return {
    email,
    id: data.login.id,
    role: data.login.role,
    token: data.login.token,
  };
}

async function run() {
  const traceEvents = [];
  function logEvent(step, event, details = {}) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, step, event, ...details };
    traceEvents.push(entry);
    const detailsStr = Object.keys(details).length ? ` ${JSON.stringify(details)}` : '';
    console.log(`[${timestamp}] [${step}] ${event}${detailsStr}`);
  }

  logEvent('INIT', 'Starting Live CF-05 Transport Runner against Kestrel ASP.NET Core 8');

  let clientB = null;
  let clientC = null;
  let unsubB = null;
  let unsubC = null;

  watchdogCleanup = () => {
    if (unsubB) { try { unsubB(); } catch (_) {} }
    if (unsubC) { try { unsubC(); } catch (_) {} }
    if (clientB) { try { clientB.dispose(); } catch (_) {} }
    if (clientC) { try { clientC.dispose(); } catch (_) {} }
  };

  try {
    // Step 1: Authentication of the 3 roles via Kestrel /graphql
    logEvent('AUTH', 'Authenticating test accounts against Kestrel /graphql (external credentials)');
    const sessionA = await login('estudiante1.ads@itbeltran.com.ar');
    assert(sessionA.role === 'Estudiante', `Session A role mismatch: expected Estudiante, got ${sessionA.role}`);
    logEvent('AUTH', 'Session A authenticated', { email: sessionA.email, id: sessionA.id, role: sessionA.role });

    const sessionB = await login('profesor1.ads@itbeltran.com.ar');
    assert(sessionB.role === 'Profesor', `Session B role mismatch: expected Profesor, got ${sessionB.role}`);
    logEvent('AUTH', 'Session B authenticated', { email: sessionB.email, id: sessionB.id, role: sessionB.role });

    const sessionC = await login('moderador1@itbeltran.com.ar');
    assert(sessionC.role === 'Moderador', `Session C role mismatch: expected Moderador, got ${sessionC.role}`);
    logEvent('AUTH', 'Session C authenticated', { email: sessionC.email, id: sessionC.id, role: sessionC.role });

    // Step 2: RT-01 Handshake Context B (WebSocket Transport)
    logEvent('RT-01', 'Initiating unmocked graphql-ws connection for Session B');
    const t0Handshake = Date.now();
    let bSocketConnected = false;
    let bConnectionAckTime = 0;

    clientB = createClient({
      url: wsUrl,
      lazy: false,
      retryAttempts: 8,
      // Note: retryWait is UNMOCKED to allow graphql-ws default natural delay (1000ms + random 300..2999ms)
      connectionParams: {
        authorization: `Bearer ${sessionB.token}`,
      },
      on: {
        connected: () => {
          bSocketConnected = true;
          bConnectionAckTime = Date.now();
          logEvent('RT-01', 'Session B WebSocket connected & connection_ack received', {
            latencyMs: bConnectionAckTime - t0Handshake,
          });
        },
        closed: (event) => {
          logEvent('SOCKET_B', 'Session B WebSocket closed event', { code: event?.code, reason: event?.reason });
        },
        error: (err) => {
          logEvent('SOCKET_B', 'Session B WebSocket error', { message: err?.message || String(err) });
        },
      },
    });

    // Wait with deadline for initial connection
    const tConnectBStart = Date.now();
    while (!bSocketConnected && Date.now() - tConnectBStart < 10000) {
      await new Promise((r) => setTimeout(r, 50));
    }
    assert(bSocketConnected, 'Session B failed to connect via WebSocket within 10s deadline');
    assert(bConnectionAckTime >= t0Handshake, 'Session B connection_ack timestamp is invalid');

    // Step 3: RT-03 Setup Passive Observer C (Moderador)
    logEvent('RT-03', 'Setting up active passive observer Session C (Moderador) on WebSocket');
    let cSocketConnected = false;
    const cReceivedFrames = [];
    let cSubscriptionError = null;

    clientC = createClient({
      url: wsUrl,
      lazy: false,
      retryAttempts: 8,
      connectionParams: {
        authorization: `Bearer ${sessionC.token}`,
      },
      on: {
        connected: () => {
          cSocketConnected = true;
          logEvent('RT-03', 'Session C connected to WebSocket');
        },
      },
    });

    const tConnectCStart = Date.now();
    while (!cSocketConnected && Date.now() - tConnectCStart < 10000) {
      await new Promise((r) => setTimeout(r, 50));
    }
    assert(cSocketConnected, 'Session C failed to connect via WebSocket within 10s deadline');

    const subQuery = `subscription MessageReceived {
      messageReceived {
        id
        content
        senderId
        receiverId
        sentAt
        isRead
      }
    }`;

    unsubC = clientC.subscribe(
      { query: subQuery },
      {
        next: (val) => {
          logEvent('OBSERVER_C_FRAME', 'Frame delivered to Observer C', { data: val });
          cReceivedFrames.push(val);
        },
        error: (err) => {
          cSubscriptionError = err;
          logEvent('OBSERVER_C_ERR', 'Error in Observer C subscription', { err: String(err) });
        },
        complete: () => logEvent('OBSERVER_C_COMPL', 'Observer C subscription complete'),
      }
    );

    // Negative control simulation: observer error
    if (simulatedFailure === 'observer-error') {
      cSubscriptionError = new Error('Simulated observer C subscription failure for checker verification');
    }

    // Subscribe B to MessageReceived
    const bReceivedMessages = [];
    let bSubscriptionError = null;

    unsubB = clientB.subscribe(
      { query: subQuery },
      {
        next: (val) => {
          const msg = val?.data?.messageReceived;
          logEvent('RT-02', 'Session B received live message frame via WebSocket', {
            id: msg?.id,
            content: msg?.content,
            senderId: msg?.senderId,
            receiverId: msg?.receiverId,
          });
          bReceivedMessages.push(msg);
        },
        error: (err) => {
          bSubscriptionError = err;
          logEvent('RT-02_ERR', 'Error in Session B subscription', { err: String(err) });
        },
        complete: () => logEvent('RT-02_COMPL', 'Session B subscription complete'),
      }
    );

    await new Promise((r) => setTimeout(r, 400)); // allow subscriptions to register on HotChocolate server
    assert(!bSubscriptionError, `Session B subscription experienced immediate error: ${bSubscriptionError}`);
    assert(!cSubscriptionError, `Observer C subscription experienced immediate error: ${cSubscriptionError}`);

    // Step 4: RT-02 Send Message from A to B
    logEvent('RT-02', 'Session A emitting mutation sendMessage to Session B');
    const tSend1 = Date.now();
    const sendMutation = `mutation Send($receiverId: UUID!, $content: String!) {
      sendMessage(receiverId: $receiverId, content: $content) {
        id
        content
        sentAt
        senderId
        receiverId
      }
    }`;

    const sendResult1 = await httpGraphQl(
      sendMutation,
      {
        receiverId: sessionB.id,
        content: 'Mensaje de prueba live CF-05 (Entrega unmocked)',
      },
      sessionA.token
    );
    const sentMsg1 = sendResult1.sendMessage;
    assert(sentMsg1?.id, 'sendMessage did not return a valid message id');
    logEvent('RT-02', 'Message 1 persisted by backend', {
      id: sentMsg1.id,
      content: sentMsg1.content,
      httpLatencyMs: Date.now() - tSend1,
    });

    // Wait with deadline for delivery to B
    const tDeliveryStart = Date.now();
    while (bReceivedMessages.length === 0 && Date.now() - tDeliveryStart < 6000) {
      await new Promise((r) => setTimeout(r, 50));
    }

    assert(bReceivedMessages.length >= 1, 'Message 1 was not delivered to Session B WebSocket within 6s deadline');

    // Negative control simulation: ID mismatch
    if (simulatedFailure === 'id-mismatch') {
      bReceivedMessages[0].id = '00000000-0000-0000-0000-000000000000';
    }

    assert(
      bReceivedMessages[0].id === sentMsg1.id,
      `Message 1 ID mismatch: expected ${sentMsg1.id}, received ${bReceivedMessages[0].id}`
    );
    assert(
      bReceivedMessages[0].content === sentMsg1.content,
      `Message 1 content mismatch: expected '${sentMsg1.content}', received '${bReceivedMessages[0].content}'`
    );
    assert(
      bReceivedMessages[0].senderId === sessionA.id,
      `Message 1 senderId mismatch: expected ${sessionA.id}, received ${bReceivedMessages[0].senderId}`
    );
    assert(
      bReceivedMessages[0].receiverId === sessionB.id,
      `Message 1 receiverId mismatch: expected ${sessionB.id}, received ${bReceivedMessages[0].receiverId}`
    );

    logEvent('RT-02', 'VERIFIED: Message 1 delivered in real-time to Session B with exact payload match', {
      messageId: bReceivedMessages[0].id,
      matches: true,
    });

    // Negative control simulation: frame leak to Observer C
    if (simulatedFailure === 'leak-to-c') {
      cReceivedFrames.push({ leak: 'Simulated leak frame to Observer C' });
    }

    // Step 5: RT-03 Topic Isolation Check on Observer C
    await new Promise((r) => setTimeout(r, 600)); // observation window
    assert(!cSubscriptionError, `Observer C subscription experienced an error: ${cSubscriptionError}`);
    assert(
      cReceivedFrames.length === 0,
      `Topic isolation violation: Observer C received ${cReceivedFrames.length} unexpected frames`
    );

    logEvent('RT-03', 'VERIFIED: Strict topic isolation confirmed. 0 frames leaked to Observer C', {
      framesDeliveredToC: 0,
      leaksDetected: 0,
      isolationPassed: true,
    });

    // Step 6: RT-04 Mark Conversation Read & Database Re-Read Persistence
    logEvent('RT-04', 'Session B invoking markConversationRead for Session A');
    const markReadMutation = `mutation MarkRead($otherUserId: UUID!) {
      markConversationRead(otherUserId: $otherUserId) {
        markedCount
        otherUserId
      }
    }`;
    const markReadResult = await httpGraphQl(
      markReadMutation,
      { otherUserId: sessionA.id },
      sessionB.token
    );
    const markedCount = markReadResult?.markConversationRead?.markedCount;
    assert(typeof markedCount === 'number' && markedCount >= 1, `Expected markedCount >= 1, got ${markedCount}`);

    // Re-read conversation via GraphQL query from Session B to verify database persistence of isRead
    const getConversationQuery = `query Conversation($otherUserId: UUID!) {
      conversation(otherUserId: $otherUserId) {
        nodes {
          id
          isRead
        }
      }
    }`;
    const conversationData = await httpGraphQl(
      getConversationQuery,
      { otherUserId: sessionA.id },
      sessionB.token
    );
    const nodes = conversationData?.conversation?.nodes || [];
    const persistedMsg = nodes.find((m) => m.id === sentMsg1.id);
    assert(persistedMsg, `Sent message ${sentMsg1.id} was not returned by conversation re-read query`);
    assert(
      persistedMsg.isRead === true,
      `Persistence check failed: message ${sentMsg1.id} isRead is ${persistedMsg.isRead}, expected true`
    );

    logEvent('RT-04', 'VERIFIED: markConversationRead persisted in DB (verified via conversation re-read query)', {
      markedCount,
      persistedMessageId: persistedMsg.id,
      persistedIsRead: persistedMsg.isRead,
      verifiedViaReRead: true,
    });

    // Step 7: RT-05 Forced Client Termination (4499 Terminated) & Natural graphql-ws retryWait
    logEvent('RT-05', 'Forcing client termination via client.terminate() (simulating transport drop code 4499)');
    const tDrop = Date.now();
    let reconnectedAt = 0;

    let reconnectedResolve;
    let reconnectedReject;
    const clientBReconnectedPromise = new Promise((resolve, reject) => {
      reconnectedResolve = resolve;
      reconnectedReject = reject;
    });

    const reconnectDeadline = setTimeout(() => {
      clearInterval(reconnectInterval);
      reconnectedReject(new Error('Session B failed to auto-reconnect within 12s deadline'));
    }, 12000);

    const reconnectInterval = setInterval(() => {
      if (bConnectionAckTime > tDrop) {
        reconnectedAt = bConnectionAckTime;
        clearInterval(reconnectInterval);
        clearTimeout(reconnectDeadline);
        reconnectedResolve();
      }
    }, 50);

    // Drop socket abruptly via terminate()
    clientB.terminate();

    await clientBReconnectedPromise;
    let measuredRetryWaitMs = reconnectedAt - tDrop;

    // Negative control simulation: short wait below threshold
    if (simulatedFailure === 'short-wait') {
      measuredRetryWaitMs = 500;
    }

    assert(
      measuredRetryWaitMs >= 1300,
      `Natural retryWait was ${measuredRetryWaitMs} ms, which is below the declared minimum threshold of 1300 ms (1000ms base + 300..2999ms jitter)`
    );

    logEvent('RT-05', 'VERIFIED: graphql-ws natural auto-reconnection succeeded with verified wait threshold', {
      tDrop,
      reconnectedAt,
      measuredRetryWaitMs,
      minimumRequiredThresholdMs: 1300,
      exceedsMinimumExpectedWait: true,
    });

    // Send second message from A to B post-reconnection to verify channel recovery
    logEvent('RT-05', 'Session A sending 2nd message post-reconnection to verify channel recovery');
    const sendResult2 = await httpGraphQl(
      sendMutation,
      {
        receiverId: sessionB.id,
        content: 'Segundo mensaje post-reconexion live (Canal recuperado)',
      },
      sessionA.token
    );
    const sentMsg2 = sendResult2.sendMessage;
    assert(sentMsg2?.id, 'sendMessage 2 did not return a valid message id');

    const tDelivery2Start = Date.now();
    while (bReceivedMessages.length < 2 && Date.now() - tDelivery2Start < 8000) {
      await new Promise((r) => setTimeout(r, 50));
    }

    assert(bReceivedMessages.length >= 2, 'Message 2 was not delivered post-reconnection to Session B within 8s deadline');
    assert(
      bReceivedMessages[1].id === sentMsg2.id,
      `Message 2 ID mismatch: expected ${sentMsg2.id}, received ${bReceivedMessages[1].id}`
    );
    assert(
      bReceivedMessages[1].content === sentMsg2.content,
      `Message 2 content mismatch: expected '${sentMsg2.content}', received '${bReceivedMessages[1].content}'`
    );

    logEvent('RT-05', 'VERIFIED: Message 2 delivered post-reconnection on recovered channel', {
      messageId: bReceivedMessages[1].id,
      matches: true,
    });

    // Re-verify Observer C at end of test window to confirm absence of late leaked frames
    assert(!cSubscriptionError, `Observer C subscription experienced an error during test window: ${cSubscriptionError}`);
    assert(
      cReceivedFrames.length === 0,
      `Late topic isolation breach: Observer C received ${cReceivedFrames.length} frames at end of test window`
    );

    // Step 8: RT-06 Transport Identity Resolution by Token (me Query)
    logEvent('RT-06', 'Resolving identity for Session C via me query with existing Bearer token (teardown occurs in finally)');
    const meQuery = `query Me { me { id email role } }`;
    const meResultC = await httpGraphQl(meQuery, {}, sessionC.token);
    assert(meResultC?.me?.id === sessionC.id, `Re-authenticated user ID mismatch: expected ${sessionC.id}, got ${meResultC?.me?.id}`);
    assert(meResultC?.me?.id !== sessionA.id, `Transport identity leak: Session C resolved to Session A ID ${sessionA.id}`);
    assert(meResultC?.me?.role === 'Moderador', `Re-authenticated user role mismatch: expected Moderador, got ${meResultC?.me?.role}`);

    logEvent('RT-06', 'VERIFIED: Identity resolution for Session C confirmed without identity mixture (Note: Interactive UI logout & Apollo in-memory cache purge belong to the browser UI domain)', {
      currentUserId: meResultC.me.id,
      currentUserRole: meResultC.me.role,
      matchesExpectedUserC: true,
    });

    logEvent('DONE', 'ALL TRANSPORT REALTIME DIMENSIONS PASSED WITH STRICT ASSERTIONS');

    return {
      verdict: 'PASS',
      measuredRetryWaitMs,
      eventsCount: traceEvents.length,
      traceEvents,
    };
  } finally {
    // Guaranteed teardown in finally block
    if (unsubB) {
      try { unsubB(); } catch (_) {}
    }
    if (unsubC) {
      try { unsubC(); } catch (_) {}
    }
    if (clientB) {
      try { clientB.dispose(); } catch (_) {}
    }
    if (clientC) {
      try { clientC.dispose(); } catch (_) {}
    }
  }
}

run()
  .then((res) => {
    console.log('\n================================================================');
    console.log('CF-05 TRANSPORT EXECUTION VERDICT: 100% PASS');
    console.log(`Measured graphql-ws Natural Retry Delay: ${res.measuredRetryWaitMs} ms (threshold >= 1300 ms: PASS)`);
    console.log('Database Persistence Re-Read Verification: PASS');
    console.log('Strict Assertions Evaluated: All passed');
    console.log('================================================================');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[FATAL ERROR / ASSERTION FAILURE IN CF-05 RUNNER]:');
    console.error(err.message || err);
    process.exit(1);
  });
