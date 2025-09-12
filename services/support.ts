import { Linking, Alert } from 'react-native';

const SUPPORT_EMAIL = 'webmaster@drcomputer60290.fr';
const MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=Support%20Courrier-Expert`;

export async function contactSupport() {
  try {
    const supported = await Linking.canOpenURL(MAILTO_URL);
    if (supported) {
      await Linking.openURL(MAILTO_URL);
    } else {
      Alert.alert('Erreur', "Impossible d'ouvrir le client mail");
    }
  } catch {
    Alert.alert('Erreur', "Impossible d'ouvrir le client mail");
  }
}
