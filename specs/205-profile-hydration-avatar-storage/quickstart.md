# Quickstart: Profile Hydration and Avatar Storage

## Automated

1. Run focused profile editor and avatar tests.
2. Run storage service/controller tests.
3. Run complete frontend/backend suites and production builds.
4. Search tracked files and output for Cloudinary credentials.

## Browser Acceptance

1. Use network throttling and open `/profile/edit`; expect a skeleton, then one stable
   hydration with full institutional name.
2. Type before a background refetch; verify the edit remains.
3. Save without changing the avatar; verify it remains after refresh.
4. Upload/crop a new avatar; verify progress, save and same image on profile/edit refresh.
5. Simulate upload failure; verify prior avatar and other fields are preserved.
6. Record whether the returned URL is local fallback or verified Cloudinary. Do not infer
   cloud readiness from a successful local upload.

