/**
 * Direct REST AWS Cognito Identity Provider Client (no AWS SDK needed)
 */

const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '7rmn2pkug1vg81gkaf0bp1r03l';
const COGNITO_ENDPOINT = `https://cognito-idp.${AWS_REGION}.amazonaws.com/`;

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // in seconds
  issuedAt: number; // timestamp in ms
  username: string;
}

export interface AuthChallenge {
  challengeName: 'NEW_PASSWORD_REQUIRED' | string;
  session: string;
  username: string;
  challengeParameters?: Record<string, string>;
}

export type AuthResult =
  | { success: true; tokens: AuthTokens }
  | { success: false; challenge: AuthChallenge }
  | { success: false; error: string };

/**
 * Execute a low-level Cognito REST call with exact target headers.
 */
async function callCognitoTarget(target: string, body: Record<string, unknown>): Promise<any> {
  const response = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorType = data.__type || 'AuthError';
    const message = data.message || data.Message || errorType;
    const err = new Error(message);
    (err as any).type = errorType;
    throw err;
  }

  return data;
}

/**
 * Sign in using USER_PASSWORD_AUTH flow.
 */
export async function initiateAuth(username: string, password: string): Promise<AuthResult> {
  try {
    const data = await callCognitoTarget('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username.trim(),
        PASSWORD: password,
      },
    });

    if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        success: false,
        challenge: {
          challengeName: data.ChallengeName,
          session: data.Session,
          username: username.trim(),
          challengeParameters: data.ChallengeParameters,
        },
      };
    }

    if (data.AuthenticationResult) {
      return {
        success: true,
        tokens: {
          idToken: data.AuthenticationResult.IdToken,
          accessToken: data.AuthenticationResult.AccessToken,
          refreshToken: data.AuthenticationResult.RefreshToken,
          expiresIn: data.AuthenticationResult.ExpiresIn || 3600,
          issuedAt: Date.now(),
          username: username.trim(),
        },
      };
    }

    return {
      success: false,
      error: 'Unexpected Cognito response: missing AuthenticationResult or supported challenge.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Authentication failed. Please check your credentials.',
    };
  }
}

/**
 * Respond to first-time password change challenge (NEW_PASSWORD_REQUIRED).
 */
export async function respondToNewPasswordChallenge(
  username: string,
  newPassword: string,
  session: string
): Promise<AuthResult> {
  try {
    const data = await callCognitoTarget('RespondToAuthChallenge', {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: COGNITO_CLIENT_ID,
      ChallengeResponses: {
        USERNAME: username.trim(),
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    });

    if (data.AuthenticationResult) {
      return {
        success: true,
        tokens: {
          idToken: data.AuthenticationResult.IdToken,
          accessToken: data.AuthenticationResult.AccessToken,
          refreshToken: data.AuthenticationResult.RefreshToken,
          expiresIn: data.AuthenticationResult.ExpiresIn || 3600,
          issuedAt: Date.now(),
          username: username.trim(),
        },
      };
    }

    return {
      success: false,
      error: 'Password update completed but tokens were not returned.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update new password.',
    };
  }
}

/**
 * Refresh tokens with REFRESH_TOKEN_AUTH.
 */
export async function refreshAuthToken(refreshToken: string, username: string): Promise<AuthTokens | null> {
  try {
    const data = await callCognitoTarget('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    if (data.AuthenticationResult) {
      return {
        idToken: data.AuthenticationResult.IdToken,
        accessToken: data.AuthenticationResult.AccessToken,
        refreshToken: data.AuthenticationResult.RefreshToken || refreshToken, // retain existing if not renewed
        expiresIn: data.AuthenticationResult.ExpiresIn || 3600,
        issuedAt: Date.now(),
        username,
      };
    }

    return null;
  } catch (err) {
    console.error('Token refresh failed:', err);
    return null;
  }
}
