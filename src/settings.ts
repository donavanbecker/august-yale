export enum Brand {
  AUGUST = 'august',
  YALE_ACCESS = 'yale_access',
  YALE_HOME = 'yale_home',
  YALE_GLOBAL = 'yale_global',
  YALE_AUGUST = 'yale_august',
}

export const DEFAULT_BRAND: Brand = Brand.AUGUST

export const BASE_URLS: Record<Brand, string> = {
  [Brand.AUGUST]: 'https://api-production.august.com',
  [Brand.YALE_ACCESS]: 'https://api-production.august.com',
  [Brand.YALE_HOME]: 'https://api.aaecosystem.com',
  [Brand.YALE_GLOBAL]: 'https://api.aaecosystem.com',
  [Brand.YALE_AUGUST]: 'https://api-production.august.com',
}

export const BRANDS: Record<Brand, string> = {
  [Brand.AUGUST]: 'August',
  [Brand.YALE_ACCESS]: 'Yale Access',
  [Brand.YALE_HOME]: 'Yale Home',
  [Brand.YALE_GLOBAL]: 'Yale Global',
  [Brand.YALE_AUGUST]: 'Yale August',
}

export const BRANDING: Record<Brand, string> = {
  [Brand.AUGUST]: 'august',
  [Brand.YALE_ACCESS]: 'yale',
  [Brand.YALE_HOME]: 'yale',
  [Brand.YALE_GLOBAL]: 'yale',
  [Brand.YALE_AUGUST]: 'august',
}

export interface PubNubTokens {
  subscribe: string
  publish: string
}

export const PUBNUB_TOKENS: Record<Brand, PubNubTokens> = {
  [Brand.AUGUST]: {
    subscribe: 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f',
    publish: 'pub-c-567d7f2d-270a-438a-a785-f0af12ad8312',
  },
  [Brand.YALE_ACCESS]: {
    subscribe: 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f',
    publish: 'pub-c-567d7f2d-270a-438a-a785-f0af12ad8312',
  },
  [Brand.YALE_HOME]: {
    subscribe: 'sub-c-c9c38d4d-5796-46c9-9262-af20cf6a1d42',
    publish: 'pub-c-353e8881-cf58-4b26-9baf-96f296de0677',
  },
  [Brand.YALE_GLOBAL]: {
    subscribe: '',
    publish: '',
  },
  [Brand.YALE_AUGUST]: {
    subscribe: 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f',
    publish: 'pub-c-567d7f2d-270a-438a-a785-f0af12ad8312',
  },
}

export const CONFIGURATION_URLS: Record<Brand, string> = {
  [Brand.AUGUST]: 'https://account.august.com',
  [Brand.YALE_ACCESS]: 'https://account.august.com',
  [Brand.YALE_HOME]: 'https://account.aaecosystem.com',
  [Brand.YALE_GLOBAL]: 'https://account.aaecosystem.com',
  [Brand.YALE_AUGUST]: 'https://account.august.com',
}

// API Keys from YaleXS library - these may need updating if they change
export const API_KEYS: Record<Brand, string> = {
  [Brand.AUGUST]: 'd9984f29-07a6-816e-e1c9-44ec9d1be431',
  [Brand.YALE_ACCESS]: 'd9984f29-07a6-816e-e1c9-44ec9d1be431',
  [Brand.YALE_HOME]: '6e2a2093-6118-42c5-8a41-e1fd25dce7a1',
  [Brand.YALE_GLOBAL]: 'd16a1029-d823-4b55-a4ce-a769a9b56f0e',
  [Brand.YALE_AUGUST]: '66814fd9-af2c-426c-9710-b37e7eadfb51',
}

// Brand capabilities
export const BRAND_CAPABILITIES: Record<Brand, { supportsDoorbells: boolean, supportsAlarms: boolean, requiresOAuth: boolean }> = {
  [Brand.AUGUST]: {
    supportsDoorbells: true,
    supportsAlarms: false,
    requiresOAuth: false,
  },
  [Brand.YALE_ACCESS]: {
    supportsDoorbells: true,
    supportsAlarms: false,
    requiresOAuth: false,
  },
  [Brand.YALE_HOME]: {
    supportsDoorbells: true,
    supportsAlarms: true,
    requiresOAuth: false,
  },
  [Brand.YALE_GLOBAL]: {
    supportsDoorbells: true,
    supportsAlarms: true,
    requiresOAuth: true,
  },
  [Brand.YALE_AUGUST]: {
    supportsDoorbells: true,
    supportsAlarms: false,
    requiresOAuth: true,
  },
}
