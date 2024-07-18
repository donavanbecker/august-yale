export enum Brand {
  AUGUST = 'august',
  YALE_ACCESS = 'yale_access',
  YALE_HOME = 'yale_home',
}

export const DEFAULT_BRAND: Brand = Brand.AUGUST;

export const BASE_URLS: Record<Brand, string> = {
  [Brand.AUGUST]: 'https://api-production.august.com',
  [Brand.YALE_ACCESS]: 'https://api-production.august.com',
  [Brand.YALE_HOME]: 'https://api.aaecosystem.com',
};

export const BRANDS: Record<Brand, string> = {
  [Brand.AUGUST]: 'August',
  [Brand.YALE_ACCESS]: 'Yale Access',
  [Brand.YALE_HOME]: 'Yale Home',
};

export const BRANDING: Record<Brand, string> = {
  [Brand.AUGUST]: 'august',
  [Brand.YALE_ACCESS]: 'yale',
  [Brand.YALE_HOME]: 'yale',
};

export interface PubNubTokens {
  subscribe: string;
  publish: string;
}

export const PUBNUB_TOKENS: Record<Brand, PubNubTokens> = {
  [Brand.AUGUST]: {
    subscribe: 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f',
    publish: 'pub-c-567d7f2d-270a-438a-a785-f0af12ad8312',
  },
  [Brand.YALE_ACCESS]: {
    subscribe: 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f',
    publish: 'pub-c-567d7f2d-270a-438a-a785-f0af12ad8312f',
  },
  [Brand.YALE_HOME]: {
    subscribe: 'sub-c-c9c38d4d-5796-46c9-9262-af20cf6a1d42',
    publish: 'pub-c-353e8881-cf58-4b26-9baf-96f296de0677',
  },
};

export const CONFIGURATION_URLS: Record<Brand, string> = {
  [Brand.AUGUST]: 'https://account.august.com',
  [Brand.YALE_ACCESS]: 'https://account.august.com',
  [Brand.YALE_HOME]: 'https://account.aaecosystem.com',
};