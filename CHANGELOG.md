## [1.2.5](https://github.com/homebridge-plugins/august-yale/compare/v1.2.4...v1.2.5) (2026-07-22)


### Bug Fixes

* **setup:** fall back to the region default api key for august accounts instead of pinning the yale key, which August rejects for US accounts ([#238](https://github.com/homebridge-plugins/august-yale/issues/238)) ([2669093](https://github.com/homebridge-plugins/august-yale/commit/2669093a75fe0d073510e331ef1ed7466e11f933))



## [1.2.3](https://github.com/homebridge-plugins/august-yale/compare/v1.2.2...v1.2.3) (2026-07-18)



## 1.2.3-beta.2 (2026-07-17)


### Bug Fixes

* **setup:** default the api key and pubnub key from the account brand ([fbd30a6](https://github.com/homebridge-plugins/august-yale/commit/fbd30a6e487497822c214ffbe21aa818d0f6f163))

**Full Changelog**: https://github.com/homebridge-plugins/august-yale/compare/v1.2.3-beta.2...v1.2.3

## 1.2.3-beta.1 (2026-07-16)


### Bug Fixes

* **session:** send the brand's branding header so yale-hosted accounts can validate ([314f117](https://github.com/homebridge-plugins/august-yale/commit/314f117c89ec99462f910737588b70a5d81eaea3))



## 1.2.3-beta.0 (2026-07-16)


### Bug Fixes

* **setup:** keep the brand option so brand-specific api urls are actually used ([d41ddf7](htt## [1.2.2](https://github.com/homebridge-plugins/august-yale/compare/v1.2.1...v1.2.2) (2026-05-03)


### Bug Fixes

* **session:** rejected sessions no longer poison future calls ([#45](https://github.com/homebridge-plugins/august-yale/issues/45)) ([6c65b83](https://github.com/homebridge-plugins/august-yale/commit/6c65b83566efb254dca8ee82aecd9f2dad413352))



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
