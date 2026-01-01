import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { defineNuxtPlugin } from '#app';
import { throttle } from 'lodash-es';

export default defineNuxtPlugin(NuxtApp => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    withCredentials: true,
  });

  let isRefreshing = false;
  let subscribers: ((token: string) => void)[] = [];

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const csrfToken = sessionStorage.getItem('x-csrf-token');
      if (csrfToken) config.headers['x-csrf-token'] = csrfToken;

      const accessToken = localStorage.getItem('jwtToken');
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

      return config;
    },
    error => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      const router = useRouter();
      const userStore = useUserStore();
      const generalStore = useGeneralStore();

      const toast = useToast();
      const showErrorToast = throttle(options => {
        toast.add(options);
      }, 500);

      switch (error.response?.status) {
        case 400:
          showErrorToast({
            title: '错误',
            description: error.response.data.message || '请求错误',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
          });
          return Promise.reject(error.response.data.message);
        case 401:
          if (!originalRequest._retry) {
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
              const { data } = await axiosInstance.post('/auth/refresh');
              const newAccessToken = data?.accessToken;
              localStorage.setItem('jwtToken', newAccessToken);

              subscribers.forEach(cb => cb(newAccessToken));
              subscribers = [];

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            } catch (refreshError) {
              userStore.resetUserStore();
              router.push('/');
              toast.add({
                title: '登录已过期',
                description: '请重新登录',
                color: 'error',
                icon: 'i-heroicons-exclamation-circle',
              });
              generalStore.isLoginOpen = true;
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }
          break;
        case 403:
          showErrorToast({
            title: '无权限',
            description: '您没有权限执行此操作',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
          });
          return Promise.reject('您没有权限执行此操作');
        case 404:
          showErrorToast({
            title: '未找到',
            description: '请求的资源不存在',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
          });
          return Promise.reject('请求的资源不存在');
        case 500:
          showErrorToast({
            title: '服务器错误',
            description: '服务器内部出错啦',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
          });
          return Promise.reject('服务器内部出错啦');
        case 503:
          showErrorToast({
            title: '服务不可用',
            description: '服务器暂时不可用，请稍后再试',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
          });
          return Promise.reject('服务器暂时不可用，请稍后再试');
        default:
          return Promise.reject(error);
      }
    }
  );

  return {
    provide: {
      axios: axiosInstance,
    },
  };
});
