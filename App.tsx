import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'UserDB', location: 'default' },
  () => console.log('Database connected'),
  error => console.log('Database error', error)
);

interface User {
  id: number;
  name: string;
  email: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)',
        [],
        () => console.log('Table created successfully'),
        error => console.log('Create table error', error)
      );
    });
    fetchUsers();
  }, []);

  
  const fetchUsers = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users',
        [],
        (_, results) => {
          let data: User[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i));
          }
          setUsers(data);
        },
        error => console.log('Fetch users error', error)
      );
    });
  };

  
  const addUser = () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email],
        () => {
          setName('');
          setEmail('');
          fetchUsers();
          Alert.alert('Success', 'User added successfully');
        },
        error => console.log('Add user error', error)
      );
    });
  };

 
  const deleteUser = (id: number) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM users WHERE id = ?',
        [id],
        () => {
          fetchUsers();
          Alert.alert('Success', 'User deleted successfully');
        },
        error => console.log('Delete user error', error)
      );
    });
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/474x/1d/54/01/1d5401dfeeb3b57612912b2c0c322f53.jpg' }} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>MASUKAN ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Button title="Add User" onPress={addUser} />
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.user}>
              <View>
                <Text style={styles.userText}>{item.name}</Text>
                <Text>{item.email}</Text>
              </View>
              <Button
                title="Delete"
                onPress={() => deleteUser(item.id)}
                color="red"
              />
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff', 
  },
  user: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 5,
  },
  userText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});