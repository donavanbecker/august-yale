## [1.2.1](https://github.com/homebridge-plugins/august-yale/compare/v1.2.0...v1.2.1) (2026-04-30)


### Features

* add August.resetTransport() for connectivity recovery ([#44](https://github.com/homebridge-plugins/august-yale/issues/44)) ([e4ce788](https://github.com/homebridge-plugins/august-yale/commit/e4ce788dfcfbb68fc01d1f86c25eb35d0a0ed280))



# [1.2.0](https://github.com/homebridge-plugins/august-yale/compare/v1.1.8...v1.2.0) (2026-04-29)


### Features

* typed transport-error wrapper (NetworkError, AbortedError) ([#43](https://github.com/homebridge-plugins/august-yale/issues/43)) ([748481a](https://github.com/homebridge-plugins/august-yale/commit/748481ae6e9867d3addaa601c905a408e57d875c))



## [1.1.8](https://github.com/homebridge-plugins/august-yale/compare/v1.1.7...v1.1.8) (2026-04-26)


### Bug Fixes

* support Node 20, undici 7 ([#42](https://github.com/homebridge-plugins/august-yale/issues/42)) ([874cb51](https://github.com/homebridge-plugins/august-yale/commit/874cb51dd598596d1908f299e67b711012cea6d1))



# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/)

## [1.1.7](https://github.com/homebridge-plugins/august-yale/compare/v1.1.6...HEAD) (Unreleased)

### Bug Fixes

* Use scoped undici dispatcher to prevent stale connection pool ([#37](https://github.com/homebridge-plugins/august-yale/issues/37)) ([f9815dc](https://github.com/homebridge-plugins/august-yale/commit/f9815dc))
* Native fetch and modernize codebase ([#32](https://github.com/homebridge-plugins/august-yale/issues/32)) ([3942fa2](https://github.com/homebridge-plugins/august-yale/commit/3942fa2))

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.6...v1.1.7

## [1.1.6](https://github.com/homebridge-plugins/august-yale/compare/v1.1.5...v1.1.6) (2026-04-15)


### Bug Fixes

* properly manage PubNub instance lifecycle in subscribe() ([#31](https://github.com/homebridge-plugins/august-yale/issues/31)) ([dce527e](https://github.com/homebridge-plugins/august-yale/commit/dce527eaf3f619909bffe08b8ff5de0d3ce95446))

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.5...v1.1.6

## [1.1.5](https://github.com/homebridge-plugins/august-yale/compare/v1.1.4...v1.1.5) (2026-04-11)

### Bug Fixes

* Add configurable request timeout to prevent API calls from hanging indefinitely ([#30](https://github.com/homebridge-plugins/august-yale/issues/30)) ([ebc21d5](https://github.com/homebridge-plugins/august-yale/commit/ebc21d5))

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.4...v1.1.5

## [1.1.4](https://github.com/homebridge-plugins/august-yale/releases/tag/v1.1.4) (2025-09-18)

## What's Changed
* Add comprehensive Yale/August API endpoints and brand support - Production Ready v1.2.0  by @Copilot in https://github.com/homebridge-plugins/august-yale/pull/24

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.3...v1.1.4

## [1.2.0](https://github.com/homebridge-plugins/august-yale/tag/v1.2.0) (2024-12-15)

### What's Changed

#### ✨ Major New Features
- **Extended Brand Support**: Added support for 5 Yale/August brands (`august`, `yale_access`, `yale_home`, `yale_global`, `yale_august`)
- **Comprehensive API Coverage**: Implemented 20+ new endpoints matching YaleXS reference library
- **WebSocket Subscriptions**: Real-time event streaming support
- **Async Operations**: Non-blocking lock operations with PubNub integration
- **Custom Exception Classes**: Better error handling with `YaleApiError`, `InvalidAuth`, `BridgeError`, etc.

#### 🏠 New Endpoints
- **Houses**: `houses()`, `houseDetails()`, `houseActivities()`, `houseTemperature()`
- **Users**: `user()` profile management
- **Doorbells**: `doorbells()`, `doorbellDetails()`, `wakeupDoorbell()`
- **Alarms**: `alarms()`, `alarmDevices()`, `setAlarmState()`
- **Advanced Lock Features**: `unlatch()`, `pins()`, `capabilities()`
- **WebSocket**: `addWebSocketSubscription()`, `getWebSocketSubscriptions()`, `deleteWebSocketSubscription()`
- **Async Operations**: `lockAsync()`, `unlockAsync()`, `unlatchAsync()`, `statusAsync()`

#### 🔧 Technical Improvements
- Brand-aware API configuration with automatic endpoint selection
- 28 comprehensive test cases with full TypeScript support
- Static and instance methods for all endpoints
- Session management with internal `_method()` variants
- Complete documentation with examples and error handling
- Updated endpoints.md with implementation status

#### 💥 Breaking Changes
- None - Full backward compatibility maintained
- New `brand` configuration option (optional)

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.3...v1.2.0

## [1.1.3](https://github.com/homebridge-plugins/august-yale/tag/v1.1.3) (2025-09-02)

### What's Changed
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.2...v1.1.3

## [1.1.2](https://github.com/homebridge-plugins/august-yale/tag/v1.1.2) (2025-03-04)

# *No New Releases During Lent*

### What's Changed
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.1...v1.1.2

## [1.1.1](https://github.com/homebridge-plugins/august-yale/tag/v1.1.1) (2024-11-03)

### What's Changed
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.1.0...v1.1.1

## [1.1.0](https://github.com/homebridge-plugins/august-yale/tag/v1.1.0) (2024-07-26)

### What's Changed
- Added `locking` and `unlocking` to `addSimpleProps`
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.0.1...v1.1.0

## [1.0.1](https://github.com/homebridge-plugins/august-yale/tag/v1.0.1) (2024-05-25)

### What's Changed
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.0.0...v1.0.1

## [1.0.0](https://github.com/homebridge-plugins/august-yale/tag/v1.0.0) (2024-05-07)

### What's Changed
- Add: concurrent session requests eliminated, Thanks [@joeybaker](https://github.com/joeybakerThanks), [#6](https://github.com/homebridge-plugins/august-yale/pull/6)
- Fix: let fetch errors bubble up, Thanks [@joeybaker](https://github.com/joeybakerThanks), [#5](https://github.com/homebridge-plugins/august-yale/pull/5)
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v0.2.0...v1.0.0

## [0.2.0](https://github.com/homebridge-plugins/august-yale/tag/v0.2.0) (2024-01-30)

### What's Changed
- Corrected Issue with lock details

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v0.1.0...v0.2.0

## [0.1.0](https://github.com/homebridge-plugins/august-yale/tag/v0.1.0) (2024-01-28)

### What's Changed
- Initial Release
