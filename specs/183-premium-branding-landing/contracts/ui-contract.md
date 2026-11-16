# UI Contract: OneITB Brand and Landing

## BrandLogo

- Supports `symbol` and `full` variants.
- Uses transparent approved assets for runtime UI.
- Requires an accessible alternative label unless explicitly decorative.
- Accepts layout classes without exposing raw asset decisions to consumers.

## RevealOnScroll

- Renders semantic caller content without changing its document order.
- Reveals once when entering the configured viewport threshold.
- Exposes content immediately for reduced motion or unsupported observers.
- Disconnects on reveal and unmount.

## Landing

- Provides `/login` and `/register` calls to action.
- Does not issue business-data requests.
- Inherits the current ThemeContext through root `dark` selectors.
- Does not intercept pointer events with decorative layers.

## Header

- Symbol link target remains `/`.
- Authenticated search and navigation behavior remains unchanged.
- Spotlight and scroll presentation cannot block clicks.

