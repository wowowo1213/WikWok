import axios from 'axios';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(NuxtApp => {
  const { $generalStore, $userStore } = useNuxtApp();

  const axiosInstance = axios.create({
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
      switch (error.response.status) {
        case 400: // 请求出错
          return Promise.reject(error.response.data.message);
        case 401: // JWT验证未通过，检查是否携带onfig.headers.Authorization = `Bearer ${jwtToken}`，或者jwtToken已过期，请重新登陆
          alert('JWT验证未通过或者jwtToken失效，请检查或重新登录');
          $userStore.resetUserStore();
          window.location.href = '/';
          $generalStore.isLoginOpen = true;
          Promise.reject(error);
          break;
        case 419: // cookie过期
        case 503: // 服务器暂不可用
          alert(`响应状态码为${error.response.status} from axios响应拦截器`);
          $userStore.resetUserStore();
          window.location.href = '/';
          Promise.reject(error);
          break;
        case 500:
          alert('服务器内部出错啦 from axios响应拦截器');
          break;
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
