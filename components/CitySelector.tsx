import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getCitiesByPostalCode } from '@/utils/postalCodes';

interface CitySelectorProps {
  postalCode: string;
  selectedCity: string;
  onCityChange: (city: string) => void;
  label?: string;
  placeholder?: string;
}

export default function CitySelector({ 
  postalCode, 
  selectedCity, 
  onCityChange, 
  label = 'Ville',
  placeholder = 'Sélectionner une ville'
}: CitySelectorProps) {
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (postalCode && postalCode.length >= 2) {
      const availableCities = getCitiesByPostalCode(postalCode);
      setCities(availableCities);
      setFilteredCities(availableCities);
      
      // Reset selected city if it's not in the new list
      if (selectedCity && !availableCities.includes(selectedCity)) {
        onCityChange('');
      }
    } else {
      setCities([]);
      setFilteredCities([]);
      onCityChange('');
    }
  }, [postalCode]);

  useEffect(() => {
    if (searchText) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchText, cities]);

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setIsModalVisible(false);
    setSearchText('');
  };

  const openModal = () => {
    if (cities.length > 0) {
      setIsModalVisible(true);
    }
  };

  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.cityItem, { borderBottomColor: colors.border }]}
      onPress={() => handleCitySelect(item)}
    >
      <Text style={[styles.cityText, { color: colors.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            borderColor: colors.border,
            backgroundColor: cities.length > 0 ? colors.surface : colors.background,
            opacity: cities.length > 0 ? 1 : 0.5
          }
        ]}
        onPress={openModal}
        disabled={cities.length === 0}
      >
        <MapPin size={20} color={colors.textSecondary} />
        <Text style={[
          styles.selectorText,
          { color: selectedCity ? colors.text : colors.textSecondary }
        ]}>
          {selectedCity || (cities.length > 0 ? placeholder : 'Saisir d\'abord le code postal')}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner une ville</Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Rechercher une ville..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />

            <FlatList
              data={filteredCities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item}
              style={styles.cityList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  cityList: {
    maxHeight: 300,
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  cityText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});