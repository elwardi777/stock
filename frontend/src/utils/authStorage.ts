const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * Per-tab authentication token storage backed by sessionStorage so each
 * browser tab maintains an independent session.
 */
export const authStorage = {
  getAccessToken: (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setAccessToken: (accessToken: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },
  setTokens: (accessToken: string, refreshToken: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens: (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
