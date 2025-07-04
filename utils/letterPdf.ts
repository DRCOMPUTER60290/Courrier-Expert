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
  const senderInfo = `${profile.firstName} ${profile.lastName}${profile.company ? `\n${profile.company}` : ''}${profile.address ? `\n${profile.address}` : ''}${profile.postalCode && profile.city ? `\n${profile.postalCode} ${profile.city}` : ''}${profile.email ? `\n${profile.email}` : ''}${profile.phone ? `\n${profile.phone}` : ''}`;

  const recipientInfo = `${letter.recipient.status ? letter.recipient.status + ' ' : ''}${letter.recipient.firstName} ${letter.recipient.lastName}${letter.recipient.address ? `\n${letter.recipient.address}` : ''}${letter.recipient.postalCode && letter.recipient.city ? `\n${letter.recipient.postalCode} ${letter.recipient.city}` : ''}`;

  const currentDate = formatDate(letter.createdAt);
 // Si ton profile contient { city, postalCode, address }
  const currentLocation = profile.city
    ? `${profile.postalCode} ${profile.city}`
    : 'Ville inconnue';

  return {
    sender: senderInfo,
    recipient: recipientInfo,
    date: currentDate,
    location: currentLocation,
    subject: letter.title,
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
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .sender { font-size: 14px; }
          .date { font-size: 14px; text-align: right; }
          .recipient { margin-bottom: 30px; font-size: 14px; }
          .subject { margin-bottom: 30px; font-weight: bold; }
          .content { margin-bottom: 40px; line-height: 1.8; }
          .signature { text-align: right; margin-top: 40px; }
        </style>
      </head>
      <body>
         <!-- En-tête : expéditeur -->
      <div class="header-sender">
       ${content.sender.replace(/\n/g, '<br>')}
      </div>

      <!-- Bloc destinataire -->
      <div class="header-recipient" style="margin-top:20px;">
        ${content.recipient.replace(/\n/g, '<br>')}
      </div>

     <!-- Date & lieu alignés à droite -->
      <div class="header-date" style="text-align:right; margin-top:20px;">
        ${content.location}, le ${content.date}
      </div>
        <div class="subject">Objet : ${content.subject}</div>
        <div class="content">${content.content.replace(/\n/g, '<br><br>')}</div>
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
