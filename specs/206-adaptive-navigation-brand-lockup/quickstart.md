# Quickstart: Adaptive Navigation and Brand Lockup

## Automated

1. Run focused Nav/Header/Brand component tests.
2. Simulate widths immediately below/above each overflow threshold.
3. Run the complete frontend suite and Vite build.

## Browser Matrix

For Student, Employer and Admin, test 320, 375, 768, split-screen, 1024, 1280 and 1440
pixels. At each width verify:

- no horizontal scroll or overlap;
- direct links fill available space before overflow appears;
- every overflow item is keyboard reachable;
- route glow and unread badges remain correct;
- symbol and `oneITB` stay aligned;
- dark mode is readable without bloom.

