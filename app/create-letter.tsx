import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Send, Loader, Wifi, WifiOff } from 'lucide-react-native';
import DatePicker from '@/components/DatePicker';
import CitySelector from '@/components/CitySelector';
import { generateLetter } from '@/services/letterApi';

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
};

export default function CreateLetterScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useTheme();
  const { addLetter } = useLetters();
  const { profile } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [recipient, setRecipient] = useState({
    firstName: '',
    lastName: '',
    status: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

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
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (generationError) {
      setGenerationError(null);
    }
  };

  const handleRecipientChange = (key: string, value: string) => {
    setRecipient(prev => ({ ...prev, [key]: value }));
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

    // Vérifier les champs obligatoires du destinataire
    if (!recipient.firstName || !recipient.lastName) {
      Alert.alert('Erreur', 'Le prénom et nom du destinataire sont obligatoires');
      return false;
    }

    return true;
  };

  const handleGenerateLetter = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const generatedContent = await generateLetter(type || 'motivation', recipient, profile, formData);

      const newLetter = {
        id: Date.now().toString(),
        type: type || 'motivation',
        title: `${typeLabels[type || 'motivation']} - ${recipient.firstName} ${recipient.lastName}`,
        content: generatedContent,
        recipient,
        data: formData,
        createdAt: new Date(),
      };

      addLetter(newLetter);

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
        />
      </View>
    );
  };

  const renderRecipientField = (key: string, label: string, placeholder: string, icon: React.ComponentType<any>) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        {React.createElement(icon, { size: 16, color: colors.textSecondary })}
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <TextInput
        style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
        value={recipient[key as keyof typeof recipient]}
        onChangeText={(value) => handleRecipientChange(key, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={key === 'postalCode' ? 'numeric' : 'default'}
        maxLength={key === 'postalCode' ? 5 : undefined}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
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
          {renderRecipientField('firstName', 'Prénom', 'Prénom du destinataire', User)}
          {renderRecipientField('lastName', 'Nom', 'Nom du destinataire', User)}
          {renderRecipientField('status', 'Statut', 'Monsieur, Madame, Docteur...', User)}
          {renderRecipientField('address', 'Adresse', 'Adresse complète', MapPin)}
          {renderRecipientField('postalCode', 'Code postal', '75000', MapPin)}
          
          <CitySelector
            postalCode={recipient.postalCode}
            selectedCity={recipient.city}
            onCityChange={(city) => handleRecipientChange('city', city)}
          />
          
          {renderRecipientField('email', 'Email', 'email@exemple.com', Mail)}
          {renderRecipientField('phone', 'Téléphone', '01 23 45 67 89', Phone)}
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