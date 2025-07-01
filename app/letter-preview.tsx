diff --git a/app/letter-preview.tsx b/app/letter-preview.tsx
index d72e5d3bb4b9dca0a285bdb1adb74c5282112579..8ceca031c685d4a450fd9e197457bde5ad51da70 100644
--- a/app/letter-preview.tsx
+++ b/app/letter-preview.tsx
@@ -1,339 +1,167 @@
 import React from 'react';
 import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
 import { useRouter, useLocalSearchParams } from 'expo-router';
 import { useTheme } from '@/contexts/ThemeContext';
 import { useLetters } from '@/contexts/LetterContext';
 import { useUser } from '@/contexts/UserContext';
 import { ArrowLeft, Share2, Download, Mail, Printer } from 'lucide-react-native';
 import * as Sharing from 'expo-sharing';
 import * as Print from 'expo-print';
 import * as MailComposer from 'expo-mail-composer';
+import { generateLetterContent, generatePdf } from '@/utils/letterPdf';
 
 export default function LetterPreviewScreen() {
   const { letterId } = useLocalSearchParams<{ letterId: string }>();
   const { colors } = useTheme();
   const { letters } = useLetters();
   const { profile } = useUser();
   const router = useRouter();
 
   const letter = letters.find(l => l.id === letterId);
 
   if (!letter) {
     return (
       <View style={[styles.container, { backgroundColor: colors.background }]}>
         <Text style={[styles.errorText, { color: colors.error }]}>Courrier non trouvé</Text>
       </View>
     );
   }
 
   const handleShare = async () => {
     try {
+      const pdfUri = await generatePdf(letter, profile);
       if (Platform.OS === 'web') {
         if (navigator.share) {
-          await navigator.share({
-            title: letter.title,
-            text: `Courrier: ${letter.title}`,
-            url: window.location.href
-          });
+          await navigator.share({ title: letter.title, url: pdfUri });
         } else {
-          Alert.alert('Partage', 'Fonctionnalité de partage disponible sur mobile');
+          const link = document.createElement('a');
+          link.href = pdfUri;
+          link.download = `${letter.title}.pdf`;
+          link.click();
         }
+      } else if (await Sharing.isAvailableAsync()) {
+        await Sharing.shareAsync(pdfUri);
       } else {
-        const isAvailable = await Sharing.isAvailableAsync();
-        if (isAvailable) {
-          Alert.alert('Partage', 'Partage du courrier en cours...');
-        } else {
-          Alert.alert('Erreur', 'Le partage n\'est pas disponible');
-        }
+        Alert.alert('Erreur', "Le partage n'est pas disponible");
       }
     } catch (error) {
       Alert.alert('Erreur', 'Impossible de partager le courrier');
     }
   };
 
   const handleDownload = async () => {
     try {
+      const pdfUri = await generatePdf(letter, profile);
       if (Platform.OS === 'web') {
-        Alert.alert('Téléchargement', 'Téléchargement PDF disponible sur mobile');
+        const link = document.createElement('a');
+        link.href = pdfUri;
+        link.download = `${letter.title}.pdf`;
+        link.click();
+      } else if (await Sharing.isAvailableAsync()) {
+        await Sharing.shareAsync(pdfUri);
       } else {
-        const letterContent = generateLetterContent();
-        const htmlContent = `
-          <html>
-            <head>
-              <meta charset="utf-8">
-              <title>${letter.title}</title>
-              <style>
-                body { 
-                  font-family: Arial, sans-serif; 
-                  margin: 40px; 
-                  line-height: 1.6; 
-                  color: #333;
-                }
-                .header { 
-                  display: flex; 
-                  justify-content: space-between; 
-                  margin-bottom: 40px; 
-                }
-                .sender { font-size: 14px; }
-                .date { font-size: 14px; text-align: right; }
-                .recipient { margin-bottom: 30px; font-size: 14px; }
-                .subject { margin-bottom: 30px; font-weight: bold; }
-                .content { margin-bottom: 40px; line-height: 1.8; }
-                .signature { text-align: right; margin-top: 40px; }
-              </style>
-            </head>
-            <body>
-              <div class="header">
-                <div class="sender">${letterContent.sender.replace(/\n/g, '<br>')}</div>
-                <div class="date">${letterContent.location}, le ${letterContent.date}</div>
-              </div>
-              <div class="recipient">${letterContent.recipient.replace(/\n/g, '<br>')}</div>
-              <div class="subject">Objet : ${letterContent.subject}</div>
-              <div class="content">${letterContent.content.replace(/\n/g, '<br><br>')}</div>
-              <div class="signature">${profile.firstName} ${profile.lastName}</div>
-            </body>
-          </html>
-        `;
-        
-        const { uri } = await Print.printToFileAsync({ html: htmlContent });
-        Alert.alert('Succès', 'PDF généré avec succès');
+        Alert.alert('Erreur', "Le téléchargement n'est pas disponible");
       }
     } catch (error) {
       Alert.alert('Erreur', 'Impossible de générer le PDF');
     }
   };
 
   const handleEmail = async () => {
     try {
       const isAvailable = await MailComposer.isAvailableAsync();
-      
+
       if (isAvailable) {
-        const letterContent = generateLetterContent();
+        const pdfUri = await generatePdf(letter, profile);
+        const letterContent = generateLetterContent(letter, profile);
         await MailComposer.composeAsync({
           recipients: [letter.recipient.email].filter(Boolean),
           subject: letter.title,
           body: `${letterContent.content}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
+          attachments: [pdfUri],
         });
       } else {
         Alert.alert('Email', 'Client email non disponible');
       }
     } catch (error) {
-      Alert.alert('Erreur', 'Impossible d\'ouvrir le client email');
+      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
     }
   };
 
   const handlePrint = async () => {
     try {
       if (Platform.OS === 'web') {
         window.print();
       } else {
-        const letterContent = generateLetterContent();
+        const letterContent = generateLetterContent(letter, profile);
         const htmlContent = `
           <html>
             <head>
               <meta charset="utf-8">
               <title>${letter.title}</title>
               <style>
                 body { 
                   font-family: Arial, sans-serif; 
                   margin: 40px; 
                   line-height: 1.6; 
                   color: #333;
                 }
                 .header { 
                   display: flex; 
                   justify-content: space-between; 
                   margin-bottom: 40px; 
                 }
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
                 <div class="sender">${letterContent.sender.replace(/\n/g, '<br>')}</div>
                 <div class="date">${letterContent.location}, le ${letterContent.date}</div>
               </div>
               <div class="recipient">${letterContent.recipient.replace(/\n/g, '<br>')}</div>
               <div class="subject">Objet : ${letterContent.subject}</div>
               <div class="content">${letterContent.content.replace(/\n/g, '<br><br>')}</div>
               <div class="signature">${profile.firstName} ${profile.lastName}</div>
             </body>
           </html>
         `;
         
         await Print.printAsync({ html: htmlContent });
       }
     } catch (error) {
       Alert.alert('Erreur', 'Impossible d\'imprimer le courrier');
     }
   };
 
-  const formatDate = (date: Date) => {
-    return new Intl.DateTimeFormat('fr-FR', {
-      day: 'numeric',
-      month: 'long',
-      year: 'numeric'
-    }).format(new Date(date));
-  };
-
-  const generateLetterContent = () => {
-    const senderInfo = `${profile.firstName} ${profile.lastName}${profile.company ? `\n${profile.company}` : ''}${profile.address ? `\n${profile.address}` : ''}${profile.postalCode && profile.city ? `\n${profile.postalCode} ${profile.city}` : ''}${profile.email ? `\n${profile.email}` : ''}${profile.phone ? `\n${profile.phone}` : ''}`;
-
-    const recipientInfo = `${letter.recipient.status ? letter.recipient.status + ' ' : ''}${letter.recipient.firstName} ${letter.recipient.lastName}${letter.recipient.address ? `\n${letter.recipient.address}` : ''}${letter.recipient.postalCode && letter.recipient.city ? `\n${letter.recipient.postalCode} ${letter.recipient.city}` : ''}`;
-
-    const currentDate = formatDate(letter.createdAt);
-    const currentLocation = profile.city || 'Paris';
-
-    return {
-      sender: senderInfo,
-      recipient: recipientInfo,
-      date: currentDate,
-      location: currentLocation,
-      subject: letter.title,
-      content: generateContentByType(letter.type, letter.data, letter.recipient)
-    };
-  };
-
-  const generateContentByType = (type: string, data: Record<string, any>, recipient: any) => {
-    const recipientName = `${recipient.status ? recipient.status + ' ' : ''}${recipient.firstName} ${recipient.lastName}`;
-    
-    switch (type) {
-      case 'motivation':
-        return `${recipientName},
-
-Je vous écris pour exprimer mon vif intérêt pour le poste de ${data.position || '[Poste]'} au sein de ${data.company || '[Entreprise]'}.
-
-${data.experience ? `Fort de mes ${data.experience} années d'expérience dans le domaine, ` : ''}je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste.
-
-${data.motivation || 'Votre entreprise m\'attire particulièrement par [raisons spécifiques].'}
-
-Je serais ravi(e) de pouvoir vous rencontrer pour discuter plus en détail de ma candidature et de ce que je peux apporter à votre équipe.
-
-Dans l'attente de votre retour, je vous prie d'agréer, ${recipientName}, l'expression de mes salutations distinguées.`;
-
-      case 'relance':
-        return `${recipientName},
-
-Nous nous permettons de vous relancer concernant la facture n° ${data.invoiceNumber || '[Numéro]'} d'un montant de ${data.amount || '[Montant]'} euros, échue le ${data.dueDate || '[Date]'}.
-
-${data.daysPastDue ? `Cette facture présente un retard de ${data.daysPastDue} jours.` : ''}
-
-Nous vous serions reconnaissants de bien vouloir régulariser cette situation dans les meilleurs délais.
-
-En cas de problème ou pour tout renseignement, n'hésitez pas à nous contacter.
-
-Cordialement.`;
-
-      case 'devis':
-        return `${recipientName},
-
-Nous souhaitons faire appel à vos services pour ${data.service || '[Service demandé]'}.
-
-${data.budget ? `Notre budget estimé pour ce projet est de ${data.budget} euros.` : ''}
-${data.deadline ? `Le délai souhaité pour la réalisation est de ${data.deadline}.` : ''}
-
-${data.requirements || 'Nous aimerions connaître vos disponibilités et vos tarifs pour ce projet.'}
-
-Nous vous prions de bien vouloir nous faire parvenir un devis détaillé.
-
-Dans l'attente de votre proposition, nous vous prions d'agréer nos salutations distinguées.`;
-
-      case 'reclamation':
-        return `${recipientName},
-
-Je me permets de vous contacter concernant ${data.issue || '[Problème rencontré]'}${data.orderNumber ? ` relatif à la commande n° ${data.orderNumber}` : ''}${data.purchaseDate ? ` effectuée le ${data.purchaseDate}` : ''}.
-
-${data.description || 'Description détaillée du problème rencontré.'}
-
-Je souhaiterais obtenir une solution rapide à ce problème et vous remercie par avance pour le traitement de ma demande.
-
-Cordialement.`;
-
-      case 'recommandation':
-        return `${recipientName},
-
-J'ai l'honneur de vous recommander ${data.personName || '[Nom de la personne]'}${data.position ? `, qui a occupé le poste de ${data.position}` : ''}${data.period ? ` durant la période ${data.period}` : ''}.
-
-${data.qualities || 'Cette personne a fait preuve de compétences exceptionnelles et de qualités humaines remarquables.'}
-
-Je recommande vivement cette personne et reste à votre disposition pour tout complément d'information.
-
-Cordialement.`;
-
-      case 'remerciement':
-        return `${recipientName},
-
-Je tenais à vous remercier pour ${data.reason || '[Motif de remerciement]'}${data.date ? ` en date du ${data.date}` : ''}.
-
-${data.specific || 'Votre professionnalisme et votre efficacité ont été particulièrement appréciés.'}
-
-C'est avec plaisir que je continuerai à faire appel à vos services et que je vous recommanderai.
-
-Avec mes remerciements renouvelés.`;
-
-      case 'administrative':
-        return `${recipientName},
-
-J'ai l'honneur de solliciter ${data.subject || '[Objet de la demande]'}${data.reference ? ` (Référence : ${data.reference})` : ''}.
-
-${data.details || 'Détails de la demande administrative.'}
-
-${data.urgency ? `Je souhaiterais obtenir une réponse dans un délai de ${data.urgency}.` : ''}
-
-Je vous remercie par avance pour l'attention que vous porterez à ma demande.
-
-Veuillez agréer, ${recipientName}, l'expression de mes salutations respectueuses.`;
-
-      case 'attestation':
-        return `${recipientName},
-
-Je vous prie de bien vouloir établir ${data.type || '[Type d\'attestation]'}${data.purpose ? ` destinée à ${data.purpose}` : ''}.
-
-${data.period ? `Cette attestation concerne la période du ${data.period}.` : ''}
-
-${data.additional || 'Informations complémentaires si nécessaire.'}
-
-Je vous remercie par avance pour votre diligence.
-
-Cordialement.`;
-
-      default:
-        return `${recipientName},
-
-Contenu du courrier généré automatiquement.
-
-Cordialement.`;
-    }
-  };
-
-  const letterContent = generateLetterContent();
+  const letterContent = generateLetterContent(letter, profile);
 
   return (
     <View style={[styles.container, { backgroundColor: colors.background }]}>
       <View style={styles.header}>
         <TouchableOpacity 
           style={[styles.backButton, { backgroundColor: colors.surface }]}
           onPress={() => router.back()}
         >
           <ArrowLeft size={24} color={colors.text} />
         </TouchableOpacity>
         <Text style={[styles.title, { color: colors.text }]}>Aperçu du courrier</Text>
       </View>
 
       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
         <View style={[styles.letterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <View style={styles.letterHeader}>
             <View style={styles.senderInfo}>
               <Text style={[styles.senderText, { color: colors.text }]}>{letterContent.sender}</Text>
             </View>
             <View style={styles.dateLocation}>
               <Text style={[styles.dateText, { color: colors.text }]}>
                 {letterContent.location}, le {letterContent.date}
               </Text>
             </View>
           </View>
