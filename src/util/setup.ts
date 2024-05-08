/* Copyright(C) 2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * setup.ts: august-yale API registration.
 */
import process from 'process';
const DEFAULT_API_KEY_US = '79fd0eb6-381d-4adf-95a0-47721289d1d9';
const DEFAULT_API_KEY_NON_US = 'd9984f29-07a6-816e-e1c9-44ec9d1be431';
const DEFAULT_PN_SUB_KEY_US = 'sub-c-1030e062-0ebe-11e5-a5c2-0619f8945a4f';
const DEFAULT_PN_SUB_KEY_NON_US = 'sub-c-c9c38d4d-5796-46c9-9262-af20cf6a1d42';

/**
 * * Validate config
 * Uses environment variables or passed in config to validate
 *
 * @param {object} [config]
 * @returns {object} config
 */

export default function setup(config: any): object {
  const {
    AUGUST_API_KEY,
    AUGUST_PN_SUB_KEY,
    AUGUST_INSTALL_ID,
    AUGUST_PASSWORD,
    AUGUST_ID,
    COUNTRY_CODE,
  } = process.env;

  const countryCode = config.countryCode || COUNTRY_CODE || 'US';
  const errors = [];

  const DEFAULT_API_KEY = countryCode === 'US' ? DEFAULT_API_KEY_US : DEFAULT_API_KEY_NON_US;
  const DEFAULT_PN_SUB_KEY = countryCode === 'US' ? DEFAULT_PN_SUB_KEY_US : DEFAULT_PN_SUB_KEY_NON_US;

  const apiKey = config.apiKey ?? AUGUST_API_KEY ?? DEFAULT_API_KEY;
  const pnSubKey = config.pnSubKey ?? AUGUST_PN_SUB_KEY ?? DEFAULT_PN_SUB_KEY;
  const installId = config.installId ?? AUGUST_INSTALL_ID;
  let idType; // Auto-detected
  const augustId = config.augustId ?? AUGUST_ID;
  const password = config.password ?? AUGUST_PASSWORD;

  if (!apiKey) {
    errors.push('Missing config.apiKey or AUGUST_API_KEY env var');
  }
  if (!installId) {
    errors.push('Missing config.installId or AUGUST_INSTALL_ID env var');
  }
  if (!augustId) {
    errors.push('Missing config.augustId or AUGUST_ID env var');
  } else if (augustId?.match(/^\+?\d+$/)) {
    idType = 'phone';
  } else if (augustId?.match(/^\S+@\S+$/)) {
    idType = 'email';
  } else {
    errors.push(
      'Invalid config.augustId or AUGUST_ID env var: must be a phone number or email address',
    );
  }
  if (!password) {
    errors.push('Missing config.password or AUGUST_PASSWORD env var');
  }
  if (errors.length) {
    throw ReferenceError(`Config errors found:\n${errors.join('\n')}`);
  } else {
    return { apiKey, pnSubKey, installId, idType, augustId, password, countryCode };
  }
}
