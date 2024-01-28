/* eslint-disable no-console */
/**
 * * Request a code be sent to phone or email
 *
 * @returns {boolean} true if code was sent
 */
export default async function authorize(this: any): Promise<boolean> {
  const { idType, augustId } = this.config;

  const res = await this.post(`/validation/${idType}`, { value: augustId });

  if (!res) {
    return false;
  }

  console.log(`Check ${augustId} for your validation code`);
  return true;
}
