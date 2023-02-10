import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '*',
    //   component: NotFoundComponent
    // },
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/all-messages",
      name: "allMessages",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/GlobalFeedView.vue"),
    },
    {
      path: "/profile/:userId",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      props: true,
    },
    {
      path: "/message/:userId/:postId",
      name: "singlePost",
      component: () => import("../views/SinglePostView.vue"),
      props: true,
    },
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/HomeView.vue"),
    },
  ],
});

export default router;
