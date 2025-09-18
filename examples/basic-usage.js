import August, { InvalidAuth, BridgeError, YaleApiError } from 'august-yale'

// Basic usage example
async function basicExample() {
  const august = new August({
    installId: 'your-install-id',
    augustId: 'your-email@example.com',
    password: 'your-password',
    brand: 'august', // or 'yale_access', 'yale_home', etc.
  })

  try {
    // First time setup - authorize and validate
    // await august.authorize()
    // await august.validate('123456') // 6-digit code from email/SMS

    // Get all locks
    const locks = await august.locks()
    console.log('Available locks:', Object.keys(locks))

    if (Object.keys(locks).length > 0) {
      const lockId = Object.keys(locks)[0]
      
      // Get lock status
      const status = await august.status(lockId)
      console.log('Lock status:', status)

      // Lock/unlock operations
      if (status?.state?.unlocked) {
        await august.lock(lockId)
        console.log('Lock engaged')
      } else {
        await august.unlock(lockId)
        console.log('Lock disengaged')
      }

      // Get lock details
      const details = await august.details(lockId)
      console.log('Lock details:', details)

      // Get PIN codes (if supported)
      const pins = await august.pins(lockId)
      console.log('PIN codes:', pins)
    }

    // Get house information
    const houses = await august.houses()
    console.log('Houses:', houses)

    if (houses && Object.keys(houses).length > 0) {
      const houseId = Object.keys(houses)[0]
      
      // Get house activities
      const activities = await august.houseActivities(houseId, 10)
      console.log('Recent activities:', activities)
    }

    // Get user profile
    const user = await august.user()
    console.log('User profile:', user)

  } catch (error) {
    if (error instanceof InvalidAuth) {
      console.error('Authentication failed. Please check credentials and reauthorize.')
    } else if (error instanceof BridgeError) {
      console.error('Bridge/device connectivity issue:', error.message)
    } else if (error instanceof YaleApiError) {
      console.error('API error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

// Async operations example
async function asyncOperationsExample() {
  const august = new August({
    installId: 'your-install-id',
    augustId: 'your-email@example.com', 
    password: 'your-password',
  })

  try {
    const locks = await august.locks()
    const lockId = Object.keys(locks)[0]

    // Queue async operations - these return immediately
    // Results come via PubNub or WebSocket subscriptions
    console.log('Queueing async lock operation...')
    const lockOperationId = await august.lockAsync(lockId)
    console.log('Lock operation queued:', lockOperationId)

    // Set up WebSocket subscription for real-time updates
    const subscription = await august.addWebSocketSubscription()
    console.log('WebSocket subscription created:', subscription)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Brand-specific example
async function brandSpecificExample() {
  // Yale Home example (supports alarms)
  const yaleHome = new August({
    installId: 'your-install-id',
    augustId: 'your-email@example.com',
    password: 'your-password',
    brand: 'yale_home',
  })

  try {
    // Get alarms (only supported by some brands)
    const alarms = await yaleHome.alarms()
    console.log('Available alarms:', alarms)

    if (alarms && alarms.length > 0) {
      const alarmId = alarms[0].alarmID
      
      // Get alarm devices
      const devices = await yaleHome.alarmDevices(alarmId)
      console.log('Alarm devices:', devices)

      // Arm the alarm system
      await yaleHome.setAlarmState(alarmId, 'arm_away')
      console.log('Alarm armed in away mode')
    }

    // Get doorbells (if supported)
    const doorbells = await yaleHome.doorbells()
    console.log('Doorbells:', doorbells)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running basic example...')
  await basicExample()
  
  console.log('\nRunning async operations example...')
  await asyncOperationsExample()
  
  console.log('\nRunning brand-specific example...')
  await brandSpecificExample()
}

export { basicExample, asyncOperationsExample, brandSpecificExample }