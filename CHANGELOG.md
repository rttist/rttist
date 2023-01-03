# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


[//]: # (## [1.0.0] - 2022-01-01)
[//]: # (### Added)
[//]: # (### Changed)

## [1.0.0-alpha.0] - 2022-01-01
### Breaking Changes
- `inline` metadata mode removed because of big amount of issues.
- `Type.fullName` removed, instead id is now string containing unique name of the type,
- `Type.baseType` removed in favor of `ClassType.extends`,
- `Type.interface` removed in favor of `ClassType.implements` collection, 
interface type has collection `InterfaceType.extends`,
- empty call of `getType()` returns `Type.Invalid` instead of `Type.Unknown`, like some other cases. `Type.Invalid` is new fallback value for error cases,
