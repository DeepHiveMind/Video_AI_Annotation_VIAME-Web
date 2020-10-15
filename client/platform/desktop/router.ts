import Vue from 'vue';
import Router from 'vue-router';

import ViewerLoader from './components/ViewerLoader.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: ViewerLoader,
      props: true,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
