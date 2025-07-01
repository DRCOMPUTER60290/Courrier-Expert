import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useRouter } from 'expo-router';
import { FileText, Share2, Download, Mail, Trash2, Calendar } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { letters, deleteLetter } = useLetters();
  const router = useRouter();

  const handleLetterPress = (letterId: string) => {
    router.push({
      pathname: '/letter-preview',
      params: { letterId }
    });
  };

  const handleShare = async (letter: any) => {
    try {
      if (Platform.OS === 'web') {
        // Pour le web, utiliser l'API Web Share si disponible
        if (navigator.share) {
          await navigator.share({
            title: letter.title,
            text: `Courrier: ${letter.title}`,
            url: window.location.href
          });
        } else {
          Alert.alert('Partage', `Partage de "${letter.title}" - Fonctionnalité disponible sur mobile`);
        }
      } else {
        // Pour mobile, utiliser expo-sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          // Créer un contenu temporaire à partager
          const content = `Courrier: ${letter.title}\n\nCréé le: ${formatDate(letter.createdAt)}`;
          Alert.alert('Partage', `Partage de "${letter.title}" en cours...`);
        } else {
          Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async (letter: any) => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Téléchargement', `Téléchargement de "${letter.title}" en PDF - Fonctionnalité disponible sur mobile`);
      } else {
        // Générer le PDF avec expo-print
        const htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>${letter.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .header { margin-bottom: 30px; }
                .title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
                .content { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">${letter.title}</div>
                <div>Créé le: ${formatDate(letter.createdAt)}</div>
              </div>
              <div class="content">
                <p>Destinataire: ${letter.recipient.firstName} ${letter.recipient.lastName}</p>
                <p>${letter.content}</p>
              </div>
            </body>
          </html>
        `;
        
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        Alert.alert('Succès', `PDF généré: ${letter.title}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  const handleEmail = async (letter: any) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [letter.recipient.email].filter(Boolean),
          subject: letter.title,
          body: `Bonjour,\n\nVeuillez trouver ci-joint le courrier: ${letter.title}\n\nCordialement`,
        });
      } else {
        Alert.alert('Email', 'Client email non disponible sur cet appareil');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le client email');
    }
  };

  const handleDelete = (letter: any) => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer "${letter.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => deleteLetter(letter.id)
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const renderLetter = (letter: any) => (
    <View key={letter.id} style={[styles.letterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.letterContent}
        onPress={() => handleLetterPress(letter.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.letterIcon, { backgroundColor: colors.primary + '15' }]}>
          <FileText size={24} color={colors.primary} />
        </View>
        <View style={styles.letterDetails}>
          <Text style={[styles.letterTitle, { color: colors.text }]}>{letter.title}</Text>
          <Text style={[styles.letterRecipient, { color: colors.textSecondary }]}>
            {letter.recipient.firstName} {letter.recipient.lastName}
          </Text>
          <View style={styles.letterMeta}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.letterDate, { color: colors.textSecondary }]}>
              {formatDate(letter.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.accent + '15' }]}
          onPress={() => handleShare(letter)}
        >
          <Share2 size={18} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleDownload(letter)}
        >
          <Download size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.warning + '15' }]}
          onPress={() => handleEmail(letter)}
        >
          <Mail size={18} color={colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDelete(letter)}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Historique</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {letters.length} courrier{letters.length !== 1 ? 's' : ''} créé{letters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {letters.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun courrier</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Vos courriers créés apparaîtront ici
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.lettersList} showsVerticalScrollIndicator={false}>
          {letters.map(renderLetter)}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  lettersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  letterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  letterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterDetails: {
    flex: 1,
  },
  letterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  letterRecipient: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  letterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  letterDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});