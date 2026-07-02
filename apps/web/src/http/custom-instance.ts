import { webEnv } from '@repo/env/web'
import Axios, { type AxiosRequestConfig } from 'axios'

// Workaround: generated orval code uses axios.default (global instance) instead of
// a custom instance. Mutating global defaults ensures relative URLs hit the API.
Axios.defaults.baseURL = webEnv.VITE_API_URL

export const AXIOS_INSTANCE = Axios.create({
  baseURL: webEnv.VITE_API_URL,
})

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const customInstance = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const { data } = await AXIOS_INSTANCE(config)
  return data
}

export default customInstance
