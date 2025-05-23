/**
 * Fetch a decrypted secret from the webhook endpoint by ID
 */
export async function getDecryptedSecret(secretId: string): Promise<string> {
  try {
    const response = await fetch(`https://sis1.thesqd.com/webhook/get-db-key?id=${secretId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.decrypted_secret) {
      throw new Error(`No secret found for ID: ${secretId}`);
    }

    return data.decrypted_secret;
  } catch (error) {
    console.error('Error fetching secret from webhook:', error);
    throw error;
  }
}

/**
 * Get the Dropbox access token from the webhook endpoint
 */
export async function getDropboxAccessToken(): Promise<string> {
  // The specific ID for the Dropbox admin token
  const DROPBOX_TOKEN_ID = '2b5d8b48-77b6-4d55-8753-c3dc344f1c9b';
  return await getDecryptedSecret(DROPBOX_TOKEN_ID);
}

/**
 * Test function to verify vault connectivity
 */
export async function testVaultConnection(): Promise<boolean> {
  try {
    const token = await getDropboxAccessToken();
    return !!token && token.length > 0;
  } catch (error) {
    console.error('Vault connection test failed:', error);
    return false;
  }
} 