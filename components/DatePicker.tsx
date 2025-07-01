import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export default function DatePicker({ value, onDateChange, placeholder = 'Sélectionner une date', label }: DatePickerProps) {
  const { colors } = useTheme();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toLocaleDateString('fr-FR');
    onDateChange(formattedDate);
    hideDatePicker();
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    // Parse French date format (DD/MM/YYYY)
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    return new Date();
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={showDatePicker}
      >
        <Calendar size={20} color={colors.textSecondary} />
        <Text style={[styles.dateText, { color: value ? colors.text : colors.textSecondary }]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={parseDate(value)}
        locale="fr_FR"
        confirmTextIOS="Confirmer"
        cancelTextIOS="Annuler"
        headerTextIOS="Choisir une date"
      />
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
});