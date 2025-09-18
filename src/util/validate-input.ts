/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * validate-input.ts: Input validation utilities for production readiness.
 */

import { YaleApiError } from '../exceptions.js'

/**
 * Validate a lock ID parameter
 */
export function validateLockId(lockId: string): void {
  if (!lockId || typeof lockId !== 'string' || lockId.trim() === '') {
    throw new YaleApiError('Lock ID is required and must be a non-empty string')
  }

  // Basic format validation - lock IDs are typically UUIDs or similar hex strings
  if (!/^[A-F0-9-]+$/i.test(lockId)) {
    throw new YaleApiError('Lock ID format appears invalid')
  }
}

/**
 * Validate a house ID parameter
 */
export function validateHouseId(houseId: string): void {
  if (!houseId || typeof houseId !== 'string' || houseId.trim() === '') {
    throw new YaleApiError('House ID is required and must be a non-empty string')
  }
}

/**
 * Validate a doorbell ID parameter
 */
export function validateDoorbellId(doorbellId: string): void {
  if (!doorbellId || typeof doorbellId !== 'string' || doorbellId.trim() === '') {
    throw new YaleApiError('Doorbell ID is required and must be a non-empty string')
  }
}

/**
 * Validate an alarm ID parameter
 */
export function validateAlarmId(alarmId: string): void {
  if (!alarmId || typeof alarmId !== 'string' || alarmId.trim() === '') {
    throw new YaleApiError('Alarm ID is required and must be a non-empty string')
  }
}

/**
 * Validate a serial number parameter
 */
export function validateSerialNumber(serialNumber: string): void {
  if (!serialNumber || typeof serialNumber !== 'string' || serialNumber.trim() === '') {
    throw new YaleApiError('Serial number is required and must be a non-empty string')
  }
}

/**
 * Validate an arm state parameter for alarms
 */
export function validateArmState(armState: string): void {
  const validStates = ['arm_away', 'arm_stay', 'disarm']
  if (!armState || !validStates.includes(armState)) {
    throw new YaleApiError(`Arm state must be one of: ${validStates.join(', ')}`)
  }
}

/**
 * Validate a limit parameter for queries
 */
export function validateLimit(limit: number): void {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) {
    throw new YaleApiError('Limit must be an integer between 1 and 1000')
  }
}

/**
 * Validate subscriber ID for WebSocket operations
 */
export function validateSubscriberId(subscriberId: string): void {
  if (!subscriberId || typeof subscriberId !== 'string' || subscriberId.trim() === '') {
    throw new YaleApiError('Subscriber ID is required and must be a non-empty string')
  }
}
