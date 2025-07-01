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

export const generateContentByType = (
  type: string,
  data: Record<string, any>,
  recipient: any,
) => {
  const recipientName = `${recipient.status ? recipient.status + ' ' : ''}${recipient.firstName} ${recipient.lastName}`;

  switch (type) {
    case 'motivation':
      return `${recipientName},\n\nJe vous écris pour exprimer mon vif intérêt pour le poste de ${data.position || '[Poste]'} au sein de ${data.company || '[Entreprise]'}.\n\n${data.experience ? `Fort de mes ${data.experience} années d'expérience dans le domaine, ` : ''}je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste.\n\n${data.motivation || "Votre entreprise m'attire particulièrement par [raisons spécifiques]."}\n\nJe serais ravi(e) de pouvoir vous rencontrer pour discuter plus en détail de ma candidature et de ce que je peux apporter à votre équipe.\n\nDans l'attente de votre retour, je vous prie d'agréer, ${recipientName}, l'expression de mes salutations distinguées.`;
    case 'relance':
      return `${recipientName},\n\nNous nous permettons de vous relancer concernant la facture n° ${data.invoiceNumber || '[Numéro]'} d'un montant de ${data.amount || '[Montant]'} euros, échue le ${data.dueDate || '[Date]'}.\n\n${data.daysPastDue ? `Cette facture présente un retard de ${data.daysPastDue} jours.` : ''}\n\nNous vous serions reconnaissants de bien vouloir régulariser cette situation dans les meilleurs délais.\n\nEn cas de problème ou pour tout renseignement, n'hésitez pas à nous contacter.\n\nCordialement.`;
    case 'devis':
      return `${recipientName},\n\nNous souhaitons faire appel à vos services pour ${data.service || '[Service demandé]'}.\n\n${data.budget ? `Notre budget estimé pour ce projet est de ${data.budget} euros.` : ''}${data.deadline ? ` Le délai souhaité pour la réalisation est de ${data.deadline}.` : ''}\n\n${data.requirements || 'Nous aimerions connaître vos disponibilités et vos tarifs pour ce projet.'}\n\nNous vous prions de bien vouloir nous faire parvenir un devis détaillé.\n\nDans l'attente de votre proposition, nous vous prions d'agréer nos salutations distinguées.`;
    case 'reclamation':
      return `${recipientName},\n\nJe me permets de vous contacter concernant ${data.issue || '[Problème rencontré]'}${data.orderNumber ? ` relatif à la commande n° ${data.orderNumber}` : ''}${data.purchaseDate ? ` effectuée le ${data.purchaseDate}` : ''}.\n\n${data.description || 'Description détaillée du problème rencontré.'}\n\nJe souhaiterais obtenir une solution rapide à ce problème et vous remercie par avance pour le traitement de ma demande.\n\nCordialement.`;
    case 'recommandation':
      return `${recipientName},\n\nJ'ai l'honneur de vous recommander ${data.personName || '[Nom de la personne]'}${data.position ? `, qui a occupé le poste de ${data.position}` : ''}${data.period ? ` durant la période ${data.period}` : ''}.\n\n${data.qualities || 'Cette personne a fait preuve de compétences exceptionnelles et de qualités humaines remarquables.'}\n\nJe recommande vivement cette personne et reste à votre disposition pour tout complément d'information.\n\nCordialement.`;
    case 'remerciement':
      return `${recipientName},\n\nJe tenais à vous remercier pour ${data.reason || '[Motif de remerciement]'}${data.date ? ` en date du ${data.date}` : ''}.\n\n${data.specific || 'Votre professionnalisme et votre efficacité ont été particulièrement appréciés.'}\n\nC'est avec plaisir que je continuerai à faire appel à vos services et que je vous recommanderai.\n\nAvec mes remerciements renouvelés.`;
    case 'administrative':
      return `${recipientName},\n\nJ'ai l'honneur de solliciter ${data.subject || '[Objet de la demande]'}${data.reference ? ` (Référence : ${data.reference})` : ''}.\n\n${data.details || 'Détails de la demande administrative.'}\n\n${data.urgency ? `Je souhaiterais obtenir une réponse dans un délai de ${data.urgency}.` : ''}\n\nJe vous remercie par avance pour l'attention que vous porterez à ma demande.\n\nVeuillez agréer, ${recipientName}, l'expression de mes salutations respectueuses.`;
    case 'attestation':
      return `${recipientName},\n\nJe vous prie de bien vouloir établir ${data.type || "[Type d'attestation]"}${data.purpose ? ` destinée à ${data.purpose}` : ''}.\n\n${data.period ? `Cette attestation concerne la période du ${data.period}.` : ''}\n\n${data.additional || 'Informations complémentaires si nécessaire.'}\n\nJe vous remercie par avance pour votre diligence.\n\nCordialement.`;
    default:
      return `${recipientName},\n\nContenu du courrier généré automatiquement.\n\nCordialement.`;
  }
};

export const generateLetterContent = (
  letter: Letter,
  profile: UserProfile,
) => {
  const senderInfo = `${profile.firstName} ${profile.lastName}${profile.company ? `\n${profile.company}` : ''}${profile.address ? `\n${profile.address}` : ''}${profile.postalCode && profile.city ? `\n${profile.postalCode} ${profile.city}` : ''}${profile.email ? `\n${profile.email}` : ''}${profile.phone ? `\n${profile.phone}` : ''}`;

  const recipientInfo = `${letter.recipient.status ? letter.recipient.status + ' ' : ''}${letter.recipient.firstName} ${letter.recipient.lastName}${letter.recipient.address ? `\n${letter.recipient.address}` : ''}${letter.recipient.postalCode && letter.recipient.city ? `\n${letter.recipient.postalCode} ${letter.recipient.city}` : ''}`;

  const currentDate = formatDate(letter.createdAt);
  const currentLocation = profile.city || 'Paris';

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
        <div class="header">
          <div class="sender">${content.sender.replace(/\n/g, '<br>')}</div>
          <div class="date">${content.location}, le ${content.date}</div>
        </div>
        <div class="recipient">${content.recipient.replace(/\n/g, '<br>')}</div>
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
