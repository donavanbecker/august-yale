import { describe, expect, it } from 'vitest'

import houses, { houseActivities, houseDetails, houseTemperature } from './houses.js'

describe('houses', () => {
  it('should export the houses function', () => {
    expect(houses).toBeTypeOf('function')
    expect(houseDetails).toBeTypeOf('function')
    expect(houseActivities).toBeTypeOf('function')
    expect(houseTemperature).toBeTypeOf('function')
  })
})
