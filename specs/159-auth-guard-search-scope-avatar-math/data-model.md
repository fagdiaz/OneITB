# Data Model: Spec 159

No new persisted entities or database migrations.

## Existing Entities Used

### User

- `Id: Guid`
- `Role: string`
- `UserCareers: ICollection<UserCareer>`

Usage: determines authenticated user's career scope and role bypass for Admin/Moderador.

### UserCareer

- `UserId: Guid`
- `CareerId: int`

Usage: many-to-many enrollment scope for visible inquiries.

### Inquiry

- `UserId: Guid`
- `SubjectId: int`
- `Subject: Subject`
- `Comments: ICollection<Comment>`

Usage: feed/search/profile publication item. Visibility is restricted by `Inquiry.Subject.CareerId`.

### Subject

- `Id: int`
- `CareerId: int`

Usage: publication career scope and subject filter.

### Comment

- `InquiryId: Guid`
- `UserId: Guid`
- `Content: string`

Usage: searchable child content; comments do not independently widen visibility beyond their parent inquiry.

## UI State Models

### Search Subject Filter State

```ts
type SubjectFilterState = {
  allSubjects: boolean;
  selectedSubjectIds: number[];
}
```

Rules:
- `allSubjects === true` implies `selectedSubjectIds.length === 0`.
- Selecting any explicit subject sets `allSubjects` to `false`.
- Selecting `Todas` clears `selectedSubjectIds`.

### Avatar Editor State

```ts
type AvatarEditorState = {
  zoom: number;      // 0.1..3
  rotation: number;
  fineRotation: number;
  flipH: boolean;
  flipV: boolean;
  offset: { x: number; y: number };
  brightness: number;
  contrast: number;
  saturation: number;
  vignette: number;
}
```

Rules:
- Offset is applied in canvas pixel coordinates after translation to center and before image draw.
- Crop mask is square.
- Exported file remains JPEG and uploads through existing `uploadAttachment`.
