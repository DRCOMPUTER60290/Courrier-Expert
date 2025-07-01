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
import { generateLetterContent, generatePdf } from '@/utils/letterPdf';

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
      const pdfUri = await generatePdf(letter, profile);
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: letter.title, url: pdfUri });
        } else {
          const link = document.createElement('a');
          link.href = pdfUri;
          link.download = `${letter.title}.pdf`;
          link.click();
        }
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert('Erreur', "Le partage n'est pas disponible");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async () => {
    try {
      const pdfUri = await generatePdf(letter, profile);
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = pdfUri;
        link.download = `${letter.title}.pdf`;
        link.click();
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert('Erreur', "Le téléchargement n'est pas disponible");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  const handleEmail = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();

      if (isAvailable) {
        const pdfUri = await generatePdf(letter, profile);
        const letterContent = generateLetterContent(letter, profile);
        await MailComposer.composeAsync({
          recipients: [letter.recipient.email].filter(Boolean),
          subject: letter.title,
          body: `${letterContent.content}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
          attachments: [pdfUri],
        });
      } else {
        Alert.alert('Email', 'Client email non disponible');
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
    }
  };

  const handlePrint = async () => {
    try {
      if (Platform.OS === 'web') {
        window.print();
      } else {
        const letterContent = generateLetterContent(letter, profile);
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

  const letterContent = generateLetterContent(letter, profile);

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

          <View style={styles.recipientInfo}>
            <Text style={[styles.recipientText, { color: colors.text }]}>{letterContent.recipient}</Text>
          </View>

          <View style={styles.subjectLine}>
            <Text style={[styles.subjectText, { color: colors.text }]}>
              <Text style={{ fontFamily: 'Inter-SemiBold' }}>Objet : </Text>
              {letterContent.subject}
            </Text>
          </View>

          <View style={styles.letterBody}>
            <Text style={[styles.bodyText, { color: colors.text }]}>{letterContent.content}</Text>
          </View>

          <View style={styles.signature}>
            <Text style={[styles.signatureText, { color: colors.text }]}>
              {profile.firstName} {profile.lastName}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={handleShare}>
          <Share2 size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleDownload}>
          <Download size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.warning }]} onPress={handleEmail}>
          <Mail size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]} onPress={handlePrint}>
          <Printer size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  letterContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  senderInfo: {
    flex: 1,
  },
  senderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  dateLocation: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  recipientInfo: {
    marginBottom: 24,
  },
  recipientText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  subjectLine: {
    marginBottom: 24,
  },
  subjectText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  letterBody: {
    marginBottom: 32,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  signature: {
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 100,
  },
});