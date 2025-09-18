import { describe, expect, it } from 'vitest'

import doorbells, { doorbellDetails, wakeupDoorbell } from './doorbells.js'

describe('doorbells', () => {
  it('should export the doorbell functions', () => {
    expect(doorbells).toBeTypeOf('function')
    expect(doorbellDetails).toBeTypeOf('function')
    expect(wakeupDoorbell).toBeTypeOf('function')
  })
})
