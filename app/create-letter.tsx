import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters, Letter } from '@/contexts/LetterContext';
import { useRecipients, Recipient } from '@/contexts/RecipientContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, FileText, Send, Loader, Wifi, WifiOff, SortAsc, SortDesc } from 'lucide-react-native';
import DatePicker from '@/components/DatePicker';
import { generateLetter } from '@/services/letterApi';
import { saveDraft, loadDraft, clearDraft } from '@/utils/draftStorage';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'multiline' | 'number' | 'date';
  placeholder: string;
  required?: boolean;
}

const letterTypeFields: Record<string, FormField[]> = {
  motivation: [
    { key: 'position', label: 'Poste visé', type: 'text', placeholder: 'Développeur Full-Stack', required: true },
    { key: 'company', label: 'Entreprise', type: 'text', placeholder: 'Nom de l\'entreprise', required: true },
    { key: 'experience', label: 'Années d\'expérience', type: 'number', placeholder: '3' },
    { key: 'motivation', label: 'Motivation principale', type: 'multiline', placeholder: 'Pourquoi ce poste vous intéresse...' },
  ],
  relance: [
    { key: 'invoiceNumber', label: 'Numéro de facture', type: 'text', placeholder: 'FAC-2024-001', required: true },
    { key: 'amount', label: 'Montant (€)', type: 'number', placeholder: '1500', required: true },
    { key: 'dueDate', label: 'Date d\'échéance', type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'daysPastDue', label: 'Jours de retard', type: 'number', placeholder: '15' },
  ],
  devis: [
    { key: 'service', label: 'Service demandé', type: 'text', placeholder: 'Développement site web', required: true },
    { key: 'budget', label: 'Budget estimé (€)', type: 'number', placeholder: '5000' },
    { key: 'deadline', label: 'Délai souhaité', type: 'text', placeholder: '2 mois' },
    { key: 'requirements', label: 'Exigences spécifiques', type: 'multiline', placeholder: 'Détails du projet...' },
  ],
  reclamation: [
    { key: 'orderNumber', label: 'Numéro de commande', type: 'text', placeholder: 'CMD-2024-001' },
    { key: 'issue', label: 'Nature du problème', type: 'text', placeholder: 'Produit défectueux', required: true },
    { key: 'purchaseDate', label: 'Date d\'achat', type: 'date', placeholder: 'JJ/MM/AAAA' },
    { key: 'description', label: 'Description détaillée', type: 'multiline', placeholder: 'Décrivez le problème...', required: true },
  ],
  recommandation: [
    { key: 'personName', label: 'Nom de la personne', type: 'text', placeholder: 'Jean Dupont', required: true },
    { key: 'position', label: 'Poste occupé', type: 'text', placeholder: 'Chef de projet' },
    { key: 'period', label: 'Période de collaboration', type: 'text', placeholder: '2020-2023' },
    { key: 'qualities', label: 'Qualités principales', type: 'multiline', placeholder: 'Compétences et qualités...' },
  ],
  remerciement: [
    { key: 'reason', label: 'Motif de remerciement', type: 'text', placeholder: 'Excellent service', required: true },
    { key: 'specific', label: 'Éléments spécifiques', type: 'multiline', placeholder: 'Ce qui vous a particulièrement marqué...' },
    { key: 'date', label: 'Date de l\'événement', type: 'date', placeholder: 'JJ/MM/AAAA' },
  ],
  administrative: [
    { key: 'subject', label: 'Objet de la demande', type: 'text', placeholder: 'Demande de certificat', required: true },
    { key: 'reference', label: 'Référence dossier', type: 'text', placeholder: 'REF-2024-001' },
    { key: 'urgency', label: 'Délai souhaité', type: 'text', placeholder: '15 jours' },
    { key: 'details', label: 'Détails de la demande', type: 'multiline', placeholder: 'Informations complémentaires...', required: true },
  ],
  attestation: [
    { key: 'type', label: 'Type d\'attestation', type: 'text', placeholder: 'Attestation d\'emploi', required: true },
    { key: 'purpose', label: 'Utilisation prévue', type: 'text', placeholder: 'Demande de prêt' },
    { key: 'period', label: 'Période concernée', type: 'text', placeholder: '01/01/2024 - 31/12/2024' },
    { key: 'additional', label: 'Informations supplémentaires', type: 'multiline', placeholder: 'Détails additionnels...' },
  ],
  preavis: [
    { key: 'propertyAddress', label: 'Adresse du logement', type: 'text', placeholder: 'Adresse complète', required: true },
    { key: 'leaseStart', label: 'Date de début de bail', type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'departureDate', label: 'Date de départ souhaitée', type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'noticePeriod', label: 'Durée du préavis', type: 'text', placeholder: '3 mois', required: true },
  ],
  resiliation: [
    { key: 'service', label: 'Fournisseur / Service', type: 'text', placeholder: 'Nom du service', required: true },
    { key: 'contractNumber', label: 'Numéro de contrat', type: 'text', placeholder: 'CTR-2024-001', required: true },
    { key: 'terminationDate', label: 'Date souhaitée de résiliation', type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'reason', label: 'Motif', type: 'multiline', placeholder: 'Raison de la résiliation' },
  ],
  contestation: [
    { key: 'reference', label: 'Référence contestée', type: 'text', placeholder: 'Facture, PV...', required: true },
    { key: 'reason', label: 'Motif de contestation', type: 'multiline', placeholder: 'Expliquez le motif', required: true },
    { key: 'incidentDate', label: "Date de l'incident", type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'incidentPlace', label: "Lieu de l'incident", type: 'text', placeholder: 'Ville ou adresse', required: true },
    { key: 'evidence', label: 'Pièces justificatives', type: 'multiline', placeholder: 'Références ou description' },
  ],
  'delai-paiement': [
    { key: 'invoiceNumber', label: 'Numéro de facture', type: 'text', placeholder: 'FAC-2024-001', required: true },
    { key: 'amount', label: 'Montant dû (€)', type: 'number', placeholder: '1500', required: true },
    { key: 'currentDueDate', label: "Date d'échéance actuelle", type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'desiredDueDate', label: "Date d'échéance souhaitée", type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'justification', label: 'Justification', type: 'multiline', placeholder: 'Expliquez votre demande', required: true },
  ],
  entretien: [
    { key: 'subject', label: "Objet de l'entretien", type: 'text', placeholder: 'Motif du rendez-vous', required: true },
    { key: 'desiredDate', label: 'Date souhaitée', type: 'date', placeholder: 'JJ/MM/AAAA', required: true },
    { key: 'desiredTime', label: 'Heure souhaitée', type: 'text', placeholder: '14:00', required: true },
    { key: 'context', label: 'Contexte / motif', type: 'multiline', placeholder: 'Détails supplémentaires' },
  ],
  information: [
    { key: 'topic', label: "Sujet de l'information", type: 'text', placeholder: 'Objet', required: true },
    { key: 'details', label: 'Détails / message', type: 'multiline', placeholder: 'Votre message...', required: true },
    { key: 'effectiveDate', label: "Date d'effet", type: 'date', placeholder: 'JJ/MM/AAAA' },
  ],
  'mise-en-demeure': [
    { key: 'subject', label: 'Objet du litige', type: 'text', placeholder: 'Conflit', required: true },
    { key: 'amount', label: 'Montant ou obligation', type: 'text', placeholder: 'Montant dû ou obligation', required: true },
    { key: 'contractRef', label: 'Référence de contrat / dossier', type: 'text', placeholder: 'REF-2024-001', required: true },
    { key: 'deadline', label: 'Délai avant action', type: 'text', placeholder: '15 jours', required: true },
  ],
};

export default function CreateLetterScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useTheme();
  const { addLetter, canGenerateLetter } = useLetters();
  const { profile } = useUser();
  const { recipients } = useRecipients();
  const router = useRouter();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const emptyRecipient: Recipient = {
    firstName: '',
    lastName: '',
    status: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
  };

  useEffect(() => {
    loadDraft().then(draft => {
      if (draft) {
        setFormData(draft.formData || {});
        if (draft.recipient) {
          setSelectedRecipient(draft.recipient);
        }
      }
    });
  }, []);

  const filteredRecipients = recipients
    .filter(r => `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a.lastName.localeCompare(b.lastName) : b.lastName.localeCompare(a.lastName)
    );

  const fields = letterTypeFields[type || 'motivation'] || [];
  const typeLabels: Record<string, string> = {
    motivation: 'Lettre de motivation',
    relance: 'Relance de facture',
    devis: 'Demande de devis',
    reclamation: 'Réclamation',
    recommandation: 'Lettre de recommandation',
    remerciement: 'Lettre de remerciement',
    administrative: 'Courrier administratif',
    attestation: 'Demande d\'attestation',
    preavis: 'Préavis de départ',
    resiliation: "Résiliation d'abonnement",
    contestation: 'Lettre de contestation',
    'delai-paiement': 'Demande de délai de paiement',
    entretien: "Demande d'entretien",
    information: "Lettre d'information",
    'mise-en-demeure': 'Mise en demeure',
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      saveDraft(updated, selectedRecipient || emptyRecipient);
      return updated;
    });
    // Clear error when user starts typing
    if (generationError) {
      setGenerationError(null);
    }
  };

  const validateForm = () => {
    // Vérifier les champs obligatoires du formulaire
    for (const field of fields) {
      if (field.required && !formData[field.key]) {
        Alert.alert('Erreur', `Le champ "${field.label}" est obligatoire`);
        return false;
      }
    }
    if (!selectedRecipient) {
      Alert.alert('Erreur', 'Veuillez sélectionner un destinataire');
      return false;
    }
    return true;
  };

  const handleGenerateLetter = async () => {
    if (!validateForm()) return;
    if (!canGenerateLetter()) {
      Alert.alert(
        'Limite atteinte',
        'Vous avez atteint la limite de 10 courriers ce mois-ci. Passez au plan Premium pour un accès illimité.'
      );
      return;
    }

    if (!canGenerateLetter('free')) {
      Alert.alert(
        'Limite atteinte',
        'Vous avez atteint la limite de 10 courriers pour le plan gratuit. Passez au plan premium pour continuer.'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const currentDate = new Date().toLocaleDateString('fr-FR');

    try {
      const generatedContent = await generateLetter(
        type || 'motivation',
        selectedRecipient!,
        profile,
        formData.subject || '',
        formData.body || '',
        formData,
        currentDate
      );
      const newLetter: Letter = {
        id: Date.now().toString(),
        type: type || 'motivation',
        title: `${typeLabels[type || 'motivation']} - ${selectedRecipient!.firstName} ${selectedRecipient!.lastName}`,
        content: generatedContent,
        recipient: selectedRecipient!,
        data: formData,
        createdAt: new Date(),
      };

      addLetter(newLetter);
      await clearDraft();

      Alert.alert(
        'Succès',
        'Votre courrier a été généré avec succès !',
        [
          {
            text: 'Voir le courrier',
            onPress: () => {
              router.replace({
                pathname: '/letter-preview',
                params: { letterId: newLetter.id }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur de génération:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setGenerationError(errorMessage);
      
      // Afficher une alerte avec plus de détails
      Alert.alert(
        'Erreur de génération', 
        'Impossible de générer le courrier. Vérifiez votre connexion internet et réessayez.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderField = (field: FormField) => {
    const isMultiline = field.type === 'multiline';
    const isDate = field.type === 'date';
    
    if (isDate) {
      return (
        <DatePicker
          key={field.key}
          label={`${field.label}${field.required ? ' *' : ''}`}
          value={formData[field.key] || ''}
          onDateChange={(date) => handleInputChange(field.key, date)}
          placeholder={field.placeholder}
        />
      );
    }
    
    return (
      <View key={field.key} style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          {field.label}
          {field.required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
        <TextInput
          style={[
            styles.fieldInput,
            isMultiline && styles.multilineInput,
            { color: colors.text, borderColor: colors.border }
          ]}
          value={formData[field.key] || ''}
          onChangeText={(value) => handleInputChange(field.key, value)}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={isMultiline}
          numberOfLines={isMultiline ? 4 : 1}
          keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          accessible
          accessibilityLabel={field.label}
          accessibilityHint={field.required ? 'Champ obligatoire' : undefined}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Retour"
          accessibilityHint="Revenir à l'écran précédent"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {typeLabels[type || 'motivation']}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Affichage de l'erreur de génération */}
        {generationError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
            <WifiOff size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {generationError}
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations du courrier</Text>
          {fields.map(renderField)}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Destinataire</Text>
          <TouchableOpacity
            style={[styles.recipientSelector, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setSelectorVisible(true)}
          >
            <Text style={{ color: selectedRecipient ? colors.text : colors.textSecondary }}>
              {selectedRecipient
                ? `${selectedRecipient.firstName} ${selectedRecipient.lastName}`
                : 'Sélectionner un destinataire'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avertissement de connexion requise */}
        <View style={[styles.warningContainer, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
          <Wifi size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}> 
            Une connexion internet est requise pour générer votre courrier
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            { backgroundColor: isGenerating ? colors.textSecondary : colors.primary }
          ]}
          onPress={handleGenerateLetter}
          disabled={isGenerating}
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            isGenerating ? 'Génération du courrier en cours' : 'Générer le courrier'
          }
          accessibilityHint="Envoie les informations pour créer le courrier"
        >
          {isGenerating ? (
            <Loader size={24} color="#ffffff" />
          ) : (
            <Send size={24} color="#ffffff" />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Génération en cours...' : 'Générer le courrier'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
      <Modal visible={selectorVisible} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalContent}>
            <View style={styles.searchRow}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher"
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
              />
              <TouchableOpacity
                onPress={() => setSortAsc(!sortAsc)}
                style={[styles.sortBtn, { backgroundColor: colors.surface }]}
              >
                {sortAsc ? <SortAsc size={20} color={colors.text} /> : <SortDesc size={20} color={colors.text} />}
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredRecipients}
              keyExtractor={item => item.id || ''}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recipientItem, { borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedRecipient(item);
                    saveDraft(formData, item);
                    setSelectorVisible(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.firstName} {item.lastName}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.email}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>Aucun destinataire</Text>}
            />
            <TouchableOpacity onPress={() => setSelectorVisible(false)} style={[styles.closeModal, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#fff', fontFamily: 'Inter-SemiBold' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  recipientSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
  },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  closeModal: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});