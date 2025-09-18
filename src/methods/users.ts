/* Copyright(C) 2024, homebridge-plugins (https://github.com/homebridge-plugins). All rights reserved.
 *
 * users.ts: August-Yale API user-related endpoints.
 */

/**
 * Get user profile information
 * @param keepSession - Whether to keep the session alive after this call
 * @returns User profile data
 */
async function user(this: any, keepSession: boolean): Promise<any> {
  try {
    const response = await this.get('/users/me')
    return response?.body
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return undefined
  } finally {
    if (!keepSession) {
      this.end()
    }
  }
}

export default user
