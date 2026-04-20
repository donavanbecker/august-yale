/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * types.ts: august-yale API registration.
 */
export interface config {
  apiKey?: string
  pnSubKey?: string
  installId?: string
  password?: string
  augustId?: string
  countryCode?: string
  brand?: string
  /**
   * Request timeout in milliseconds. Defaults to 30000 (30 seconds).
   * API calls that exceed this duration will reject with a TimeoutError.
   */
  timeout?: number
}

export interface AugustLockStatus {
  // From August
  status: string
  info: info
  doorState: string
  retryCount: number
  totalTime: number
  resultsFromOperationCache: boolean
  state: {
    locked: boolean
    unlocked: boolean
    open: boolean
    closed: boolean
  }
  lockID: string
}

export interface info {
  action: 'status'
  startTime: Date
  context: {
    transactionID: string
    startDate: Date
    retryCount: number
  }
  lockType: string
  serialNumber: string
  rssi: number
  wlanRSSI: number
  wlanSNR: number
  duration: number
  lockID: string
  bridgeID: string
  serial: string
}

export interface AugustLockDetails {
  LockName: string
  Type: number
  Created: Date
  Updated: Date
  LockID: string
  HouseID: string
  HouseName: string
  Calibrated: boolean
  timeZone: string
  battery: BatteryLevel
  batteryInfo: batteryInfo
  supportsEntryCodes: boolean
  remoteOperateSecret: string
  HomeKitSetupPayload: string
  skuNumber: string
  macAddress: string
  SerialNumber: string
  LockStatus: LockStatus
  currentFirmwareVersion: string
  homeKitEnabled: boolean
  zWaveEnabled: boolean
  isGalileo: boolean
  Bridge: Bridge
  OfflineKeys: OfflineKeys
  parametersToSet: object
  users: users
  pubsubChannel: string
  ruleHash: object
  cameras: any[]
  geofenceLimits: geofenceLimits
}

export interface batteryInfo {
  level: BatteryLevel
  warningState: string
  infoUpdatedDate: Date
  lastChangeDate: Date
  lastChangeVoltage: number
}

export interface LockStatus {
  status: string
  dateTime: Date
  isLockStatusChanged: boolean
  valid: boolean
  doorState: string
}

export interface Bridge {
  _id: string
  mfgBridgeID: string
  deviceModel: string
  firmwareVersion: string
  operative: boolean
  status: {
    current: string
    lastOffline: Date
    updated: Date
    lastOnline: Date
  }
  locks: [{
    _id: string
    LockID: string
    macAddress: string
  }]
  hyperBridge: boolean
}

export interface OfflineKeys {
  created: [AugustOfflineKey]
  loaded: [AugustOfflineKey]
  deleted: [AugustOfflineKey]
  createdhk: [AugustOfflineKey]
}

export type UserID = string

export interface users {
  [key: UserID]: AugustUser
}

export interface geofenceLimits {
  ios: ios
}

export interface ios {
  debounceInterval: number
  gpsAccuracyMultiplier: number
  maximumGeofence: number
  minimumGeofence: number
  minGPSAccuracyRequired: number
}

export type BatteryLevel = number

export interface AugustOfflineKey {
  created: Date
  key: string
  slot: number
  UserID: string
}

export interface AugustUser {
  UserType: string
  FirstName: string
  LastName: string
  identifiers: any[]
}
