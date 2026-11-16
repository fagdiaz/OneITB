# Upload API contract

## POST `/api/upload`

- Authentication: Bearer JWT required.
- Content type: `multipart/form-data`.
- Field: `file`, exactly one file.
- Maximum size: 15 MB.
- Allowed extensions: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.zip`.

### Success `200 OK`

```json
{
  "fileUrl": "/uploads/8f24d03d5f70429aa5af56a90ff06641.pdf"
}
```

### Errors

- `400`: missing, empty, oversized, or disallowed file.
- `401`: missing or invalid JWT.
- `500`: unexpected storage failure, without exposing the physical path.

## GraphQL `addInquiry`

Adds optional argument `fileUrl: String` and returns `fileUrl`. The value must originate from the upload endpoint when an attachment is selected.
