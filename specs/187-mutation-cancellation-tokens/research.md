# Research: Mutation Cancellation Propagation

## Findings

- Mutation.cs has five direct parameterless SaveChangesAsync calls and related parameterless SingleOrDefaultAsync/ToListAsync calls.
- JobService demonstrates the desired pattern: public method token, EF calls with token, event sender with token.
- IUnitOfWork.CompleteAsync currently has no parameter; UsersService, AccountsService and MessagingService depend on it.
- AcademicService, NotificationService, ModerationService and portions of SocialService contain parameterless async EF operations used by mutations.
- HotChocolate binds a resolver CancellationToken from request cancellation without exposing it in the schema.

## Propagation Rule

The request token travels unchanged from resolver to service, repository/UnitOfWork, EF Core and cancellable side effects:

~~~text
HotChocolate resolver
  -> application service
     -> repository / DbContext
        -> EF Core async API
     -> event/email/notification API
~~~

Optional default tokens are acceptable only at boundaries also used by jobs/tests; resolvers must pass the real token explicitly.

## Exception Semantics

Catch filters for validation must not intercept OperationCanceledException. Broad catches around best-effort event publication should use:

~~~csharp
catch (Exception ex) when (ex is not OperationCanceledException)
~~~

Cancellation after a durable commit is inherently ambiguous to the client. The implementation must be idempotent where retry is possible and must not roll back an already committed transaction manually.

## Rejected Alternatives

- **Only change the five SaveChangesAsync calls**: leaves downstream service work uncancellable.
- **Create new CancellationTokenSource inside services**: disconnects from the HTTP request and may shorten valid work arbitrarily.
- **Convert cancellation to GraphQLException**: misclassifies transport lifecycle as business failure.
- **Cancel background jobs with request token**: background lifetime must use its own host token.

## Acceptance Research Gate

Before editing, create an inventory mapping every Mutation resolver to its service and terminal I/O call. This prevents inconsistent signature changes and compile-driven guesswork.
