const BASE_URL = (typeof process !== 'undefined' && process.env && process.env.TARO_APP_API_URL) || 'http://localhost:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

function getMockParentOpenid(): string {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('mockParentOpenid') || '';
  }
  return '';
}

function getOpenid(): string {
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    return wx.getStorageSync('parentOpenid') || '';
  }
  const mockOpenid = getMockParentOpenid();
  if (mockOpenid) {
    return mockOpenid;
  }
  return '';
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', data, headers = {} } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const openid = getOpenid();
  if (openid) {
    defaultHeaders['X-Wechat-Openid'] = openid;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    return { code: 500, message: 'Network error' };
  }
}

export const api = {
  get: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'GET', data }),

  post: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'POST', data }),

  put: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PUT', data }),

  delete: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'DELETE', data }),

  auth: {
    mockLogin: async () => {
      const MOCK_PARENT = {
        openid: 'mock_parent_12345',
        nickname: '家长测试',
        relation: '家长',
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mockParentOpenid', MOCK_PARENT.openid);
        localStorage.setItem('mockParentInfo', JSON.stringify(MOCK_PARENT));
      }
      return { code: 200, data: MOCK_PARENT };
    },
    isLoggedIn: () => {
      if (typeof localStorage !== 'undefined') {
        return !!localStorage.getItem('mockParentOpenid');
      }
      return false;
    },
    logout: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('mockParentOpenid');
        localStorage.removeItem('mockParentInfo');
      }
    },
    getInfo: () => {
      if (typeof localStorage !== 'undefined') {
        const info = localStorage.getItem('mockParentInfo');
        return info ? JSON.parse(info) : null;
      }
      return null;
    },
  },

  parent: {
    getChildren: () => api.get<any>('/api/parent/children'),
    getChildReport: (childOpenid: string) =>
      api.get<any>(`/api/parent/children/${childOpenid}/report`),
    updateSettings: (data: any) =>
      api.put<any>('/api/parent/notify-settings', data),
  },
};