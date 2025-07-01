import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { 
  Moon, 
  Sun, 
  Monitor,
  Info, 
  FileText, 
  Shield,
  ChevronRight,
  Star,
  MessageCircle,
  Share2
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const router = useRouter();

  const themeOptions = [
    { key: 'light', label: 'Clair', icon: Sun },
    { key: 'dark', label: 'Sombre', icon: Moon },
    { key: 'system', label: 'Système', icon: Monitor },
  ];

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
  };

  const handleLegalPage = (slug: string) => {
    router.push(`/legal/${slug}`);
  };

  const handleAction = (action: string) => {
    Alert.alert('Action', `${action} sélectionné`);
  };

  const renderSetting = (
    title: string,
    subtitle: string,
    icon: React.ComponentType<any>,
    onPress: () => void,
    showChevron = true
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
        {React.createElement(icon, { size: 20, color: colors.primary })}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  const renderThemeOption = (option: typeof themeOptions[0]) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.themeOption,
        { 
          backgroundColor: colors.card,
          borderColor: theme === option.key ? colors.primary : colors.border,
          borderWidth: theme === option.key ? 2 : 1,
        }
      ]}
      onPress={() => handleThemeChange(option.key as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.themeIcon, { backgroundColor: colors.primary + '15' }]}>
        <option.icon size={20} color={colors.primary} />
      </View>
      <Text style={[styles.themeLabel, { color: colors.text }]}>{option.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Paramètres</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apparence</Text>
          <View style={styles.themeContainer}>
            {themeOptions.map(renderThemeOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Application</Text>
          
          {renderSetting(
            'Noter l\'application',
            'Partagez votre expérience',
            Star,
            () => handleAction('Noter l\'application')
          )}
          
          {renderSetting(
            'Partager l\'application',
            'Recommander à vos contacts',
            Share2,
            () => handleAction('Partager l\'application')
          )}
          
          {renderSetting(
            'Support',
            'Contactez notre équipe',
            MessageCircle,
            () => handleAction('Support')
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations légales</Text>
          
          {renderSetting(
            'Mentions légales',
            'Informations sur l\'éditeur',
            Info,
            () => handleLegalPage('mentions-legales')
          )}
          
          {renderSetting(
            'Conditions d\'utilisation',
            'Règles d\'usage de l\'application',
            FileText,
            () => handleLegalPage('conditions-utilisation')
          )}
          
          {renderSetting(
            'Politique RGPD',
            'Protection des données personnelles',
            Shield,
            () => handleLegalPage('politique-rgpd')
          )}
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.text }]}>Courrier-Expert</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            "Votre courrier, prêt en un instant"
          </Text>
        </View>

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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});