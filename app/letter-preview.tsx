// app/letter-preview.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Share2, Download, Mail, Printer, Edit, Save, X } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';
import { generatePdf, htmlForPrint } from '@/utils/plainPdf';

export default function LetterPreviewScreen() {
  // 1. Récupère l'ID de la lettre depuis l'URL
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors } = useTheme();
  const { letters, updateLetter } = useLetters();
  const { profile } = useUser();
  const router = useRouter();

  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // 2. Cherche la lettre dans le contexte
  const letter = letters.find(l => l.id === letterId);
  const formattedDate = letter
    ? new Date(letter.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '';

  if (!letter) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.errorText, { color: colors.error }]}> 
          Courrier non trouvé 
        </Text> 
      </View>
    );
  }

  // 3. Handlers for share, download, email, print...
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
      const uri = await generatePdf(letter);
      await shareFile(uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async () => {
    try {
      const uri = await generatePdf(letter);
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

  const handleEmail = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Email', 'Client email non disponible');
        return;
      }
      const uri = await generatePdf(letter);
      await MailComposer.composeAsync({
        recipients: [letter.recipient.email].filter(Boolean),
        subject: letter.title,
        body: `${letter.content}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
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
      } else {
        const html = htmlForPrint(letter);
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'imprimer le courrier");
    }
  };

  // Handlers pour l'édition
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(letter.content);
  };

  const handleSave = async () => {
    try {
      if (updateLetter) {
        updateLetter(letter.id, { ...letter, content: editedContent });
        setIsEditing(false);
        Alert.alert('Succès', 'Lettre modifiée avec succès');
      } else {
        Alert.alert('Erreur', 'Fonction de mise à jour non disponible');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(letter.content);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}> 
          {isEditing ? 'Modifier le courrier' : 'Aperçu du courrier'}
        </Text>
      </View>

      {/* Letter preview */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.letterContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Body */}
          <View style={styles.letterBody}>
            {isEditing ? (
              <TextInput
                style={[
                  styles.editInput,
                  { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.background
                  }
                ]}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                textAlignVertical="top"
                placeholder="Contenu de la lettre..."
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.bodyText, { color: colors.text }]}> 
                {letter.content} 
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {/* Bouton Modifier/Sauvegarder */}
        <TouchableOpacity
          style={[
            styles.actionButton, 
            { backgroundColor: isEditing ? colors.primary : colors.accent }
          ]}
          onPress={isEditing ? handleSave : handleEdit}
        >
          {isEditing ? <Save size={20} color="#fff" /> : <Edit size={20} color="#fff" />}
        </TouchableOpacity>

        {/* Bouton Annuler (visible uniquement en mode édition) */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleCancel}
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Boutons d'actions (désactivés en mode édition) */}
        {!isEditing && (
          <>
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
          </>
        )}
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
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
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
  editInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    minHeight: 300,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    textAlignVertical: 'top',
  },
  signature: { alignItems: 'flex-end' },
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginLeft: 8,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginLeft: 8,
  },
});