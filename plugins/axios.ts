import axios from 'axios';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(NuxtApp => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:5000';

  return {
    provide: {
      axios: axios,
    },
  };
});
