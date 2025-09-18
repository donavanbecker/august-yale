import { describe, expect, it } from 'vitest'

import alarms, { alarmDevices, setAlarmState } from './alarms.js'

describe('alarms', () => {
  it('should export the alarm functions', () => {
    expect(alarms).toBeTypeOf('function')
    expect(alarmDevices).toBeTypeOf('function')
    expect(setAlarmState).toBeTypeOf('function')
  })
})
