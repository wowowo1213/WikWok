import axios from 'axios';
import { defineNuxtPlugin } from '#app';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  config => {
    const csrfToken = sessionStorage.getItem('x-csrf-token');
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken;

    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) config.headers.Authorization = `Bearer ${jwtToken}`;

    return config;
  },
  error => {
    return error;
  }
);

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const generalStore = useGeneralStore();
    const userStore = useUserStore();
    const router = useRouter();

    switch (error.response.status) {
      case 400: // 请求参数错误
        return Promise.reject(error.response.data.message);

      case 401: // JWT 认证失败
        alert('登录已过期，请重新登录');
        userStore.resetUserStore();
        router.push('/');
        generalStore.isLoginOpen = true;
        Promise.reject(error);
        return;

      case 503:
        alert('服务器暂时不可用');
        Promise.reject(error);
        return;

      case 500:
        alert('服务器内部出错啦');
        Promise.reject(error);
        return;

      default:
        Promise.reject(error);
        return;
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
