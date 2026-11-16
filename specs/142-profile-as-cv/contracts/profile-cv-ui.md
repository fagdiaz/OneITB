# UI Contract: Profile as a CV

## Route Contract

- `/profile`: shows the logged-in user's CV profile and owner-only edit/private academic summary.
- `/profile/{id}`: shows another user's public CV profile and hides edit/private academic sections.

## Data Contract

The profile screen consumes:

- `publicProfile(userId)`:
  - `id`
  - `fullName`
  - `role`
  - `biography`
  - `linkedIn`
  - `facebook`
  - `instagram`
  - `phone`
  - `careers`
  - `totalPublications`
- `inquiries(...)`:
  - public activity authored by the profile user.
- `myAcademicProgress`:
  - owner-only academic status summary.

## Visual Contract

- Hero section uses a large avatar and role badge.
- Professional profile section treats biography as CV summary.
- Contact/social links are rendered as icon cards.
- Education/trayectoria displays careers, subjects from activity and owner-only progress when allowed.
- Edit action is not rendered for non-owner profile views.
