const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000';

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

function getOpenid(): string {
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    return wx.getStorageSync('openid') || '';
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

  user: {
    getMe: () => api.get<any>('/api/users/me'),
    updateMe: (data: any) => api.put<any>('/api/users/me', data),
    generateBindCode: () => api.post<any>('/api/users/bind-parent'),
  },

  question: {
    list: (params?: any) => api.get<any>('/api/questions', params),
    create: (data: any) => api.post<any>('/api/questions', data),
    get: (id: string) => api.get<any>(`/api/questions/${id}`),
    delete: (id: string) => api.delete<any>(`/api/questions/${id}`),
    markMaster: (id: string) => api.post<any>(`/api/questions/${id}/master`),
    getWeakPoints: (subject?: string) =>
      api.get<any>('/api/questions/weak-points', { subject }),
  },

  plan: {
    getToday: () => api.get<any>('/api/plans/today'),
    generate: (data?: any) => api.post<any>('/api/plans/generate', data),
    completeItem: (itemId: string, data?: any) =>
      api.put<any>(`/api/plans/items/${itemId}/complete`, data),
    startTomato: (data?: any) => api.post<any>('/api/plans/tomato/start', data),
    completeTomato: (tomatoId: string, data?: any) =>
      api.post<any>(`/api/plans/tomato/${tomatoId}/complete`, data),
    getSummary: () => api.get<any>('/api/plans/summary'),
  },

  ai: {
    chat: (data: any) => api.post<any>('/api/ai/chat', data),
    explain: (questionId: string, data: any) =>
      api.post<any>(`/api/ai/explain/${questionId}`, data),
  },

  emotional: {
    chat: (data: any) => api.post<any>('/api/emotional/chat', data),
    motivate: () => api.post<any>('/api/emotional/motivate'),
    record: (data: any) => api.post<any>('/api/emotional/emotion', data),
  },

  member: {
    getInfo: () => api.get<any>('/api/membership'),
    getProducts: () => api.get<any>('/api/membership/products'),
    purchase: (productId: string) =>
      api.post<any>('/api/membership/purchase', { productId }),
  },

  parent: {
    bind: (bindCode: string, relation: string) =>
      api.post<any>('/api/parent/bind', { bindCode, relation }),
    getChildren: () => api.get<any>('/api/parent/children'),
    getReport: (childOpenid: string) =>
      api.get<any>(`/api/parent/children/${childOpenid}/report`),
    updateSettings: (data: any) =>
      api.put<any>('/api/parent/notify-settings', data),
  },
};
