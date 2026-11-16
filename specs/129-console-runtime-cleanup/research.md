# Research: Frontend Console Runtime Cleanup

## Console source ownership

- **Decision**: Classify `Drz51tb_-7c4W3yn1GpXoUJhhkELFPQUMd3_Ntwlua8.js`, nested `eval`, `Window.fullScreen`, and Firefox fingerprinting messages as browser/extension output.
- **Rationale**: The source is absent from the repository and Vite module graph; the messages describe browser privacy instrumentation.
- **Rejected**: Overriding console methods, because it hides real defects.

## Messaging startup

- **Decision**: Skip mini-chat subscription while collapsed; preserve full-chat subscription.
- **Rationale**: The collapsed widget creates `MessageReceived` during every authenticated page load.
- **Rejected**: Disabling WebSockets globally, because it breaks RF-015.

## Link preview security

- **Decision**: Use authenticated GraphQL with a bounded fetch service and validate every destination, including redirects.
- **Rationale**: The constitution permits REST only for upload/static files, and scheme-only checks do not prevent SSRF.
- **Rejected**: Anonymous route renaming, because route names and missing credentials are not security controls.
