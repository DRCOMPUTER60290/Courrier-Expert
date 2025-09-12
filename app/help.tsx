import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { contactSupport } from '@/services/support';

export default function HelpScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const faqs = [
    {
      q: "Comment créer un courrier ?",
      a: "Utilisez le bouton 'Créer' et remplissez les informations requises.",
    },
    {
      q: 'Puis-je modifier un courrier après génération ?',
      a: "Oui, vous pouvez éditer le texte avant l'envoi ou l'impression.",
    },
  ];

  const tutorials = [
    {
      title: 'Premiers pas',
      description: "Découvrez les fonctionnalités essentielles de Courrier-Expert.",
    },
    {
      title: 'Gérer vos destinataires',
      description: "Ajoutez, modifiez ou supprimez des destinataires facilement.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Retour"
          accessibilityHint="Revenir à l'écran précédent"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Aide</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>FAQ</Text>
        {faqs.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
            <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tutoriels</Text>
        {tutorials.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.question, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.description}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={contactSupport}
          activeOpacity={0.7}
        >
          <Mail color="#fff" size={20} />
          <Text style={[styles.contactText, { color: '#fff' }]}>Contact support</Text>
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

