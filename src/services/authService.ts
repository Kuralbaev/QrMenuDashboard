import { loginApi } from '../api/auth'

export class AuthService {
  static async login(email: string, password: string) {
    return await loginApi(email, password)
  }
}
