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
  { id: 'resiliation',  title: 'Résiliation',        description: 'Fin d\'abonnement',   icon: CircleX,   color: '#dc2626' },
  { id: 'contestation', title: 'Contestation',       description: 'Contester une décision', icon: TriangleAlert, color: '#f97316' },
  { id: 'delai-paiement', title: 'Délai de paiement', description: 'Demande de report', icon: Hourglass, color: '#eab308' },
  { id: 'entretien',    title: "Demande d'entretien", description: 'Fixer un rendez-vous', icon: CalendarClock, color: '#16a34a' },
  { id: 'information',  title: 'Lettre d\'information', description: 'Communiquer une nouvelle', icon: Info, color: '#0284c7' },
  { id: 'mise-en-demeure', title: 'Mise en demeure', description: 'Ultimatum juridique', icon: Gavel, color: '#7f1d1d' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { getStatistics } = useLetters();
  const { profile } = useUser();
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

  // Autorise 2+ couleurs pour le dégradé (résout le conflit de types)
  const renderStatCard = (
    title: string,
    value: string | number,
    IconComponent: React.ComponentType<any>,
    gradient: [string, string, ...string[]]
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

  // Gestion des favoris (persistés)
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavoriteTypes(updated);
      return updated;
    });
  };

  // Carte type de lettre : accessibilité + étoile Favori
  const renderLetterType = (item: typeof letterTypes[0]) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
