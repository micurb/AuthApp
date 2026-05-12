import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/email-templates',
    component: () => import('../views/EmailTemplatesView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true,
    },
  },
  {
    path: '/change-password',
    component: () => import('../views/ChangePasswordView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/forgot-password',
    component: () => import('../views/ForgotPasswordView.vue'),
  },
  {
    path: '/reset-password',
    component: () => import('../views/ResetPasswordView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  if (token) {
    const auth = useAuthStore()

    if (!auth.user) {
      try {
        await auth.fetchUser()
      } catch (err) {
        auth.logout()
        return next('/login')
      }
    }

    if (to.meta.requiresSuperAdmin && !auth.user?.isSuperAdmin) {
      return next('/dashboard')
    }
  }

  next()
})

export { router }