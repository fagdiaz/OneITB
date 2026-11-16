# Research: Microsoft Session Commit Stabilization

## Finding 1 - External warnings are non-causal

The CSP `unsafe-inline`, browser SSO, cookie partition, Quirks `Me.htm`, and OneCollector
telemetry messages originate from Microsoft pages. They do not represent OneITB GraphQL
or callback failures and must not be suppressed by changing OneITB security headers.

## Finding 2 - Redirect registration is no longer the blocker

Azure accepts the callback and the browser returns to the SPA. The former `AADSTS50011`
condition is therefore distinct from the current redirect-to-Login symptom.

## Finding 3 - Provider cleanup is ordered incorrectly

The canonical login boundary clears MSAL for every identity source. That is correct for a
password/employer login replacing a Microsoft identity, but incorrect while establishing
the Microsoft identity itself.

## Finding 4 - Awaiting a setter wrapper does not await React commit

`AuthContext.login` is asynchronous because it performs transport cleanup, but after its
state setters execute, its returned promise may resolve before consumers render the new
context. Navigating immediately can expose a protected guard to the previous state.

## Decision

Use a provider-aware session boundary and a render-observed commit handshake. Do not add
timeouts as the primary ordering mechanism, weaken guards, store delegated tokens, or
change the flow back to popup.

