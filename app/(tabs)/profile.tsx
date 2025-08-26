import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { User, Pencil, Save, Camera, Mail, Phone, MapPin, Building } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import CitySelector from '@/components/CitySelector';
import MyBanner from '@/components/MyBanner';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { profile, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Succès', 'Profil mis à jour avec succès');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newProfile = { ...editedProfile, photo: result.assets[0].uri };
      setEditedProfile(newProfile);
      updateProfile(newProfile);
    }
  };

  const renderField = (label: string, value: string, key: keyof typeof profile, icon: React.ComponentType<any>, placeholder: string) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        {React.createElement(icon, { size: 16, color: colors.textSecondary })}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
          value={editedProfile[key]}
          onChangeText={(text) => setEditedProfile(prev => ({ ...prev, [key]: text }))}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: colors.text }]}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: isEditing ? colors.accent : colors.primary }]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <Save size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Enregistrer</Text>
            </>
          ) : (
            <>
              <Pencil size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {editedProfile.photo ? (
              <Image source={{ uri: editedProfile.photo }} style={styles.avatarImage} />
            ) : (
              <User size={32} color="#ffffff" />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.cameraButton, { backgroundColor: colors.accent }]}
            onPress={pickImage}
          >
            <Camera size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations personnelles</Text>
          
          {renderField('Prénom', profile.firstName, 'firstName', User, 'Votre prénom')}
          {renderField('Nom', profile.lastName, 'lastName', User, 'Votre nom')}
          {renderField('Société', profile.company, 'company', Building, 'Nom de votre société')}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Coordonnées</Text>
          
          {renderField('Email', profile.email, 'email', Mail, 'votre@email.com')}
          {renderField('Téléphone', profile.phone, 'phone', Phone, '01 23 45 67 89')}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Adresse</Text>
          
          {renderField('Adresse', profile.address, 'address', MapPin, 'Votre adresse')}
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Code postal</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
                value={editedProfile.postalCode}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, postalCode: text }))}
                placeholder="75000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={5}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile.postalCode || '75000'}
              </Text>
            )}
          </View>

          {isEditing ? (
            <CitySelector
              postalCode={editedProfile.postalCode}
              selectedCity={editedProfile.city}
              onCityChange={(city) => setEditedProfile(prev => ({ ...prev, city }))}
            />
          ) : (
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Ville</Text>
              </View>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {profile.city || 'Votre ville'}
              </Text>
            </View>
          )}
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
		
      </ScrollView>
	    {/* Bannière AdMob */}
      <MyBanner />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    padding: 4,
    borderRadius: 60,
    borderWidth: 1,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 8,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});