import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRecipients, Recipient } from '@/contexts/RecipientContext';
import MyBanner from '@/components/MyBanner';
import ContactSelector from '@/components/ContactSelector';
import { Plus, Edit, Trash2, SortAsc, SortDesc, X, Check, Contact } from 'lucide-react-native';
import * as Contacts from 'expo-contacts';

export default function RecipientsScreen() {
  const { colors } = useTheme();
  const { recipients, addRecipient, updateRecipient, deleteRecipient } = useRecipients();

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Recipient | null>(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [form, setForm] = useState<Recipient>({
    firstName: '',
    lastName: '',
    status: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
  });

  const filtered = recipients
    .filter(r => `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc
        ? a.lastName.localeCompare(b.lastName)
        : b.lastName.localeCompare(a.lastName)
    );

  const openAdd = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', status: '', address: '', postalCode: '', city: '', email: '', phone: '' });
    setModalVisible(true);
  };

  const openEdit = (recipient: Recipient) => {
    setEditing(recipient);
    setForm(recipient);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Erreur', 'Prénom et nom sont obligatoires');
      return;
    }
    if (editing && editing.id) {
      updateRecipient(editing.id, form);
    } else {
      addRecipient(form);
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Recipient }) => (
    <View style={[styles.item, { borderColor: colors.border }]}> 
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>{item.firstName} {item.lastName}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn} accessibilityLabel="Éditer">
        <Edit size={20} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Supprimer', 'Supprimer ce destinataire ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => item.id && deleteRecipient(item.id) },
          ])
        }
        style={styles.iconBtn}
        accessibilityLabel="Supprimer"
      >
        <Trash2 size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderField = (key: keyof Recipient, placeholder: string) => (
    <TextInput
      value={(form as any)[key]}
      onChangeText={text => setForm(prev => ({ ...prev, [key]: text }))}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, { borderColor: colors.border, color: colors.text }]}
    />
  );

  const handleImportContact = (c: Contacts.Contact) => {
    const address = c.addresses?.[0] || {};
    addRecipient({
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      status: '',
      address: address.street || '',
      postalCode: address.postalCode || '',
      city: address.city || '',
      email: c.emails?.[0]?.email || '',
      phone: c.phoneNumbers?.[0]?.number || '',
    });
    setContactModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
        />
        <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={[styles.sortBtn, { backgroundColor: colors.surface }]}>
          {sortAsc ? <SortAsc size={20} color={colors.text} /> : <SortDesc size={20} color={colors.text} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setContactModalVisible(true)} style={[styles.importBtn, { backgroundColor: colors.surface }]}> 
          <Contact size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: colors.primary }]}> 
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id || ''}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textSecondary }]}>Aucun destinataire</Text>}
      />

      <MyBanner />

      <ContactSelector
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={handleImportContact}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}> 
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editing ? 'Modifier' : 'Ajouter'} un destinataire</Text>
            {renderField('firstName', 'Prénom')}
            {renderField('lastName', 'Nom')}
            {renderField('status', 'Statut')}
            {renderField('address', 'Adresse')}
            {renderField('postalCode', 'Code postal')}
            {renderField('city', 'Ville')}
            {renderField('email', 'Email')}
            {renderField('phone', 'Téléphone')}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.cancelBtn, { backgroundColor: colors.surface }]}> 
                <X size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}> 
                <Check size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
  },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  email: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  iconBtn: {
    padding: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    padding: 12,
    borderRadius: 8,
  },
  saveBtn: {
    padding: 12,
    borderRadius: 8,
  },
});
