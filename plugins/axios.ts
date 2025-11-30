import axios from 'axios';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(NuxtApp => {
  const { $userStore } = useNuxtApp();

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(
    config => {
      // 这边 jwttoken 使用 localstorage，通过 Authorization: Bearer <token> 请求头传递
      // const jwtToken = localStorage.getItem('jwtToken');
      // if (jwtToken) config.headers.Authorization = `Bearer ${jwtToken}`; // 后端设置了使用bear的方式验证，同时设置了有效期为1h

      // const csrfToken = useCookie('XSRF-TOKEN').value;
      // alert(csrfToken);
      // config.headers['X-CSRF-Token'] = csrfToken;

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
        case 401: // 未登录
        case 419: // cookie过期
        case 503: // 服务器暂不可用
          useUserStore().resetUser();
          window.location.href = '/';
          break;
        case 500:
          alert('服务器内部出错 from axios响应拦截器');
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
