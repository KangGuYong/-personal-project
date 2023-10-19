import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, TextInput, Text, Checkbox, Provider as PaperProvider } from 'react-native-paper';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

const ChecklistScreen = () => {
  const [item, setItem] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItemsFromFirebase();
  }, []);

  const addItem = async () => {
    if (item.trim() !== '') {
      const newItem = { text: item, isCompleted: false };
      setItems([...items, newItem]);
      setItem('');

      const checklistRef = collection(db, 'checklists');
      await addDoc(checklistRef, newItem);
    }
  };

  const toggleCompletion = async (id) => {
    const newItems = items.map(i => 
      i.id === id ? { ...i, isCompleted: !i.isCompleted } : i
    );
    setItems(newItems);

    const checklistRef = doc(db, 'checklists', id);
    const itemToUpdate = newItems.find(i => i.id === id);
    await updateDoc(checklistRef, { isCompleted: itemToUpdate.isCompleted });
  };

  const deleteItem = async (id) => {
    const checklistRef = doc(db, 'checklists', id);
    await deleteDoc(checklistRef);

    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
  };

  const loadItemsFromFirebase = async () => {
    const q = collection(db, 'checklists');
    const querySnapshot = await getDocs(q);
    const loadedItems = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setItems(loadedItems);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>Checklist</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new item"
            onChangeText={(text) => setItem(text)}
            value={item}
          />
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={addItem}>Add</Button>
          </View>
        </View>
        <ScrollView style={styles.listContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Checkbox
                status={item.isCompleted ? 'checked' : 'unchecked'}
                onPress={() => toggleCompletion(item.id)}
                style={styles.checkbox}
              />
              <Text style={styles.itemText}>{item.text}</Text>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  buttonContainer: {
    alignSelf: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  checkbox: {
    borderWidth: 2,
    borderColor: 'red',
    padding: 2,
    marginRight: 8,
  },
  deleteButtonText: {
    color: 'red',
  },
});

export default ChecklistScreen;
