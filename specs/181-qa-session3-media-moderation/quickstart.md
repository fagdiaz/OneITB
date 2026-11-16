# Quickstart Validation: Spec 181

## Automated gates

1. Build backend Release and run service tests.
2. Verify EF model has no pending changes after migration.
3. Run targeted frontend component tests and production build.

## Runtime GraphQL smoke

1. Start Docker SQL, apply migration, and start the API.
2. Verify author attachment replacement persists.
3. Verify moderator cross-user edit returns `USER_ERROR`.
4. Verify moderation visibility hides content and creates an audit.
5. Verify a reply to a reply returns `USER_ERROR`.
6. Run reminder processing twice and verify no duplicate notification.

## Browser smoke

1. Publish YouTube plus images and PDF with an attachment cover.
2. Reload and verify cover, image keyboard navigation, and PDF fallback.
3. Edit publication and comment attachments.
4. Verify long-text expansion and unified reaction control.
5. Verify unread badges and notification-preferences dialog.
6. Record first-party console errors separately from provider/browser warnings.
