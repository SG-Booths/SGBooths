import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  ImageBackground,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { getAuth, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { onValue, ref, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import Image from 'react-native-image-progress';
import { ref as ref_storage, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '../components/Themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Entypo';

export default function SettingsScreen({ route, navigation }: any) {
  const { user } = useAuthentication();
  const auth = getAuth();

  const initialInstagram = route.params.instagram;

  const initialType = route.params.type;

  const [value, setValue] = React.useState({
    email: '',
    error: '',
    name: '',
    instagram: initialInstagram,
    type: initialType,
  });

  const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
  let ref1: any;
  if (value.type === 'vendor') ref1 = ref_storage(storage, auth?.currentUser?.uid + '_1.png');

  const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
  let ref2: any;
  if (value.type === 'vendor') ref2 = ref_storage(storage, auth?.currentUser?.uid + '_2.png');

  const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
  let ref3: any;
  if (value.type === 'vendor') ref3 = ref_storage(storage, auth?.currentUser?.uid + '_3.png');

  // const getPermissionAsync = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     alert('...');
  //   }
  // };

  const _pickImage = async (number: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your photos!");
      return;
    }
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      maxWidth: 500,
      maxHeight: 500,
    });

    console.log(result.fileSize);

    let tooBig = false;

    if (result.fileSize > 3000000) {
      tooBig = true;
      setValue({ ...value, error: 'Image is too large! Please pick another one.' });
    } else if (result.fileSize < 3000000) {
      tooBig = false;
      setValue({ ...value, error: '' });
    }

    const metadata = {
      contentType: 'image/png',
    };

    if (!result.cancelled && !tooBig) {
      switch (number) {
        case 1:
          const response1 = await fetch(result.uri);
          const blob1 = await response1.blob();

          getDownloadURL(ref1)
            .then((url) => {
              deleteObject(ref1)
                .then(() => {
                  uploadBytes(ref1, blob1, metadata).then((snapshot) => {
                    console.log('Uploaded image 1');
                    setImgUrl1(result.uri);
                  });
                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                  console.log(error);
                });
            })
            .catch((error) => {
              if (error.code === 'storage/object-not-found') {
                uploadBytes(ref1, blob1, metadata).then((snapshot) => {
                  console.log('Uploaded image 1');
                });
              } else {
                console.log(error);
              }
            });
          break;
        case 2:
          const response2 = await fetch(result.uri);
          const blob2 = await response2.blob();

          getDownloadURL(ref2)
            .then((url) => {
              deleteObject(ref2)
                .then(() => {
                  uploadBytes(ref2, blob2, metadata).then((snapshot) => {
                    console.log('Uploaded image 2');
                    setImgUrl2(result.uri);
                  });
                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                  console.log(error);
                });
            })
            .catch((error) => {
              if (error.code === 'storage/object-not-found') {
                uploadBytes(ref2, blob2, metadata).then((snapshot) => {
                  console.log('Uploaded image 2');
                });
              } else {
                console.log(error);
              }
            });
          break;
        case 3:
          const response3 = await fetch(result.uri);
          const blob3 = await response3.blob();

          getDownloadURL(ref3)
            .then((url) => {
              deleteObject(ref3)
                .then(() => {
                  uploadBytes(ref3, blob3, metadata).then((snapshot) => {
                    console.log('Uploaded image 3');
                    setImgUrl3(result.uri);
                  });
                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                  console.log(error);
                });
            })
            .catch((error) => {
              if (error.code === 'storage/object-not-found') {
                uploadBytes(ref3, blob3, metadata).then((snapshot) => {
                  console.log('Uploaded image 3');
                });
              } else {
                console.log(error);
              }
            });
          break;
        default:
          break;
      }
    }
  };

  useMemo(() => {
    if (value.type === 'vendor') {
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
    }
    // getPermissionAsync();
  }, [value]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    return await onValue(ref(db, '/users/' + auth?.currentUser?.uid), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userData = { ...data };
      // setValue({ ...value, name: userData.name, email: user?.email! });
      setValue({
        ...value,
        name: auth?.currentUser?.displayName!,
        email: auth?.currentUser?.email!,
        instagram: userData.instagram,
      });
    });
  };

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
        error: 'Email is mandatory',
      });
      return;
    }

    if (value.name === '') {
      setValue({
        ...value,
        error: 'Name is mandatory',
      });
      return;
    }

    if (value.name != auth.currentUser?.displayName) {
      try {
        updateProfile(auth.currentUser!, { displayName: value.name });
      } catch (error: any) {
        setValue({
          ...value,
          error: error.message,
        });
      }
      update(ref(db, '/users/' + auth.currentUser?.uid), {
        name: value.name,
      });
    }

    if (value.instagram != initialInstagram) {
      update(ref(db, '/users/' + auth.currentUser?.uid), {
        instagram: value.instagram,
      });
    }

    Alert.alert('Saved!');
    Keyboard.dismiss();
  }
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View
            style={{
              marginLeft: 20,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              marginTop: 30,
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="keyboard-arrow-left" size={50} color="#575FCC" style={{ marginTop: 5 }} />
            </TouchableOpacity>
            <Text style={styles.title}>profile</Text>
          </View>
          <View style={{ backgroundColor: 'transparent' }}>
            {value.type === 'vendor' ? (
              <View style={{ backgroundColor: 'transparent' }}>
                {value.error && <Text style={styles.error}>{value.error}</Text>}
                <Text style={{ marginLeft: 30, marginBottom: 10, fontWeight: '700', color: '#2A3242', marginTop: 30 }}>
                  Shop Name
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="shop name"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, name: text })}
                  value={value.name}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  defaultValue={auth?.currentUser?.displayName!}
                />
                <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>
                  Instagram
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="instagram username (without @)"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, instagram: text })}
                  value={value.instagram}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  autoCorrect={false}
                  defaultValue={initialInstagram}
                />
                <View
                  style={{
                    marginVertical: 10,
                    marginHorizontal: 30,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: '#2A3242' }}>Email</Text>
                  <TouchableOpacity onPress={() => handlePasswordReset(value.email)}>
                    <Text style={{ color: '#FABF48', fontWeight: '600', fontStyle: 'italic' }}>Reset password</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="email"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, email: text })}
                  value={value.email}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  defaultValue={auth?.currentUser?.email!}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={false}
                />
                <Text style={{ marginLeft: 30, marginVertical: 10, fontWeight: '700', color: '#2A3242' }}>
                  Shop Photos
                </Text>
                <View style={styles.eventImageContainer}>
                  <TouchableOpacity onPress={() => _pickImage(1)}>
                    <ImageBackground
                      source={{ uri: imgUrl1 }}
                      style={[styles.vendorImage, imgUrl1 ? { borderWidth: 0 } : { borderWidth: 1 }]}
                      imageStyle={{ borderRadius: 20 }}
                    >
                      {!imgUrl1 && <Icon2 name="plus" color="#C4C4C4" size={40} />}
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => _pickImage(2)}>
                    <ImageBackground
                      source={{ uri: imgUrl2 }}
                      style={[styles.vendorImage, imgUrl2 ? { borderWidth: 0 } : { borderWidth: 1 }]}
                      imageStyle={{ borderRadius: 20 }}
                    >
                      {!imgUrl2 && <Icon2 name="plus" color="#C4C4C4" size={40} />}
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => _pickImage(3)}>
                    <ImageBackground
                      source={{ uri: imgUrl3 }}
                      style={[styles.vendorImage, imgUrl3 ? { borderWidth: 0 } : { borderWidth: 1 }]}
                      imageStyle={{ borderRadius: 20 }}
                    >
                      {!imgUrl3 && <Icon2 name="plus" color="#C4C4C4" size={40} />}
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: 'transparent' }}>
                {value.error && <Text style={styles.error}>{value.error}</Text>}
                <Text style={{ marginLeft: 30, marginBottom: 10, fontWeight: '700', color: '#2A3242', marginTop: 30 }}>
                  Name
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="name"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, name: text })}
                  value={value.name}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  defaultValue={auth?.currentUser?.displayName!}
                />
                <View
                  style={{
                    marginVertical: 10,
                    marginHorizontal: 30,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: '#2A3242' }}>Email</Text>
                  <TouchableOpacity onPress={() => handlePasswordReset(value.email)}>
                    <Text style={{ color: '#FABF48', fontWeight: '600', fontStyle: 'italic' }}>Reset password</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="email"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, email: text })}
                  value={value.email}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  defaultValue={auth?.currentUser?.email!}
                />
              </View>
            )}
            <View
              style={{
                marginLeft: 30,
                marginRight: 30,
                marginTop: 50,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: '#575FCC',
                  height: 48,
                  width: '45%',
                  borderRadius: 20,
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => updateAccount()}
              >
                <Text style={styles.buttonTitle}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#2A3242',
                  height: 48,
                  width: '45%',
                  borderRadius: 20,
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => signOut(auth)}
              >
                <Text style={styles.buttonTitle}>SIGN OUT</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#D54826FF',
                height: 48,
                width: '45%',
                borderRadius: 20,
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}
              onPress={() =>
                navigation.navigate('VerifyAccountScreen', {
                  type: 'delete account',
                })
              }
            >
              <Text style={styles.buttonTitle}>DELETE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

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
    marginHorizontal: 30,
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
    marginTop: 20,
  },
  eventImageContainer: {
    marginLeft: 50,
    marginRight: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  vendorImage: {
    width: 105,
    height: 105,
    marginRight: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
