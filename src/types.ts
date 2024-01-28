/* Copyright(C) 2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * types.ts: august-yale API registration.
 */
export type config = {
    apiKey?: string,
    pnSubKey?: string
    installId?: string,
    password?: string,
    augustId?: string,
    countryCode?: string,
}

export type AugustLockStatus = {
    // From August
    status: string,
    info: info,
    doorState: string,
    retryCount: number,
    totalTime: number,
    resultsFromOperationCache: boolean,
    state: {
        locked: boolean,
        unlocked: boolean,
        open: boolean,
        closed: boolean
    },
    lockID: string
}

export type info = {
    action: 'status',
    startTime: Date,
    context: {
        transactionID: string,
        startDate: Date,
        retryCount: number
    },
    lockType: string,
    serialNumber: string,
    rssi: number,
    wlanRSSI: number,
    wlanSNR: number,
    duration: number,
    lockID: string,
    bridgeID: string,
    serial: string
}

export type AugustLockDetails = {
    LockName: string,
    Type: number,
    Created: Date,
    Updated: Date,
    LockID: string,
    HouseID: string,
    HouseName: string,
    Calibrated: boolean,
    timeZone: string,
    battery: BatteryLevel,
    batteryInfo: batteryInfo,
    supportsEntryCodes: boolean,
    remoteOperateSecret: string,
    HomeKitSetupPayload: string,
    skuNumber: string
    macAddress: string,
    SerialNumber: string,
    LockStatus: LockStatus,
    currentFirmwareVersion: string,
    homeKitEnabled: boolean,
    zWaveEnabled: boolean,
    isGalileo: boolean,
    Bridge: Bridge,
    OfflineKeys: OfflineKeys,
    parametersToSet: object,
    users: users,
    pubsubChannel: string,
    ruleHash: object,
    cameras: Array<any>,
    geofenceLimits: geofenceLimits,
}

export type batteryInfo = {
    level: BatteryLevel,
    warningState: string,
    infoUpdatedDate: Date,
    lastChangeDate: Date,
    lastChangeVoltage: number
}

export type LockStatus = {
    status: string,
    dateTime: Date,
    isLockStatusChanged: boolean,
    valid: boolean,
    doorState: string,
}

export type Bridge = {
    _id: string,
    mfgBridgeID: string,
    deviceModel: string,
    firmwareVersion: string,
    operative: boolean,
    status: {
        current: string,
        lastOffline: Date,
        updated: Date,
        lastOnline: Date,
    },
    locks: [{
        _id: string,
        LockID: string,
        macAddress: string
    }],
    hyperBridge: boolean
}

export type OfflineKeys = {
    created: [AugustOfflineKey],
    loaded: [AugustOfflineKey],
    deleted: [AugustOfflineKey],
    createdhk: [AugustOfflineKey]
}

export type UserID = string;

export type users = {
    [key: UserID]: AugustUser,
}

export type geofenceLimits = {
    ios: ios
}

export type ios = {
    debounceInterval: number,
    gpsAccuracyMultiplier: number,
    maximumGeofence: number,
    minimumGeofence: number,
    minGPSAccuracyRequired: number
}

export type BatteryLevel = number

export type AugustOfflineKey = {
    created: Date,
    key: string,
    slot: number,
    UserID: string
  }

export type AugustUser = {
    UserType: string,
    FirstName: string,
    LastName: string,
    identifiers: Array<any>
}
