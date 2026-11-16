# Data Model: Enterprise Profile CV Normalization

## UserCvExperience

- `Id`: Guid primary key
- `UserId`: Guid required FK to `User`
- `Company`: required, max 200
- `Role`: required, max 200
- `StartDate`: optional, max 50
- `EndDate`: optional, max 50
- `Location`: optional, max 150
- `Description`: optional, max 2000
- `IsHidden`: required boolean
- `SortOrder`: required integer

## UserCvEducation

- `Id`, `UserId`, `Institution`, `Degree`, `StartDate`, `EndDate`, `Location`, `Description`, `IsHidden`, `SortOrder`

## UserCvProject

- `Id`, `UserId`, `Name`, `Role`, `StartDate`, `EndDate`, `Url`, `Description`, `IsHidden`, `SortOrder`

## UserCvSkill

- `Id`, `UserId`, `Name`, `Level`, `IsHidden`, `SortOrder`

## UserCvLanguage

- `Id`, `UserId`, `Name`, `Level`, `IsHidden`, `SortOrder`

## Relationships

- Every CV table has one required `UserId` FK to `Users`.
- All CV table FKs use `DeleteBehavior.Restrict`.
- Each table has an index on `(UserId, SortOrder)`.
