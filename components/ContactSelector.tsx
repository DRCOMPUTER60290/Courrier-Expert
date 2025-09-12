import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Contacts from 'expo-contacts';

interface ContactSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (contact: Contacts.Contact) => void;
}

export default function ContactSelector({ visible, onClose, onSelect }: ContactSelectorProps) {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    async function loadContacts() {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Addresses],
        });
        setContacts(data);
        setFilteredContacts(data);
      }
    }
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  useEffect(() => {
    if (searchText) {
      const filtered = contacts.filter(c =>
        `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchText, contacts]);

  const renderItem = ({ item }: { item: Contacts.Contact }) => (
    <TouchableOpacity
      style={[styles.contactItem, { borderBottomColor: colors.border }]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.contactName, { color: colors.text }]}>
        {`${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner un contact</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Rechercher un contact..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredContacts}
            renderItem={renderItem}
            keyExtractor={item => item.id || Math.random().toString()}
            style={styles.contactList}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  contactList: {
    maxHeight: 300,
  },
  contactItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

