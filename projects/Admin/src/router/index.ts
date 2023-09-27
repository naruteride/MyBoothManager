import { createRouter, createWebHistory, type RouteRecordName } from "vue-router";
import ErrorPage from "@/pages/ErrorPage.vue";
import PlaceholderPage from "@/pages/dev/PlaceholderPage.vue";
import BoothAdminRoot from "@/pages/BoothAdminRoot.vue";
import BoothAdminLayout from "@/pages/BoothAdminLayout.vue";
import BoothAdminDashboardPage from "@/pages/subpages/BoothAdminDashboardPage.vue";
import BoothAdminGoodsPage from "@/pages/subpages/BoothAdminGoodsPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import LogoutPage from "@/pages/LogoutPage.vue";
import SuperAdminPage from "@/pages/superadmin/SuperAdminPage.vue";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";

/* Router definitions */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* Falloff route */
    {
      path: "/:pathMatch(.*)*",
      name: "placeholder",
      component: PlaceholderPage,
    },
    {
      path: "/404",  // Change this to "/:pathMatch(.*)*" later, on real production
      name: "404",
      component: ErrorPage,
    },

    /* Login / Logout */
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/logout",
      name: "logout",
      component: LogoutPage,
    },

    /* Super Admin */
    {
      path: "/superadmin",
      name: "superadmin",
      component: SuperAdminPage,
    },

    /* Admin Routes */
    {
      path: "/",
      name: "admin-root",
      component: BoothAdminRoot,
      children: [
        {
          path: "",
          name: "admin-layout",
          component: BoothAdminLayout,
          children: [
            {
              path: "",
              name: "admin",
              component: BoothAdminDashboardPage,
            },
            {
              path: "goods",
              name: "admin-goods",
              component: BoothAdminGoodsPage,
            },
            {
              path: "analytics",
              name: "admin-analytics",
              component: PlaceholderPage,
            },
            {
              path: "utility/price-calculator",
              name: "admin-utility-price-calculator",
              component: PlaceholderPage,
            },
          ],
        },
      ],
    },
    {
      path: "/pos",
      name: "admin-pos",
      component: PlaceholderPage,
    },
  ],
});

/* Router global hooks */
// Auth route guard
router.beforeEach((to, from, next) => {
  const isTokenAvailable = !!useAuthStore().isAuthTokenValid();
  const isAccountDataAvailable = !!useAdminStore().currentAccount;
  const isAllAvailable = isTokenAvailable && isAccountDataAvailable;

  if(isTokenAvailable && !isAccountDataAvailable) {
    useAdminStore().isBoothDataLoaded = false;
    next();
  }

  // SuperAdmin
  if(isAllAvailable
      && useAdminStore().currentAccount?.superAdmin
      && !((["superadmin", "logout"] as RouteRecordName[]).includes(to.name!))) {
    next({ name: "superadmin" });
    return;
  } else if(isAllAvailable
            && !useAdminStore().currentAccount?.superAdmin
            && to.name === "superadmin") {
    next({ name: "admin" });
    return;
  }

  // Normal
  if(isAllAvailable && to.name === "login") {
    next({ name: "admin" });
  } else if(!isAllAvailable && to.name !== "login") {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
