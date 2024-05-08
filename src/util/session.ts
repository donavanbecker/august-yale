let request: Promise<any> | null = null;

/**
 * * Start or continue a session
 * If token not saved, fetch a new token
 * ! Tokens should only be saved when making consecutive requests (i.e. internally)
 *
 * @returns {object} headers
 */
export default async function session(this: any): Promise<object> {
  const { apiKey, installId, password, idType, augustId } = this.config;

  const headers = {
    'x-august-api-key': apiKey,
    'x-kease-api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept-Version': '0.0.1',
    'User-Agent': 'August/Luna-3.2.2',
    'x-august-access-token': this.token || '', // Add this line
  };

  if (!this.token) {
    const identifier = `${idType}:${augustId}`;

    const data = { installId, identifier, password };

    if (request === null) {
      request = this.fetch({ method: 'post', url: 'session', headers, data });
    }
    const response = await request;
    request = null;

    this.token = response.headers['x-august-access-token'];
    headers['x-august-access-token'] = this.token;
  }

  return headers;
}
