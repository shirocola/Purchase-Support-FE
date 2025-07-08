export function validateAzureToken(response: any): boolean {
  // Check if token exists
  if (!response.accessToken) {
    console.error('No access token received');
    return false;
  }
  
  // Check if token is expired
  if (response.expiresOn && new Date() >= response.expiresOn) {
    console.error('Token is expired');
    return false;
  }
  
  // Check token format (should be JWT)
  const tokenParts = response.accessToken.split('.');
  if (tokenParts.length !== 3) {
    console.error('Token is not a valid JWT format');
    return false;
  }
  
  return true;
}

export function decodeTokenPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}