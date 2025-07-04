// app/letter-preview.tsx
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Share2, Download, Mail, Printer } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';
import { generateLetterContent, generatePdf, generateHtml } from '@/utils/letterPdf';

export default function LetterPreviewScreen() {
  // 1. Récupère l'ID de la lettre depuis l'URL
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors } = useTheme();
  const { letters } = useLetters();
  const { profile } = useUser();
  const router = useRouter();

  // 2. Cherche la lettre dans le contexte
  const letter = letters.find(l => l.id === letterId);

  // 3. Génère le contenu textuel de la lettre
  const content = useMemo(
    () => (letter ? generateLetterContent(letter, profile) : null),
    [letter, profile]
  );

  if (!letter || !content) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Courrier non trouvé
        </Text>
      </View>
    );
  }

  // 4. Partage (Share API web / expo-sharing)
  const shareFile = useCallback(
    async (uri: string) => {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: letter.title,
            url: uri,
          });
        } else {
          const link = document.createElement('a');
          link.href = uri;
          link.download = `${letter.title}.pdf`;
          link.click();
        }
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erreur', "Le partage n'est pas disponible");
      }
    },
    [letter]
  );

  const handleShare = async () => {
    try {
      const uri = await generatePdf(letter, profile);
      await shareFile(uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  // 5. Télécharger (même logique que partager sur web)
  const handleDownload = async () => {
    try {
      const uri = await generatePdf(letter, profile);
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `${letter.title}.pdf`;
        link.click();
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erreur', "Le téléchargement n'est pas disponible");
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  // 6. Email (expo-mail-composer)
  const handleEmail = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Email', 'Client email non disponible');
        return;
      }
      const uri = await generatePdf(letter, profile);
      await MailComposer.composeAsync({
        recipients: [letter.recipient.email].filter(Boolean),
        subject: letter.title,
        body: `${content.body}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
        attachments: [uri],
      });
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
    }
  };

  // 7. Imprimer (window.print / expo-print)
  const handlePrint = async () => {
    try {
      if (Platform.OS === 'web') {
        window.print();
      } else {
        const html = generateHtml(letter, profile);
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'imprimer le courrier");
    }
  };

  // 8. Rendu de l'écran
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête avec le bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Aperçu du courrier
        </Text>
      </View>

      {/* Contenu de la lettre */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.letterContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Adresse expéditeur + date */}
          <View style={styles.senderDate}>
            <Text style={[styles.senderText, { color: colors.text }]}> {content.sender} </Text>
            <Text style={[styles.dateText, { color: colors.text }]}> {content.date} </Text>
          </View>

          {/* Destinataire */}
          <View style={styles.recipientInfo}>
            <Text style={[styles.recipientText, { color: colors.text }]}>
              {content.recipient}
            </Text>
          </View>

          {/* Référence */}
          {content.reference ? (
            <View style={styles.referenceLine}>
              <Text style={[styles.referenceText, { color: colors.text }]}>Réf. : {content.reference}</Text>
            </View>
          ) : null}

          {/* Salutation */}
          <View style={styles.salutationLine}>
            <Text style={[styles.salutationText, { color: colors.text }]}>{content.salutation}</Text>
          </View>

          {/* Corps du courrier */}
          <View style={styles.letterBody}>
            <Text style={[styles.bodyText, { color: colors.text }]}>{content.body}</Text>
          </View>

          {/* Conclusion */}
          <View style={styles.conclusionLine}>
            <Text style={[styles.conclusionText, { color: colors.text }]}>{content.conclusion}</Text>
          </View>

          {/* Signature */}
          <View style={styles.signature}>
            <Text style={[styles.signatureText, { color: colors.text }]}>
              {profile.firstName} {profile.lastName}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Barre d'actions */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={handleShare}
        >
          <Share2 size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleDownload}
        >
          <Download size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={handleEmail}
        >
          <Mail size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={handlePrint}
        >
          <Printer size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
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
  title: { fontSize: 20, fontFamily: 'Inter-Bold', flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  letterContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  senderDate: { alignItems: 'flex-end', marginBottom: 24 },
  senderText: { fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 20, textAlign: 'right' },
  dateText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  recipientInfo: { marginBottom: 24 },
  recipientText: { fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 20 },
  referenceLine: { marginBottom: 24 },
  referenceText: { fontSize: 14, fontFamily: 'Inter-SemiBold', fontStyle: 'italic' },
  salutationLine: { marginBottom: 24 },
  salutationText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  letterBody: { marginBottom: 24 },
  bodyText: { fontSize: 16, fontFamily: 'Inter-Regular', lineHeight: 24 },
  conclusionLine: { marginBottom: 24 },
  conclusionText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  signature: { alignItems: 'flex-start' },
  signatureText: { fontSize: 16, fontFamily: 'Inter-SemiBold' },
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