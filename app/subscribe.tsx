import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter } from 'expo-router';

export default function SubscribeScreen() {
  const { colors } = useTheme();
  const { plan, downgrade } = useSubscription();
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/premium-checkout');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Choisissez votre offre</Text>

      <View style={[styles.planCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.planName, { color: colors.text }]}>Gratuit</Text>
        <Text style={[styles.planDetails, { color: colors.textSecondary }]}>10 lettres/mois</Text>
        {plan === 'free' && (
          <Text style={[styles.currentTag, { color: colors.primary }]}>Plan actuel</Text>
        )}
      </View>

      <View style={[styles.planCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.planName, { color: colors.text }]}>Premium</Text>
        <Text style={[styles.planDetails, { color: colors.textSecondary }]}>Illimité pour ~4,99 € / mois</Text>
        {plan === 'premium' ? (
          <TouchableOpacity
            style={[styles.downgradeButton, { backgroundColor: colors.warning }]}
            onPress={downgrade}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Revenir au plan gratuit"
          >
            <Text style={styles.buttonText}>Revenir au Gratuit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={handleUpgrade}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Passer au Premium"
          >
            <Text style={styles.buttonText}>Passer au Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', marginBottom: 20 },
  planCard: { width: '100%', padding: 20, borderWidth: 1, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  planName: { fontSize: 20, fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  planDetails: { fontSize: 16, fontFamily: 'Inter-Regular', marginBottom: 12, textAlign: 'center' },
  upgradeButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  downgradeButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  currentTag: { marginTop: 8, fontSize: 14, fontFamily: 'Inter-Medium' },
});

