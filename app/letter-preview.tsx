// app/letter-preview.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { generatePdf, generateHtml } from '@/utils/letterPdf';
import { WebView } from 'react-native-webview';

export default function LetterPreviewScreen() {
  // 1️⃣ Récupère l’ID + contexte
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors } = useTheme();
  const { letters } = useLetters();
  const { profile } = useUser();
  const router = useRouter();

  // 2️⃣ Trouve la lettre
  const letter = letters.find(l => l.id === letterId);
  const content = letter?.content ?? null;

  if (!letter || !content) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Courrier non trouvé
        </Text>
      </View>
    );
  }

  // 3️⃣ Génère le HTML
  const html = generateHtml(letter, profile);

  // 4️⃣ Partage / téléchargement / mail / impression
  const shareFile = useCallback(
    async (uri: string) => {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: letter.title, url: uri });
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
        Alert.alert('Erreur', "Le téléchargement n’est pas disponible");
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

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
        body: letter.content,
        attachments: [uri],
        isHtml: true,
      });
    } catch {
      Alert.alert('Erreur', "Impossible d’envoyer le courrier");
    }
  };

  const handlePrint = async () => {
    try {
      if (Platform.OS === 'web') {
        window.print();
      } else {
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d’imprimer le courrier");
    }
  };

  // 5️⃣ Rendu de la page
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête retour + titre */}
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

      {/* Zone de prévisualisation */}
      <View style={styles.contentContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={[styles.content, { backgroundColor: '#fff' }]}
        />
      </View>

      {/* Barre d’actions */}
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

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
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
