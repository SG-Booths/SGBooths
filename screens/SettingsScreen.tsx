import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { ref as ref_db, onValue, ref, update } from 'firebase/database';
import { db, storage } from '../config/firebase';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen: React.FC<RootStackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: '',
    name: '',
  });

  const [userInfo, setUserInfo]: any = useState({})

  useEffect(() => {
    return onValue(ref(db, '/users/' + user?.uid), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userData = { ...data };
      setUserInfo(userData)

      setValue({ ...value, name: userData.name })
    });
  }, []); 

  const switchAccount = (type: string) => {
    if (type === 'visitor') {
      Alert.alert(
        "Are you sure?",
        "Switching to a Visitor account means that your shop data will be deleted!",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => deleteShop() }
        ]
      );
    }
    else {
      update(ref(db, '/users/' + auth.currentUser?.uid), {
        type: 'vendor'
      })
    }
  }

  const deleteShop = () => {
    update(ref(db, '/users/' + auth.currentUser?.uid), {
      type: 'visitor'
    })

    // remove from vendors of booths
    // remove from following
    // delete images
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          marginLeft: 20,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          marginTop: 30,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="keyboard-arrow-left" size={50} color="#575FCC" style={{ marginTop: 5 }} />
        </TouchableOpacity>
        <Text style={styles.title}>profile</Text>
      </View>
      {userInfo.type === 'vendor' ? 
      (
        <View style={{backgroundColor: 'transparent'}}>
          <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 20, backgroundColor: 'transparent' }}>
            <TouchableOpacity style={styles.visitorButton} onPress={() => switchAccount('visitor')}>
              <Text style={{ color: '#8FD8B5', fontSize: 16 }}>visitor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vendorButtonPressed}>
              <Text style={{ color: 'white', fontSize: 16 }}>creator</Text>
            </TouchableOpacity>
          </View>
          <Text style={{marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242'}}>Shop Name</Text>
          <TextInput
          style={styles.input}
          placeholder="shop name"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, name: text })}
          value={value.name}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          />
        </View>
      )
    :
    (
      <View style={{backgroundColor: 'transparent'}}>
        <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 20, backgroundColor: 'transparent' }}>
          <TouchableOpacity style={styles.visitorButtonPressed}>
            <Text style={{ color: 'white', fontSize: 16 }}>visitor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vendorButton} onPress={() => switchAccount('vendor')}>
            <Text style={{ color: '#FABF48', fontSize: 16 }}>vendor</Text>
          </TouchableOpacity>
        </View>
        <Text style={{marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242'}}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="name"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, name: text })}
            value={value.name}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
      </View>
    )}
      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text style={styles.buttonTitle}>sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',

  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
  visitorButtonPressed: {
    backgroundColor: '#8FD8B5',
    marginLeft: 30,
    marginRight: 20,
    marginTop: 20,
    height: 48,
    width: 160,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  vendorButton: {
    borderColor: '#FABF48',
    borderWidth: 1,
    marginLeft: 20,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    width: 160,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  visitorButton: {
    borderColor: '#8FD8B5',
    borderWidth: 1,
    marginLeft: 30,
    marginRight: 20,
    marginTop: 20,
    height: 48,
    width: 160,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  vendorButtonPressed: {
    backgroundColor: '#FABF48',
    marginLeft: 20,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    width: 160,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#C4C4C4'
  },
  button: {
    backgroundColor: '#2A3242',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    width: 140,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default SettingsScreen;
