import { EmailTemplateKey } from './email-template-key.enum';

export const defaultEmailTemplates = [
  {
    key: EmailTemplateKey.ACCOUNT_CREATED,
    name: 'Utworzenie konta',
    subject: 'Twoje konto w systemie SMI',
    bodyHtml: `
      <h2>Konto zostało utworzone</h2>
      <p>Witaj {{fullName}},</p>
      <p>Możesz się zalogować do systemu.</p>
      <p><strong>Hasło tymczasowe:</strong> {{temporaryPassword}}</p>
      <p>Po pierwszym logowaniu zostaniesz poproszony o zmianę hasła.</p>
    `,
    isActive: true,
  },
  {
    key: EmailTemplateKey.PASSWORD_RESET,
    name: 'Reset hasła',
    subject: 'Reset hasła - System SMI',
    bodyHtml: `
      <h2>Reset hasła</h2>
      <p>Kliknij w link poniżej, aby ustawić nowe hasło:</p>
      <p><a href="{{resetLink}}">{{resetLink}}</a></p>
      <p>Link ważny 1 godzinę.</p>
    `,
    isActive: true,
  },
  {
    key: EmailTemplateKey.ACCOUNT_DELETED,
    name: 'Usunięcie konta',
    subject: 'Konto usunięte - System SMI',
    bodyHtml: `
      <h2>Konto zostało usunięte</h2>
      <p>Witaj {{fullName}},</p>
      <p>Twoje konto w systemie SMI zostało usunięte przez administratora.</p>
      <p>Jeśli uważasz, że to pomyłka, skontaktuj się z administratorem systemu.</p>
    `,
    isActive: true,
  },
];