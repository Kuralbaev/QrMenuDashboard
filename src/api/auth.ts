import type { ApiResponse, User } from '../types/api'
import axiosInstance from './index'

export async function loginApi(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const { data } = await axiosInstance.post<
    ApiResponse<{ user: User; token: string }>
  >('/admin/login', {
    email,
    password,
  })
  return data.data
}
