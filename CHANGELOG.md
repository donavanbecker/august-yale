# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/)

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
