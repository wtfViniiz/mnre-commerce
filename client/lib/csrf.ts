/**
 * Gerenciamento de CSRF tokens no cliente
 */

let csrfToken: string | null = null

export const getCSRFToken = async (): Promise<string | null> => {
  if (csrfToken) {
    return csrfToken
  }

  try {
    // Buscar token do servidor (endpoint que retorna CSRF token)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/csrf-token`, {
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      csrfToken = data.token
      return csrfToken
    }
  } catch (error) {
    console.error('Erro ao buscar CSRF token:', error)
  }

  return null
}

export const clearCSRFToken = () => {
  csrfToken = null
}

/**
 * Adicionar CSRF token aos headers de requisições
 */
export const addCSRFHeader = async (headers: HeadersInit = {}): Promise<HeadersInit> => {
  const token = await getCSRFToken()
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    }
  }
  return headers
}

