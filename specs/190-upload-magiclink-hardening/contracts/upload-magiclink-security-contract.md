# Contract: Upload Inspection and Magic Link Throttling

## Upload Endpoint

`POST /api/upload` remains authenticated multipart/form-data.

### Accepted Response

The existing success shape remains:

~~~json
{
  "fileUrl": "/uploads/generated-name.pdf",
  "originalFileName": "material.pdf",
  "contentType": "application/pdf",
  "size": 1024
}
~~~

### Rejection Contract

- empty/size/name validation: HTTP 400;
- unsupported extension/MIME: HTTP 400;
- signature/package mismatch: HTTP 400 with a generic Spanish message;
- cancellation: request cancellation propagates;
- unexpected parser/storage failure: sanitized server error through existing middleware.

The response never contains parser stack traces or file bytes.

## Magic Link GraphQL Contract

Spec 190 preserves operation names and success payloads; Spec 192 changes credential delivery.

### Throttle Dimensions

| Operation | Buckets |
|---|---|
| `requestMagicLink` | trusted client source + normalized-email fingerprint |
| `loginWithMagicLink` | trusted client source + token fingerprint |

### Denial

- stable GraphQL code: `AUTH_RATE_LIMITED`;
- generic Spanish message;
- optional retry duration, never account/token data;
- no database create/read/consume after an early throttle denial.

## Configuration Contract

Limits and windows are configuration-bound and validated at startup. Production with a configured shared provider must not silently fall back to unlimited operation. Development/test may use the bounded in-memory provider.

