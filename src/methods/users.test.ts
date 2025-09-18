import { describe, expect, it } from 'vitest'

import user from './users.js'

describe('users', () => {
  it('should export the user function', () => {
    expect(user).toBeTypeOf('function')
  })
})
