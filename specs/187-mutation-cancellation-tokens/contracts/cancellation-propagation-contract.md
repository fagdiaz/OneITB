# Contract: Mutation Cancellation Propagation

## Resolver Contract

Each I/O-bound mutation accepts a final framework-bound CancellationToken and passes it to every cancellable dependency. Business GraphQL inputs and payloads remain unchanged.

Reference:

~~~csharp
[Authorize]
public Task<Payload> Mutate(
    Input input,
    [Service] IService service,
    CancellationToken cancellationToken)
    => service.ExecuteAsync(input, cancellationToken);
~~~

## Service Contract

- Async service methods accept CancellationToken as the final parameter.
- Repository and UnitOfWork methods accept and forward it.
- Non-HTTP callers may pass an explicit host/test token or CancellationToken.None.
- No method replaces the received token with a new unrelated source.

## Failure Contract

- Validation errors preserve existing GraphQL business codes.
- Cancellation propagates as cancellation, not USER_ERROR.
- Expected cancellation is not logged at Error severity.
- Unexpected EF/database errors continue through the centralized sanitized error pipeline.

## Compatibility

- GraphQL SDL does not change.
- Frontend documents do not add a cancellationToken variable.
- Persistence and notification ordering remain the same for non-cancelled requests.

## Verification

Schema inspection, static scan and state-based tests are all mandatory; a successful compile alone is insufficient.
