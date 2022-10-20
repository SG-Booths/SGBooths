import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { getAuth, signOut, sendPasswordResetEmail, updateEmail, updateProfile } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { ref as ref_db, onValue, ref, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import Image from 'react-native-image-progress';
import { ref as ref_storage, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen: React.FC<RootStackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [value, setValue] = React.useState({
    email: '',
    error: '',
    name: '',
  });

  const [userInfo, setUserInfo]: any = useState({});

  const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
  const ref1 = ref_storage(storage, user?.uid + '_1.png');

  const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
  const ref2 = ref_storage(storage, user?.uid + '_2.png');

  const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
  const ref3 = ref_storage(storage, user?.uid + '_3.png');

  const getPermissionAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("...");
    }
  };

  const _pickImage = async (number: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
    });

    console.log(result);

    if (!result.cancelled) {
      switch (number) {
        case 1:
          setImgUrl1(result.uri)
          break;
        case 2:
          setImgUrl2(result.uri)
          break;
        case 3:
          setImgUrl3(result.uri)
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    return onValue(ref(db, '/users/' + user?.uid), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userData = { ...data };
      setUserInfo(userData);
      setValue({ ...value, name: userData.name, email: user?.email! });

      getDownloadURL(ref1)
        .then((url) => {
          setImgUrl1(url);
        })
        .catch((error) => {
          console.log('error:' + error);
        });

      getDownloadURL(ref2)
        .then((url) => {
          setImgUrl2(url);
        })
        .catch((error) => {
          console.log('error:' + error);
        });

      getDownloadURL(ref3)
        .then((url) => {
          setImgUrl3(url);
        })
        .catch((error) => {
          console.log('error:' + error);
        });

      getPermissionAsync()
    });
  }, []);

  const switchAccount = (type: string) => {
    if (type === 'visitor') {
      Alert.alert('Are you sure?', 'Switching to a Visitor account means that your shop data will be deleted!', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => deleteShop() },
      ]);
    } else {
      update(ref(db, '/users/' + auth.currentUser?.uid), {
        type: 'vendor',
      });
    }
  };

  const deleteShop = () => {
    update(ref(db, '/users/' + auth.currentUser?.uid), {
      type: 'visitor',
    });

    deleteObject(ref1).then(() => {
      // File deleted successfully
    }).catch((error) => {
      console.log(error)
    });

    deleteObject(ref2).then(() => {
      // File deleted successfully
    }).catch((error) => {
      console.log(error)
    });

    deleteObject(ref3).then(() => {
      // File deleted successfully
    }).catch((error) => {
      console.log(error)
    });
  };

  console.log('name is', value.name);

  const handlePasswordReset = (email: string) => {
    sendPasswordResetEmail(auth, email)
      .then(function (user) {
        Alert.alert('Check your email for the password reset link!', 'If not in your inbox it may be in spam.');
      })
      .catch(function (e) {
        console.log(e);
      });
  };

  async function updateAccount() {
    if (value.email === '') {
      setValue({
        ...value,
        error: 'Email is mandatory.',
      });
      return;
    }

    if (value.name === '') {
      setValue({
        ...value,
        error: 'Name is mandatory.',
      });
      return;
    }

    try {
      updateEmail(auth.currentUser!, value.email);
    } catch (error: any) {
      setValue({
        ...value,
        error: error.message,
      });
    }

    try {
      updateProfile(auth.currentUser!, { displayName: value.name });
    } catch (error: any) {
      setValue({
        ...value,
        error: error.message,
      });
    }

    const metadata = {
      contentType: 'image/png',
    };

    const response1 = await fetch(imgUrl1!);
    const blob1 = await response1.blob();

    deleteObject(ref1).then(() => {
      uploadBytes(ref1, blob1, metadata).then((snapshot) => {
        console.log('Uploaded image 1');
      });
    }).catch((error) => {
      // Uh-oh, an error occurred!
      console.log(error)
    });

    const response2 = await fetch(imgUrl2!);
    const blob2 = await response2.blob();

    deleteObject(ref2).then(() => {
      uploadBytes(ref2, blob2, metadata).then((snapshot) => {
        console.log('Uploaded image 2');
      });
    }).catch((error) => {
      // Uh-oh, an error occurred!
      console.log(error)
    });

    const response3 = await fetch(imgUrl3!);
    const blob3 = await response3.blob();

    deleteObject(ref3).then(() => {
      uploadBytes(ref3, blob3, metadata).then((snapshot) => {
        console.log('Uploaded image 3');
      });
    }).catch((error) => {
      // Uh-oh, an error occurred!
      console.log(error)
    });
    
    alert("Saved!")
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
      {userInfo.type === 'vendor' ? (
        <View style={{ backgroundColor: 'transparent' }}>
          <View
            style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 20, backgroundColor: 'transparent' }}
          >
            <TouchableOpacity style={styles.visitorButton} onPress={() => switchAccount('visitor')}>
              <Text style={{ color: '#8FD8B5', fontSize: 16 }}>visitor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vendorButtonPressed}>
              <Text style={{ color: 'white', fontSize: 16 }}>creator</Text>
            </TouchableOpacity>
          </View>
          {value.error && <Text style={styles.error}>{value.error}</Text>}
          <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>Shop Name</Text>
          <TextInput
            style={styles.input}
            placeholder="shop name"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, name: text })}
            value={value.name}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, email: text })}
            value={value.email}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>Shop Photos</Text>
          <View style={styles.eventImageContainer}>
            <TouchableOpacity onPress={() => _pickImage(1)}>
              <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => _pickImage(2)}>
              <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => _pickImage(3)}>
              <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </TouchableOpacity>
          </View>
          <Text
            style={{ color: '#FABF48', marginLeft: 30, marginTop: 50, fontWeight: '600', fontStyle: 'italic' }}
            onPress={() => handlePasswordReset(value.email)}
          >
            Reset password
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#575FCC',
              marginLeft: 30,
              marginRight: 30,
              marginTop: 20,
              height: 48,
              width: 140,
              borderRadius: 20,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            onPress={() => updateAccount()}
          >
            <Text style={styles.buttonTitle}>SAVE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ backgroundColor: 'transparent' }}>
          <View
            style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 20, backgroundColor: 'transparent' }}
          >
            <TouchableOpacity style={styles.visitorButtonPressed}>
              <Text style={{ color: 'white', fontSize: 16 }}>visitor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vendorButton} onPress={() => switchAccount('vendor')}>
              <Text style={{ color: '#FABF48', fontSize: 16 }}>vendor</Text>
            </TouchableOpacity>
          </View>
          {value.error && <Text style={styles.error}>{value.error}</Text>}
          <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="name"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, name: text })}
            value={value.name}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, email: text })}
            value={value.email}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Text
            style={{ color: '#FABF48', marginLeft: 30, marginTop: 10, fontWeight: '600', fontStyle: 'italic' }}
            onPress={() => handlePasswordReset(value.email)}
          >
            Reset password
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#575FCC',
              marginLeft: 30,
              marginRight: 30,
              marginTop: 20,
              height: 48,
              width: 140,
              borderRadius: 20,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            onPress={() => updateAccount()}
          >
            <Text style={styles.buttonTitle}>SAVE</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text style={styles.buttonTitle}>SIGN OUT</Text>
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
    borderColor: '#C4C4C4',
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
  error: {
    color: '#D54826FF',
    marginLeft: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  eventImageContainer: {
    marginLeft: 30,
    width: 85,
    height: 85,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  vendorImage: {
    width: 105,
    height: 105,
    marginRight: 20,
    borderRadius: 20,
  },
});
export default SettingsScreen;
