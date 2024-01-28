/* eslint-disable no-console */

/**
 * * Respond with a code that was sent to phone or email
 *
 * @param {string} code - The code to validate
 * @returns {boolean} true if code was valid
 */
export default async function authorize(this: any, code: string): Promise<boolean> {
  const { idType, augustId } = this.config;

  code = code?.toString();

  if (code.length !== 6) {
    throw Error('Validation code is invalid, should be six digits');
  }

  const res = await this.post(`/validate/${idType}`, { code, [idType]: augustId });

  if (!res) {
    return false;
  }

  console.log('Session validated!');
  return true;
}
