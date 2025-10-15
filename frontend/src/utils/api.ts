import axios, { type AxiosInstance } from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not defined. API requests will fail.")
}

const api: AxiosInstance = axios.create({
  baseURL: baseURL ?? "/",
})

export { api }
export default api
