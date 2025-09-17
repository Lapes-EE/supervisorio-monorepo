import { env } from '@repo/env'
import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

// Configuração base da API
const API_BASE_URL = env.API_URL || 'http://localhost:3333/api'

// Chave para localStorage
const TOKEN_KEY = 'auth_token'

// Funções para gerenciar token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// Instância base do Axios
export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Adiciona token em todas as requisições
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = getToken()

    // Se existir token e o método não for GET, adiciona Authorization
    if (token && config.headers && config.method?.toUpperCase() !== 'GET') {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - Redireciona para login em caso de 401
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Se token inválido, limpa e redireciona para login
    if (error.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Custom instance para o Orval (seguindo o padrão da documentação)
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-expect-error
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

// Tipos para o Orval
export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

// Funções utilitárias para autenticação
export const login = async (credentials: {
  username: string
  password: string
}) => {
  try {
    const response = await AXIOS_INSTANCE.post(
      '/sessions/password',
      credentials
    )
    const { token } = response.data

    setToken(token)

    return response.data
  } catch (error) {
    throw new Error(`Error in login ${error}`)
  }
}

export const logout = () => {
  clearToken()
  window.location.href = '/login'
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}
