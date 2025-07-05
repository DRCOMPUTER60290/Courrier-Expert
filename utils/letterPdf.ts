import * as Print from 'expo-print';
import { Letter } from '@/contexts/LetterContext';
import { UserProfile } from '@/contexts/UserContext';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};


export const generateLetterContent = (
  letter: Letter,
  profile: UserProfile,
) => {
  const senderInfo = `${profile.status ? profile.status + ' ' : ''}${profile.firstName} ${profile.lastName}${profile.company ? `\n${profile.company}` : ''}${profile.address ? `\n${profile.address}` : ''}${profile.postalCode && profile.city ? `\n${profile.postalCode} ${profile.city}` : ''}${profile.email ? `\n${profile.email}` : ''}${profile.phone ? `\n${profile.phone}` : ''}`;

  const recipientInfo = `${letter.recipient.status ? letter.recipient.status + ' ' : ''}${letter.recipient.firstName} ${letter.recipient.lastName}${letter.recipient.address ? `\n${letter.recipient.address}` : ''}${letter.recipient.postalCode && letter.recipient.city ? `\n${letter.recipient.postalCode} ${letter.recipient.city}` : ''}`;

  const currentDate = formatDate(letter.createdAt);
  const currentLocation = profile.city || 'Paris';

  const reference =
    (letter.data &&
      (letter.data.reference ||
        letter.data.invoiceNumber ||
        letter.data.orderNumber)) ||
    '';

  const isFemale =
    letter.recipient.status &&
    /(madame|mme|mademoiselle)/i.test(letter.recipient.status);

  const salutation = letter.recipient.lastName
    ? `${isFemale ? 'Chère' : 'Cher'} ${
        letter.recipient.status ? letter.recipient.status + ' ' : ''
      }${letter.recipient.lastName},`
    : 'À qui de droit,';

  const conclusion = letter.recipient.lastName
    ? `Veuillez agréer, ${
        letter.recipient.status ? letter.recipient.status + ' ' : ''
      }${letter.recipient.lastName}, l'expression de mes sentiments respectueux.`
    : 'Mes sincères salutations.';

  return {
    sender: senderInfo,
    recipient: recipientInfo,
    date: currentDate,
    location: currentLocation,
    subject: letter.title,
    reference,
    salutation,
    body: letter.content,
    conclusion,
    content: letter.content,
  };
};

export const generateHtml = (letter: Letter, profile: UserProfile) => {
  const content = generateLetterContent(letter, profile);
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <title>${letter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .sender-date { text-align: right; margin-bottom: 20px; }
          .recipient { margin-bottom: 20px; font-size: 14px; }
          .subject { margin-bottom: 20px; font-weight: bold; }
          .reference { margin-bottom: 20px; font-size: 14px; font-style: italic; }
          .salutation { margin-bottom: 20px; }
          .body { margin-bottom: 20px; line-height: 1.8; }
          .conclusion { margin-bottom: 40px; }
          .signature { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="sender-date">
          <div class="sender">${content.sender.replace(/\n/g, '<br>')}</div>
          <div class="date">${content.location}, le ${content.date}</div>
        </div>
        <div class="recipient">${content.recipient.replace(/\n/g, '<br>')}</div>
        <div class="subject">Objet : ${content.subject}</div>
        ${content.reference ? `<div class="reference">Réf. : ${content.reference}</div>` : ''}
        <p class="salutation">${content.salutation}</p>
        <div class="body">${content.body.replace(/\n/g, '<br><br>')}</div>
        <p class="conclusion">${content.conclusion}</p>
        <div class="signature">${profile.firstName} ${profile.lastName}</div>
      </body>
    </html>
  `;
};

export const generatePdf = async (letter: Letter, profile: UserProfile) => {
  const html = generateHtml(letter, profile);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};