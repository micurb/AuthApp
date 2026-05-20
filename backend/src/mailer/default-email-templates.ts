import { EmailTemplateKey } from './email-template-key.enum';

export const defaultEmailTemplates = [
  // =========================
  // ACCOUNT CREATED
  // =========================

  {
    key: EmailTemplateKey.ACCOUNT_CREATED,
    language: 'pl',
    name: 'Utworzenie konta',
    subject: 'Twoje konto w systemie SMI',
    bodyHtml: `
      <h2>Konto zostało utworzone</h2>

      <p>Witaj {{fullName}},</p>

      <p>Możesz się zalogować do systemu.</p>

      <p>
        <strong>Hasło tymczasowe:</strong>
        {{temporaryPassword}}
      </p>

      <p>
        Po pierwszym logowaniu zostaniesz poproszony o zmianę hasła.
      </p>
    `,
    isActive: true,
  },

  {
    key: EmailTemplateKey.ACCOUNT_CREATED,
    language: 'en',
    name: 'Account created',
    subject: 'Your SMI account',
    bodyHtml: `
      <h2>Your account has been created</h2>

      <p>Hello {{fullName}},</p>

      <p>You can now sign in to the system.</p>

      <p>
        <strong>Temporary password:</strong>
        {{temporaryPassword}}
      </p>

      <p>
        You will be required to change your password after first login.
      </p>
    `,
    isActive: true,
  },

  // =========================
  // PASSWORD RESET
  // =========================

  {
    key: EmailTemplateKey.PASSWORD_RESET,
    language: 'pl',
    name: 'Reset hasła',
    subject: 'Reset hasła - System SMI',
    bodyHtml: `
      <h2>Reset hasła</h2>

      <p>Kliknij w link poniżej, aby ustawić nowe hasło:</p>

      <p>
        <a href="{{resetLink}}">
          {{resetLink}}
        </a>
      </p>

      <p>Link ważny 1 godzinę.</p>
    `,
    isActive: true,
  },

  {
    key: EmailTemplateKey.PASSWORD_RESET,
    language: 'en',
    name: 'Password reset',
    subject: 'Password reset - SMI System',
    bodyHtml: `
      <h2>Password reset</h2>

      <p>Click the link below to set a new password:</p>

      <p>
        <a href="{{resetLink}}">
          {{resetLink}}
        </a>
      </p>

      <p>The link is valid for 1 hour.</p>
    `,
    isActive: true,
  },

  // =========================
  // ACCOUNT DELETED
  // =========================

  {
    key: EmailTemplateKey.ACCOUNT_DELETED,
    language: 'pl',
    name: 'Usunięcie konta',
    subject: 'Konto usunięte - System SMI',
    bodyHtml: `
      <h2>Konto zostało usunięte</h2>

      <p>Witaj {{fullName}},</p>

      <p>
        Twoje konto w systemie SMI zostało usunięte przez administratora.
      </p>

      <p>
        Jeśli uważasz, że to pomyłka, skontaktuj się z administratorem systemu.
      </p>
    `,
    isActive: true,
  },

  {
    key: EmailTemplateKey.ACCOUNT_DELETED,
    language: 'en',
    name: 'Account deleted',
    subject: 'Account deleted - SMI System',
    bodyHtml: `
      <h2>Your account has been deleted</h2>

      <p>Hello {{fullName}},</p>

      <p>
        Your SMI account has been removed by the administrator.
      </p>

      <p>
        If you believe this is a mistake, please contact the system administrator.
      </p>
    `,
    isActive: true,
  },

  // =========================
  // ADMIN PASSWORD RESET
  // =========================

  {
    key: EmailTemplateKey.ADMIN_PASSWORD_RESET,
    language: 'pl',
    name: 'Reset hasła przez administratora',
    subject: 'Administrator zresetował Twoje hasło',
    bodyHtml: `
      <h2>Hasło zostało zresetowane</h2>

      <p>Witaj {{fullName}},</p>

      <p>
        Administrator systemu zresetował Twoje hasło.
      </p>

      <p>
        <strong>Nowe hasło tymczasowe:</strong>
        {{temporaryPassword}}
      </p>

      <p>
        Po zalogowaniu zostaniesz poproszony o ustawienie nowego hasła.
      </p>
    `,
    isActive: true,
  },

  {
    key: EmailTemplateKey.ADMIN_PASSWORD_RESET,
    language: 'en',
    name: 'Admin password reset',
    subject: 'Administrator reset your password',
    bodyHtml: `
      <h2>Password has been reset</h2>

      <p>Hello {{fullName}},</p>

      <p>
        Your password has been reset by the system administrator.
      </p>

      <p>
        <strong>Temporary password:</strong>
        {{temporaryPassword}}
      </p>

      <p>
        You will be required to change your password after login.
      </p>
    `,
    isActive: true,
  },

  // =========================
  // ACCOUNT LOCKED
  // =========================

  {
    key: EmailTemplateKey.ACCOUNT_LOCKED,
    language: 'pl',
    name: 'Blokada konta',
    subject: 'Konto tymczasowo zablokowane - System SMI',
    bodyHtml: `
      <h2>Konto tymczasowo zablokowane</h2>

      <p>Cześć {{fullName}},</p>

      <p>
        Wykryliśmy kilka nieudanych prób logowania do Twojego konta.
        Ze względów bezpieczeństwa konto zostało tymczasowo zablokowane.
      </p>

      <p>
        Blokada obowiązuje do:
        <strong>{{lockedUntil}}</strong>
      </p>

      <p>
        Jeśli to nie Ty próbowałeś się zalogować,
        zalecamy zresetowanie hasła.
      </p>
    `,
    isActive: true,
  },

  {
    key: EmailTemplateKey.ACCOUNT_LOCKED,
    language: 'en',
    name: 'Account locked',
    subject: 'Account temporarily locked - SMI System',
    bodyHtml: `
      <h2>Account temporarily locked</h2>

      <p>Hello {{fullName}},</p>

      <p>
        We detected multiple failed login attempts to your account.
        For security reasons, your account has been temporarily locked.
      </p>

      <p>
        Lock expires at:
        <strong>{{lockedUntil}}</strong>
      </p>

      <p>
        If this was not you, we strongly recommend resetting your password.
      </p>
    `,
    isActive: true,
  },
  // =========================
// LOGIN NOTIFICATION
// =========================

{
	key: EmailTemplateKey.LOGIN_NOTIFICATION,
	language: 'pl',
	name: 'Nowe logowanie',
	subject: 'Nowe logowanie do konta',
	bodyHtml: `
		<h2>Nowe logowanie</h2>

		<p>Witaj {{fullName}},</p>

		<p>Wykryto nowe logowanie do Twojego konta.</p>

		<p><strong>IP:</strong> {{ip}}</p>

		<p><strong>Urządzenie:</strong> {{userAgent}}</p>

		<p><strong>Data:</strong> {{loginDate}}</p>
	`,
	isActive: true,
},

{
	key: EmailTemplateKey.LOGIN_NOTIFICATION,
	language: 'en',
	name: 'New login notification',
	subject: 'New login to your account',
	bodyHtml: `
		<h2>New login</h2>

		<p>Hello {{fullName}},</p>

		<p>A new login to your account was detected.</p>

		<p><strong>IP:</strong> {{ip}}</p>

		<p><strong>Device:</strong> {{userAgent}}</p>

		<p><strong>Date:</strong> {{loginDate}}</p>
	`,
	isActive: true,
},
];
