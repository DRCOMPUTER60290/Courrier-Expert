import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
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
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors } = useTheme();
  const { letters } = useLetters();
  const { profile } = useUser();
  const router = useRouter();

  const letter = letters.find(l => l.id === letterId);

  const content = useMemo(() => (letter ? generateLetterContent(letter, profile) : null), [letter, profile]);

  const shareFile = useCallback(async (uri: string) => {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: letter?.title ?? 'courrier', url: uri });
      } else {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `${letter?.title ?? 'courrier'}.pdf`;
        link.click();
      }
    } else if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Erreur', "Le partage n'est pas disponible");
    }
  }, [letter]);

  const handleShare = async () => {
    try {
      if (!letter) return;
      const uri = await generatePdf(letter, profile);
      await shareFile(uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async () => {
    try {
      if (!letter) return;
      const uri = await generatePdf(letter, profile);
      await shareFile(uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  const handleEmail = async () => {
    try {
      if (!letter) return;
      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        Alert.alert('Email', 'Client email non disponible');
        return;
      }
      const uri = await generatePdf(letter, profile);
      const letterContent = generateLetterContent(letter, profile);
      await MailComposer.composeAsync({
        recipients: [letter.recipient.email].filter(Boolean),
        subject: letter.title,
        body: `${letterContent.content}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
        attachments: [uri],
      });
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
    }
  };

  const handlePrint = async () => {
    try {
      if (Platform.OS === 'web') {
        window.print();
      } else if (letter) {
        const html = generateHtml(letter, profile);
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'imprimer le courrier");
    }
  };

  if (!letter || !content) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Courrier non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Aperçu du courrier</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.letterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.letterHeader}>
            <View style={styles.senderInfo}>
              <Text style={[styles.senderText, { color: colors.text }]}>{content.sender}</Text>
            </View>
            <View style={styles.dateLocation}>
              <Text style={[styles.dateText, { color: colors.text }]}>{content.location}, le {content.date}</Text>
            </View>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={[styles.recipientText, { color: colors.text }]}>{content.recipient}</Text>
          </View>
          <View style={styles.subjectLine}>
            <Text style={[styles.subjectText, { color: colors.text }]}>
              <Text style={{ fontFamily: 'Inter-SemiBold' }}>Objet : </Text>
              {content.subject}
            </Text>
          </View>
          <View style={styles.letterBody}>
            <Text style={[styles.bodyText, { color: colors.text }]}>{content.content}</Text>
          </View>
          <View style={styles.signature}>
            <Text style={[styles.signatureText, { color: colors.text }]}>{profile.firstName} {profile.lastName}</Text>
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
  container: { flex: 1, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  title: { fontSize: 20, fontFamily: 'Inter-Bold', flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  letterContainer: { padding: 24, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  letterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  senderInfo: { flex: 1 },
  senderText: { fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 20 },
  dateLocation: { alignItems: 'flex-end' },
  dateText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  recipientInfo: { marginBottom: 24 },
  recipientText: { fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 20 },
  subjectLine: { marginBottom: 24 },
  subjectText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  letterBody: { marginBottom: 32 },
  bodyText: { fontSize: 16, fontFamily: 'Inter-Regular', lineHeight: 24 },
  signature: { alignItems: 'flex-end' },
  signatureText: { fontSize: 16, fontFamily: 'Inter-SemiBold' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1 },
  actionButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontFamily: 'Inter-SemiBold', textAlign: 'center', marginTop: 100 },
});
