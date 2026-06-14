import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../../FrontEnd/OneItb-FE/package.json', import.meta.url),
);
const { createClient } = require('graphql-ws');

const httpUrl = process.env.GRAPHQL_HTTP_URL ?? 'http://127.0.0.1:5104/graphql';
const wsUrl = process.env.GRAPHQL_WS_URL ?? 'ws://127.0.0.1:5104/graphql';
const password = 'Test1234!';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function execute(query, variables = {}, token = null) {
  const response = await fetch(httpUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  return { response, payload };
}

async function login(email) {
  const { payload } = await execute(
    `mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        id
        role
        isAuthenticated
      }
    }`,
    { input: { email, password } },
  );
  assert(!payload.errors, `Login failed for ${email}: ${JSON.stringify(payload.errors)}`);
  assert(payload.data.login.isAuthenticated, `Login was rejected for ${email}`);
  return payload.data.login;
}

function subscribe(token, onMessage) {
  let connectedResolve;
  let connectedReject;
  const connected = new Promise((resolve, reject) => {
    connectedResolve = resolve;
    connectedReject = reject;
  });

  const client = createClient({
    url: wsUrl,
    webSocketImpl: WebSocket,
    lazy: true,
    retryAttempts: 0,
    connectionParams: token ? { authorization: `Bearer ${token}` } : {},
    on: {
      connected: connectedResolve,
      closed: (event) => {
        if (event.code !== 1000) {
          connectedReject(new Error(`Socket closed ${event.code}: ${event.reason}`));
        }
      },
      error: connectedReject,
    },
  });

  const disposeSubscription = client.subscribe(
    {
      query: `subscription MessageReceived {
        messageReceived {
          id
          senderId
          receiverId
          content
          sentAt
          isRead
        }
      }`,
    },
    {
      next: ({ data, errors }) => {
        if (errors) {
          connectedReject(new Error(JSON.stringify(errors)));
          return;
        }
        onMessage(data.messageReceived);
      },
      error: connectedReject,
      complete: () => {},
    },
  );

  return {
    client,
    connected,
    dispose() {
      disposeSubscription();
      client.dispose();
    },
  };
}

function waitForMessage(messages, expectedContent, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const timer = setInterval(() => {
      const message = messages.find((item) => item.content === expectedContent);
      if (message) {
        clearInterval(timer);
        resolve(message);
      } else if (Date.now() >= deadline) {
        clearInterval(timer);
        reject(new Error(`Timed out waiting for message: ${expectedContent}`));
      }
    }, 25);
  });
}

async function expectRejectedSocket() {
  const socket = subscribe(null, () => {});
  try {
    await Promise.race([
      socket.connected.then(() => {
        throw new Error('Unauthenticated socket was accepted');
      }),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (error) {
    assert(
      /Socket closed|Autenticaci|4401|4403|4500/.test(error.message),
      `Unexpected unauthenticated socket result: ${error.message}`,
    );
    return true;
  } finally {
    socket.dispose();
  }
  throw new Error('Unauthenticated socket was not rejected');
}

const student = await login('student@itbeltran.com.ar');
const teacher = await login('teacher@itbeltran.com.ar');
const admin = await login('admin@itbeltran.com.ar');

const unauthorized = await execute(`query { messagingContacts(first: 1) { totalCount } }`);
assert(unauthorized.payload.errors?.length, 'Unauthenticated contacts query was accepted');

const contacts = await execute(
  `query Contacts {
    messagingContacts(first: 50) {
      nodes { userId firstName lastName role lastMessageAt unreadCount }
      totalCount
    }
  }`,
  {},
  student.token,
);
assert(!contacts.payload.errors, JSON.stringify(contacts.payload.errors));
assert(
  contacts.payload.data.messagingContacts.nodes.some(
    (contact) => contact.userId === teacher.id,
  ),
  'Teacher is missing from the student contact list',
);

await expectRejectedSocket();

const studentMessages = [];
const teacherMessages = [];
const adminMessages = [];
const studentSocket = subscribe(student.token, (message) => studentMessages.push(message));
const teacherSocket = subscribe(teacher.token, (message) => teacherMessages.push(message));
const adminSocket = subscribe(admin.token, (message) => adminMessages.push(message));

await Promise.all([
  studentSocket.connected,
  teacherSocket.connected,
  adminSocket.connected,
]);

const unique = Date.now();
const firstContent = `spec-104 student-to-teacher ${unique}`;
const sent = await execute(
  `mutation Send($receiverId: UUID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) {
      id senderId receiverId content sentAt isRead
    }
  }`,
  { receiverId: teacher.id, content: firstContent },
  student.token,
);
assert(!sent.payload.errors, JSON.stringify(sent.payload.errors));

const [studentEvent, teacherEvent] = await Promise.all([
  waitForMessage(studentMessages, firstContent),
  waitForMessage(teacherMessages, firstContent),
]);
assert(studentEvent.id === sent.payload.data.sendMessage.id, 'Sender event ID differs');
assert(teacherEvent.id === sent.payload.data.sendMessage.id, 'Receiver event ID differs');
await new Promise((resolve) => setTimeout(resolve, 300));
assert(adminMessages.length === 0, 'Unrelated user received a private message');

const teacherContacts = await execute(
  `query Contacts {
    messagingContacts(first: 50) {
      nodes { userId unreadCount }
    }
  }`,
  {},
  teacher.token,
);
const studentContact = teacherContacts.payload.data.messagingContacts.nodes.find(
  (contact) => contact.userId === student.id,
);
assert(studentContact?.unreadCount >= 1, 'Unread count did not increase');

const marked = await execute(
  `mutation Mark($otherUserId: UUID!) {
    markConversationRead(otherUserId: $otherUserId) {
      otherUserId
      markedCount
    }
  }`,
  { otherUserId: student.id },
  teacher.token,
);
assert(!marked.payload.errors, JSON.stringify(marked.payload.errors));
assert(marked.payload.data.markConversationRead.markedCount >= 1, 'Message was not marked read');

const emptyMessage = await execute(
  `mutation Send($receiverId: UUID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) { id }
  }`,
  { receiverId: teacher.id, content: '   ' },
  student.token,
);
assert(emptyMessage.payload.errors?.length, 'Empty message was accepted');

const selfMessage = await execute(
  `mutation Send($receiverId: UUID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) { id }
  }`,
  { receiverId: student.id, content: 'self message' },
  student.token,
);
assert(selfMessage.payload.errors?.length, 'Self message was accepted');

studentSocket.dispose();
const secondContent = `spec-104 offline-delivery ${unique}`;
const secondSent = await execute(
  `mutation Send($receiverId: UUID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) { id content }
  }`,
  { receiverId: student.id, content: secondContent },
  teacher.token,
);
assert(!secondSent.payload.errors, JSON.stringify(secondSent.payload.errors));

const reconnectedStudentMessages = [];
const reconnectedStudent = subscribe(student.token, (message) =>
  reconnectedStudentMessages.push(message),
);
await reconnectedStudent.connected;

const conversation = await execute(
  `query Conversation($otherUserId: UUID!) {
    conversation(otherUserId: $otherUserId, first: 50) {
      nodes { id senderId receiverId content sentAt isRead }
      totalCount
    }
  }`,
  { otherUserId: teacher.id },
  student.token,
);
assert(!conversation.payload.errors, JSON.stringify(conversation.payload.errors));
assert(
  conversation.payload.data.conversation.nodes.some(
    (message) => message.content === secondContent,
  ),
  'Message sent while disconnected was not persisted',
);

reconnectedStudent.dispose();
teacherSocket.dispose();
adminSocket.dispose();

console.log(
  JSON.stringify(
    {
      passed: true,
      users: {
        student: student.id,
        teacher: teacher.id,
        admin: admin.id,
      },
      assertions: {
        authenticatedQueries: true,
        unauthenticatedQueryRejected: true,
        unauthenticatedSocketRejected: true,
        senderAndReceiverRealtimeDelivery: true,
        unrelatedTopicIsolation: true,
        unreadAndMarkRead: true,
        invalidMessagesRejected: true,
        persistedWhileDisconnected: true,
      },
      persistedMessageIds: [
        sent.payload.data.sendMessage.id,
        secondSent.payload.data.sendMessage.id,
      ],
    },
    null,
    2,
  ),
);
