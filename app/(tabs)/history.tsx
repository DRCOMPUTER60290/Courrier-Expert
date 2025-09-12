import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useRecipients } from '@/contexts/RecipientContext';
import { useRouter } from 'expo-router';
import { FileText, Share2, Download, Mail, Trash2, Calendar } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { useUser } from '@/contexts/UserContext';
import { generatePdf } from '@/utils/plainPdf';
import MyBanner from '@/components/MyBanner';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { letters, deleteLetter, searchLetters, filterLetters } = useLetters();
  const { recipients } = useRecipients();
  const { profile } = useUser();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterRecipient, setFilterRecipient] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const recipientOptions = useMemo(
    () => recipients.map(r => ({ id: r.id!, name: `${r.firstName} ${r.lastName}` })),
    [recipients]
  );

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    letters.forEach(l => l.status && set.add(l.status));
    return Array.from(set);
  }, [letters]);

  const filteredLetters = useMemo(() => {
    let result = filterLetters({ date: filterDate, recipientId: filterRecipient, status: filterStatus });
    if (searchQuery) {
      const searched = searchLetters(searchQuery);
      result = result.filter(l => searched.some(s => s.id === l.id));
    }
    return result;
  }, [letters, searchQuery, filterDate, filterRecipient, filterStatus]);

  const handleLetterPress = (letterId: string) => {
    router.push({
      pathname: '/letter-preview',
      params: { letterId }
    });
  };

  const handleShare = async (letter: any) => {
    try {
      const pdfUri = await generatePdf(letter, profile.signature);
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
        Alert.alert('Erreur', "Le partage n'est pas disponible sur cet appareil");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async (letter: any) => {
    try {
      const pdfUri = await generatePdf(letter, profile.signature);
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = pdfUri;
        link.download = `${letter.title}.pdf`;
        link.click();
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert('Erreur', "Le téléchargement n'est pas disponible sur cet appareil");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  const handleEmail = async (letter: any) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();

      if (isAvailable) {
        const pdfUri = await generatePdf(letter, profile.signature);
        await MailComposer.composeAsync({
          recipients: [letter.recipient.email].filter(Boolean),
          subject: letter.title,
          body: `${letter.content}\n\nCordialement,\n${profile.firstName} ${profile.lastName}`,
          attachments: [pdfUri],
        });
      } else {
        Alert.alert('Email', 'Client email non disponible sur cet appareil');
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
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
    <View style={[styles.letterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <TouchableOpacity
        style={styles.letterContent}
        onPress={() => handleLetterPress(letter.id)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir le courrier ${letter.title}`}
        accessibilityHint="Affiche les détails du courrier"
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
          accessible
          accessibilityRole="button"
          accessibilityLabel="Partager"
          accessibilityHint="Partage le courrier"
        >
          <Share2 size={18} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleDownload(letter)}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Télécharger"
          accessibilityHint="Télécharge le courrier en PDF"
        >
          <Download size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning + '15' }]}
          onPress={() => handleEmail(letter)}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Envoyer par email"
          accessibilityHint="Ouvre le client mail"
        >
          <Mail size={18} color={colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDelete(letter)}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Supprimer"
          accessibilityHint="Supprime le courrier"
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
          {filteredLetters.length} courrier{filteredLetters.length !== 1 ? 's' : ''} trouvé{filteredLetters.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Rechercher"
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: colors.text }}>
            {filterDate ? formatDate(filterDate) : 'Date'}
          </Text>
        </TouchableOpacity>
        <Picker
          selectedValue={filterRecipient}
          onValueChange={(value) => setFilterRecipient(value)}
          style={[styles.picker, { color: colors.text }]}
        >
          <Picker.Item label="Destinataire" value={undefined} />
          {recipientOptions.map(r => (
            <Picker.Item key={r.id} label={r.name} value={r.id} />
          ))}
        </Picker>
        <Picker
          selectedValue={filterStatus}
          onValueChange={(value) => setFilterStatus(value)}
          style={[styles.picker, { color: colors.text }]}
        >
          <Picker.Item label="Statut" value={undefined} />
          {statusOptions.map(status => (
            <Picker.Item key={status} label={status} value={status} />
          ))}
        </Picker>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setFilterDate(date);
          }}
        />
      )}

      {filteredLetters.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun courrier</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Vos courriers créés apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLetters}
          renderItem={({ item }) => renderLetter(item)}
          keyExtractor={item => item.id}
          style={styles.lettersList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      )}
           {/* Bannière AdMob */}
      <MyBanner />
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
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  picker: {
    flex: 1,
    height: 40,
  },
});