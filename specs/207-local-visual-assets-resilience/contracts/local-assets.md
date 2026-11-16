# Contract: Local Visual Assets

## Allowed Core Sources

- Vite-imported files under `src/assets`.
- Static public assets owned by OneITB.
- Operating-system font stack.

## Disallowed Core Sources

- Google Fonts and `fonts.gstatic.com`.
- cdnjs-hosted Font Awesome.
- Runtime icon/font downloads required for navigation or authentication.

## Accessibility

Icons remain decorative when adjacent text provides the label. Icon-only controls retain
an explicit `aria-label`. Missing webfonts must not erase the only accessible name.

