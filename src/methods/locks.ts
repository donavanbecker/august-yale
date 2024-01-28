/**
 * * Get list of locks on account
 *
 * @return {map} Map of lockIds to lock info (less than details)
 */
export default async function locks(this: any, internal: any): Promise<any> {
  const { body } = await this.get('/users/locks/mine');

  if (!internal) {
    this.end();
  }

  return body;

}
