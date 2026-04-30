import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    login: {
      title: 'Sign In',
      subtitle: 'Enter your email and password',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
    },
    app: {
      name: 'SMI SYSYTEM',
    },
  },
  pl: {
    login: {
      title: 'Zaloguj się',
      subtitle: 'Podaj email i hasło',
      email: 'Email',
      password: 'Hasło',
      submit: 'Zaloguj się',
    },
    app: {
      name: 'SYSTEM SMI',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: 'pl', // start PL
  fallbackLocale: 'en',
  messages,
})