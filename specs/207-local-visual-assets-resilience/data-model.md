# Asset Model: Local Visual Asset Resilience

No backend, GraphQL or database changes are required.

## Asset Sources

| Asset | Current | Target |
|---|---|---|
| Inter | Google Fonts in HTML and CSS | System stack or reviewed local WOFF2 |
| Font Awesome | cdnjs 6.6.0 | Repository-local CSS and WOFF2 |
| Favicon | Vite default SVG | OneITB local asset |
| Core logos | Repository PNG assets | Repository assets via Vite imports |

## Runtime Invariant

Essential visual identity, text and navigation icons remain usable with external network
access disabled.

