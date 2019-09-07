import Vue from "vue";
import Router from "vue-router";

import girder from "./girder";
import Viewer from "./views/Viewer.vue";
import Home from "./views/Home.vue";
import Jobs from "./views/Jobs.vue";
import Login from "./views/Login.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/",
      name: "home",
      component: Home,
      beforeEnter
    },
    {
      path: "/jobs",
      name: "jobs",
      component: Jobs,
      beforeEnter
    },
    {
      path: "/viewer/:datasetId?",
      name: "viewer",
      component: Viewer,
      beforeEnter
    }
  ]
});

function beforeEnter(to, from, next) {
  if (!girder.girderRest.user) {
    next("/login");
  } else {
    next();
  }
}
