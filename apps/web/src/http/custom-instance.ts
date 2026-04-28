import Axios, { type AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
