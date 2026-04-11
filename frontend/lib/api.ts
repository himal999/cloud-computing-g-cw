const API_BASE_URL = 'http://localhost:8086/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const status = response.status
      
      if (response.ok) {
        const data = await response.json()
        return {
          data,
          status,
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.message || errorData.error || 'Request failed',
          status,
        }
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async signup(userData: SignUpRequest): Promise<ApiResponse> {
    return this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async submitSalary(salaryData: any): Promise<ApiResponse> {
    return this.request('/submit', {
      method: 'POST',
      body: JSON.stringify(salaryData),
    })
  }

  async searchSalaries(params: {
    country?: string
    company?: string
    role?: string
    level?: string
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })
    
    return this.request(`/search?${searchParams.toString()}`)
  }

  async getStats(params: {
    country?: string
    role?: string
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })
    
    return this.request(`/stats?${searchParams.toString()}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
