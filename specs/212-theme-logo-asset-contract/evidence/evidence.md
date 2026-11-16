# Evidence: Theme Logo Asset Contract

| Check | Result | Evidence |
|---|---|---|
| Focused branding/Header tests | PASS | 3 files, 9/9 tests |
| Full frontend tests | PASS | 55 files, 225/225 tests |
| Frontend build | PASS | Vite 8.0.16, 560 modules, 793 ms |
| Static consumer audit | PASS | Header is symbol-only; full surfaces share the themed asset; no DOM wordmark/filter remains |
| Browser light-theme smoke | PASS | Landing at 127.0.0.1:5173: symbol-only Header and original complete logo visible without overflow |
| Automated dark-theme source switch | PASS | `logo-oneitb.png` changes to `logo-oneitb-dark-mode.png` through `effectiveTheme` |
| Manual dark/responsive QA | Pending | Inspect Hero, identity, onboarding and both footers at 320/768/1440 px before `[V]` |

## Notes

- The dark PNG contributes a 3.41 MB emitted asset. This is the approved source image,
  not a generated duplicate; optimization would require an explicit asset-quality pass.
- After the first browser pass, the proportional viewport was increased from 56/112 px
  to 64/128 px at desktop sizes so the visible mark fits without clipping its upper edge.
- No backend, GraphQL, EF Core or authorization checks were required by this visual-only
  change.
