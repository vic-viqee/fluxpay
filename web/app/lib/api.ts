/**
 * Typed API Fetcher for FluxPay
 * Handles auth token injection, error normalization, and type safety
 */

import { ErrorResponse } from './types/dto'

interface FetchOptions<T = any> extends Omit<RequestInit, 'body'> {
  headers?: Record<string, string>
  body?: T | FormData
  timeout?: number
}

interface FetchResponse<T> {
  data?: T
  error?: ErrorResponse
  status: number
}

/**
 * Get stored auth tokens from localStorage
 */
function getAuthTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null }
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  return { accessToken, refreshToken }
}

/**
 * Store auth tokens in localStorage
 */
function setAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

/**
 * Clear auth tokens from localStorage
 */
function clearAuthTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getAuthTokens()
  if (!refreshToken) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      clearAuthTokens()
      return null
    }

    const data = await res.json()
    if (data.accessToken) {
      setAuthTokens(data.accessToken, data.refreshToken || refreshToken)
      return data.accessToken
    }
    return null
  } catch (err) {
    clearAuthTokens()
    return null
  }
}

/**
 * Main typed fetch function
 * Automatically handles:
 * - Auth token injection
 * - Error normalization
 * - Token refresh on 401
 * - Timeout
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions<any> = {}
): Promise<FetchResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    ...rest
  } = options

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const url = `${baseUrl}${endpoint}`

  const { accessToken } = getAuthTokens()

  // Build request headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (accessToken) {
    finalHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  // Build request body
  let finalBody: string | FormData | undefined
  if (body) {
    if (body instanceof FormData) {
      finalBody = body
      delete finalHeaders['Content-Type'] // FormData sets its own Content-Type
    } else {
      finalBody = JSON.stringify(body)
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
      ...rest,
    })

    clearTimeout(timeoutId)

    // Handle 401 - attempt refresh and retry
    if (res.status === 401 && accessToken) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        // Retry request with new token
        finalHeaders['Authorization'] = `Bearer ${newToken}`
        const retryRes = await fetch(url, {
          method,
          headers: finalHeaders,
          body: finalBody,
          ...rest,
        })
        return handleResponse<T>(retryRes)
      }
    }

    return handleResponse<T>(res)
  } catch (err: any) {
    clearTimeout(timeoutId)

    if (err.name === 'AbortError') {
      return {
        error: {
          error: 'Request timeout',
          code: 'TIMEOUT',
          statusCode: 408,
        },
        status: 408,
      }
    }

    return {
      error: {
        error: err.message || 'Network error',
        code: 'NETWORK_ERROR',
      },
      status: 0,
    }
  }
}

/**
 * Handle fetch response and normalize errors
 */
async function handleResponse<T>(res: Response): Promise<FetchResponse<T>> {
  const contentType = res.headers.get('content-type')
  let data: any

  try {
    if (contentType?.includes('application/json')) {
      data = await res.json()
    } else if (contentType?.includes('text/plain')) {
      data = await res.text()
    } else {
      data = await res.blob()
    }
  } catch (err) {
    // If JSON parse fails, return raw response
    return {
      status: res.status,
      error: {
        error: 'Failed to parse response',
        code: 'PARSE_ERROR',
        statusCode: res.status,
      },
    }
  }

  if (!res.ok) {
    const errorResponse: ErrorResponse = data?.error || {
      error: data?.message || `HTTP ${res.status}`,
      statusCode: res.status,
    }

    return {
      status: res.status,
      error: errorResponse,
    }
  }

  return {
    status: res.status,
    data: data as T,
  }
}

// ============ Convenience Methods ============

export const api = {
  /**
   * GET request
   */
  get: async <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: async <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  /**
   * PUT request
   */
  put: async <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  /**
   * DELETE request
   */
  delete: async <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * PATCH request
   */
  patch: async <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  /**
   * Manage auth tokens
   */
  auth: {
    getTokens: getAuthTokens,
    setTokens: setAuthTokens,
    clearTokens: clearAuthTokens,
  },
}
