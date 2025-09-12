// app/(tabs)/index.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetters } from '@/contexts/LetterContext';
import { useUser } from '@/contexts/UserContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
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
  House,
  CircleX,
  TriangleAlert,
  Hourglass,
  CalendarClock,
  Info,
  Gavel,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MyBanner from '@/components/MyBanner';
import { loadFavoriteTypes, saveFavoriteTypes } from '@/utils/favoriteTypes';

const letterTypes = [
  { id: 'motivation', title: 'Lettre de motivation', description: 'Candidature emploi', icon: Briefcase, color: '#3b82f6' },
  { id: 'relance',     title: 'Relance facture',    description: 'Paiement en retard',  icon: CreditCard,  color: '#f59e0b' },
  { id: 'devis',       title: 'Demande de devis',    description: 'Demande commerciale', icon: FileText,    color: '#10b981' },
  { id: 'reclamation', title: 'Réclamation',         description: 'Service client',      icon: AlertCircle, color: '#ef4444' },
  { id: 'recommandation', title: 'Recommandation',   description: 'Référence professionnelle', icon: Users,    color: '#8b5cf6' },
  { id: 'remerciement', title: 'Remerciement',       description: 'Relation client',     icon: Heart,      color: '#ec4899' },
  { id: 'administrative', title: 'Administrative',   description: 'Démarche officielle', icon: Building,   color: '#64748b' },
  { id: 'attestation', title: 'Attestation',         description: 'Document officiel',   icon: FileCheck,  color: '#06b6d4' },
  { id: 'preavis',      title: 'Préavis de départ',  description: 'Quitter un logement', icon: House,      color: '#0ea5e9' },
  { id: 'resiliation',  title: 'Résiliation',        description: "Fin d'abonnement",    icon: CircleX,    color: '#dc2626' },
  { id: 'contestation', title: 'Contestation',       description: 'Contester une décision', icon: TriangleAlert, color: '#f97316' },
  { id: 'delai-paiement', title: 'Délai de paiement', description: 'Demande de report',  icon: Hourglass,  color: '#eab308' },
  { id: 'entretien',    title: "Demande d'entretien", description: 'Fixer un rendez-vous', icon: CalendarClock, color: '#16a34a' },
  { id: 'information',  title: "Lettre d'information", description: 'Communiquer une nouvelle', icon: Info, color: '#0284c7' },
  { id: 'mise-en-demeure', title: 'Mise en demeure', description: 'Ultimatum juridique', icon: Gavel,      color: '#7f1d1d' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { getStatistics } = useLetters();
  const { profile } = useUser();
  const { plan } = useSubscription();
  const router = useRouter();
  const stats = getStatistics();

  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await loadFavoriteTypes();
      setFavorites(stored);
    })();
  }, []);

  const handleLetterTypePress = (type: string) => {
    router.push({ pathname: '/create-letter', params: { type } });
  };

  // Type simple pour éviter tout souci de parsing: un tableau de strings
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

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavoriteTypes(updated);
      return updated;
    });
  };

  const renderLetterType = (item: typeof letterTypes[0]) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.letterCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleLetterTypePress(item.id)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Créer ${item.title}`}
        accessibilityHint={`Ouvre le formulaire pour ${item.description.toLowerCase()}`}
      >
        <View style={[styles.letterIconContainer, { backgroundColor: item.color + '15' }]}>
          <item.icon size={28} color={item.color} />
        </View>

        <View style={styles.letterContent}>
          <Text style={[styles.letterTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.letterDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Retirer ${item.title} des favoris` : `Ajouter ${item.title} aux favoris`}
        >
          <Star
            size={24}
            color={isFavorite ? colors.warning : colors.textSecondary}
            fill={isFavorite ? colors.warning : 'none'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const filteredTypes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const types = letterTypes.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
    return {
      favorites: types.filter(t => favorites.includes(t.id)),
      others: types.filter(t => !favorites.includes(t.id)),
    };
  }, [searchQuery, favorites]);

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

      {/* Plan */}
      <View style={[styles.planBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.planText, { color: colors.text }]}>Plan actuel : {plan === 'premium' ? 'Premium' : 'Gratuit'}</Text>
        {plan === 'free' && (
          <TouchableOpacity
            style={[styles.planButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/subscribe')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Passer au Premium"
          >
            <Text style={styles.planButtonText}>Passer au Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        {renderStatCard('Courriers ce mois', stats.thisMonth, Calendar, [colors.primary, colors.primary])}
        {renderStatCard('Total créés', stats.totalLetters, FileText, [colors.accent, '#34d399'])}
        {renderStatCard('Type populaire', stats.mostUsedType, TrendingUp, [colors.warning, '#fbbf24'])}
        {renderStatCard('Taux partage', `${stats.shareRate}%`, Share2, [colors.secondary, '#94a3b8'])}
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
          ]}
          placeholder="Rechercher un type..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Favoris */}
      {filteredTypes.favorites.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Favoris</Text>
          </View>
          <View style={styles.letterGrid}>
            {filteredTypes.favorites.map(renderLetterType)}
          </View>
        </>
      )}

      {/* Autres types */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Types de courriers</Text>
      </View>
      <View style={styles.letterGrid}>
        {filteredTypes.others.map(renderLetterType)}
      </View>

      {/* Bannière AdMob */}
      <MyBanner />

      {/* Espace pour scroll */}
      <View style={{ height: 80 }} />
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
  planBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginHorizontal: 20, marginBottom: 30 },
  planText:   { fontSize: 16, fontFamily: 'Inter-Medium' },
  planButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  planButtonText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#ffffff' },
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
  searchContainer:{ paddingHorizontal: 20, marginBottom: 16 },
  searchInput:{ borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: 'Inter-Regular' },
  favoriteButton:{ padding: 4 },
});
