
// app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import {
  FileText,
  TrendingUp,
  Calendar,
  Share2,
  Mail,
  CreditCard,
  Building,
  CircleAlert as AlertCircle,
  Heart,
  Briefcase,
  Users,
  FileCheck,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MyBanner from '@/components/MyBanner';

const letterTypes = [
  { id: 'motivation', title: 'Lettre de motivation', description: 'Candidature emploi', icon: Briefcase, color: '#3b82f6' },
  { id: 'relance',     title: 'Relance facture',    description: 'Paiement en retard',  icon: CreditCard,  color: '#f59e0b' },
  { id: 'devis',       title: 'Demande de devis',    description: 'Demande commerciale', icon: FileText,    color: '#10b981' },
  { id: 'reclamation', title: 'Réclamation',         description: 'Service client',      icon: AlertCircle, color: '#ef4444' },
  { id: 'recommandation', title: 'Recommandation',   description: 'Référence professionnelle', icon: Users,    color: '#8b5cf6' },
  { id: 'remerciement', title: 'Remerciement',       description: 'Relation client',     icon: Heart,      color: '#ec4899' },
  { id: 'administrative', title: 'Administrative',   description: 'Démarche officielle', icon: Building,   color: '#64748b' },
  { id: 'attestation', title: 'Attestation',         description: 'Document officiel',   icon: FileCheck,  color: '#06b6d4' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { getStatistics } = useLetters();
  const { profile } = useUser();
  const router = useRouter();
  const stats = getStatistics();

  const handleLetterTypePress = (type: string) => {
    router.push({ pathname: '/create-letter', params: { type } });
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    IconComponent: React.ComponentType<any>,
    gradient: string[]
  ) => (
    <View key={title} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient colors={gradient} style={styles.statGradient}>
        <IconComponent size={24} color="#fff" />
      </LinearGradient>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const renderLetterType = (item: typeof letterTypes[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.letterCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleLetterTypePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.letterIconContainer, { backgroundColor: item.color + '15' }]}>
        <item.icon size={28} color={item.color} />
      </View>
      <View style={styles.letterContent}>
        <Text style={[styles.letterTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.letterDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête utilisateur */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bonjour</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {profile.firstName || 'Utilisateur'}
          </Text>
        </View>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.profileImage} />
          ) : (
            <Mail size={24} color="#fff" />
          )}
        </View>
      </View>

      {/* Slogan */}
      <Text style={[styles.tagline, { color: colors.textSecondary }]}>
        Votre courrier, prêt en un instant
      </Text>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        {renderStatCard('Courriers ce mois', stats.thisMonth, Calendar, [colors.primary, colors.primaryLight])}
        {renderStatCard('Total créés', stats.totalLetters, FileText, [colors.accent, '#34d399'])}
        {renderStatCard('Type populaire', stats.mostUsedType, TrendingUp, [colors.warning, '#fbbf24'])}
        {renderStatCard('Taux partage', `${stats.shareRate}%`, Share2, [colors.secondary, '#94a3b8'])}
      </View>

      {/* Liste des types de courriers */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Types de courriers</Text>
      </View>
      <View style={styles.letterGrid}>
        {letterTypes.map(renderLetterType)}
      </View>

      {/* Espace pour scroll */}
      <View style={{ height: 80 }} />

      {/* Bannière AdMob */}
      <MyBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, paddingTop: 50 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  greeting:    { fontSize: 16, fontFamily: 'Inter-Regular' },
  userName:    { fontSize: 24, fontFamily: 'Inter-Bold' },
  logo:        { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileImage:{ width: '100%', height: '100%', borderRadius: 24 },
  tagline:     { fontSize: 16, fontFamily: 'Inter-Medium', textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 30 },
  statCard:    { flex: 1, minWidth: '47%', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  statGradient:{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statContent: { flex: 1 },
  statValue:   { fontSize: 18, fontFamily: 'Inter-Bold' },
  statTitle:   { fontSize: 12, fontFamily: 'Inter-Medium', marginTop: 2 },
  sectionHeader:{ paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle:{ fontSize: 20, fontFamily: 'Inter-Bold' },
  letterGrid:  { paddingHorizontal: 20, gap: 12 },
  letterCard:  { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  letterIconContainer:{ width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  letterContent:{ flex: 1 },
  letterTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', marginBottom: 4 },
  letterDescription:{ fontSize: 14, fontFamily: 'Inter-Regular' },
});
