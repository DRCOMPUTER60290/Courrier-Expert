import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { confirmPremiumSubscriptionPayment } from '@/services/payments';

export default function PremiumCheckoutScreen() {
  const { colors } = useTheme();
  const { upgrade } = useSubscription();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      const result = await confirmPremiumSubscriptionPayment({
        fullName,
        email,
        cardNumber,
        expiry,
        cvc,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        country,
      });

      if (result.status === 'succeeded') {
        upgrade();
        setSuccess(true);
        setIsProcessing(false);
        setTimeout(() => {
          router.replace('/subscribe');
        }, 1200);
      } else {
        setErrorMessage(result.message ?? 'Le paiement a échoué. Veuillez réessayer.');
        setIsProcessing(false);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Une erreur inattendue est survenue. Veuillez réessayer.',
      );
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (!isProcessing) {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Passer au Premium</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Renseignez vos informations de paiement pour activer l'abonnement illimité.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Coordonnées</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nom complet"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail de facturation"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Adresse"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            returnKeyType="next"
          />
          <TextInput
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Complément d'adresse (optionnel)"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            returnKeyType="next"
          />
          <View style={styles.row}>
            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Code postal"
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Ville"
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
              returnKeyType="next"
            />
          </View>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder="Pays"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Carte bancaire</Text>
          <TextInput
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Numéro de carte"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            keyboardType="number-pad"
            returnKeyType="next"
          />
          <View style={styles.row}>
            <TextInput
              value={expiry}
              onChangeText={setExpiry}
              placeholder="MM/AA"
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
            <TextInput
              value={cvc}
              onChangeText={setCvc}
              placeholder="CVC"
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputHalf, { borderColor: colors.border, color: colors.text }]}
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>Utilisez 4242 4242 4242 4242 pour simuler un paiement réussi.</Text>
        </View>

        {errorMessage && (
          <View style={[styles.feedback, { backgroundColor: colors.error + '22', borderColor: colors.error }]}>
            <Text style={[styles.feedbackText, { color: colors.error }]}>{errorMessage}</Text>
          </View>
        )}

        {success && (
          <View style={[styles.feedback, { backgroundColor: colors.success + '22', borderColor: colors.success }]}>
            <Text style={[styles.feedbackText, { color: colors.success }]}>Paiement réussi ! Votre abonnement Premium est activé.</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isProcessing ? 0.7 : 1 }]}
            onPress={handleConfirm}
            disabled={isProcessing}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Confirmer et payer"
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirmer et payer</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleCancel}
            disabled={isProcessing}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Annuler et revenir"
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  feedback: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
