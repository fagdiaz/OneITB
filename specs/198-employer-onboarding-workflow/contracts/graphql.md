# GraphQL Contract

```graphql
input EmployerRequestInput {
  companyName: String!
  contactName: String!
  email: String!
  phone: String!
  taxId: String!
  comments: String
  privacyConsent: Boolean!
  website: String
}

type EmployerRequestSubmissionPayload {
  accepted: Boolean!
  referenceCode: String
  message: String!
}

type EmployerRequestActionPayload {
  request: EmployerRequest!
  accountCreated: Boolean!
  emailDeliveryStatus: EmployerEmailDeliveryStatus!
  message: String!
}

type EmployerRequestPage {
  items: [EmployerRequest!]!
  totalCount: Int!
  hasNextPage: Boolean!
  nextOffset: Int
}

submitEmployerRequest(input: EmployerRequestInput!): EmployerRequestSubmissionPayload!
employerRequests(status: EmployerRequestStatus, first: Int!, offset: Int!): EmployerRequestPage!
approveEmployerRequest(requestId: UUID!): EmployerRequestActionPayload!
rejectEmployerRequest(requestId: UUID!, reason: String!): EmployerRequestActionPayload!
resendEmployerWelcome(requestId: UUID!): EmployerRequestActionPayload!
```

Only `submitEmployerRequest` is public. All other operations require Administrator.

Stable error codes:

- `EMPLOYER_REQUEST_INVALID`
- `EMPLOYER_REQUEST_CONFLICT`
- `EMPLOYER_REQUEST_NOT_FOUND`
- `EMPLOYER_REQUEST_ALREADY_PROCESSED`
- `EMPLOYER_REQUEST_CONCURRENCY_CONFLICT`
- `EMPLOYER_WELCOME_DELIVERY_FAILED`
- `EMPLOYER_REQUEST_RATE_LIMITED`
