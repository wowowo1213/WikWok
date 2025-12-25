import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { defineNuxtPlugin } from '#app';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

const saveJwtToken = (token: string) => {
  localStorage.setItem('jwtToken', token);
};

const getJwtToken = () => {
  return localStorage.getItem('jwtToken');
};

async function refreshAccessToken() {
  try {
    const res = await axiosInstance.post('/auth/refresh');
    return res.data.accessToken;
  } catch (error) {
    const router = useRouter();
    const userStore = useUserStore();
    userStore.resetUserStore();
    router.push('/');
    throw error;
  }
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = sessionStorage.getItem('x-csrf-token');
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken;

    const accessToken = getJwtToken();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error: any) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const router = useRouter();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        saveJwtToken(newAccessToken);

        subscribers.forEach(cb => cb(newAccessToken));
        subscribers = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        userStore.resetUserStore();
        router.push('/');
        generalStore.isLoginOpen = true;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    switch (error.response?.status) {
      case 400:
        return Promise.reject(error.response.data.message);
      case 503:
        alert('服务器暂时不可用');
        return Promise.reject(error);
      case 500:
        alert('服务器内部出错啦');
        return Promise.reject(error);
      default:
        return Promise.reject(error);
    }
  }
);

export default defineNuxtPlugin(NuxtApp => {
  return {
    provide: {
      axios: axiosInstance,
    },
  };
});
