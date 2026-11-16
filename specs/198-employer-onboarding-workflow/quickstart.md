# Quickstart

1. Apply `AddEmployerOnboardingWorkflow`.
2. Run backend/frontend automated suites and builds.
3. Open `/empleos/solicitud` and submit a valid CUIT/company request.
4. Authenticate as Administrator and open `Solicitudes de Empleadores`.
5. Approve once and verify Pending delivery, one Employer account and one Outbox row.
6. Wait for pickup/Mailpit delivery and verify status becomes Delivered.
7. Consume the welcome link once; verify replay is rejected.
8. Force delivery failure and verify account remains approved with Failed status.
9. Use Admin resend and verify no duplicate account/request is created.
10. Record real results in `evidence.md`; do not claim production SMTP from Mailpit.
