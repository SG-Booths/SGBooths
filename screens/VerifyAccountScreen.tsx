import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Text, View, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getAuth,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  updateEmail,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { ref as ref_storage, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { onValue, set, ref, remove, update } from 'firebase/database';

export default function VerifyAccountScreen({ route, navigation }: any) {
  const { type, newEmail } = route.params;
  const auth = getAuth();
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

  useEffect(() => {
    setVerifyEmail(auth?.currentUser?.email!);
    console.log('verify account screen');
  }, []);

  const verifyAccount = () => {
    const provider = EmailAuthProvider;
    const authCredential = provider.credential(verifyEmail, verifyPassword);
    return authCredential;
  };

  const changeEmail = async () => {
    const authCredential = verifyAccount();
    reauthenticateWithCredential(auth?.currentUser!, authCredential);
    await updateEmail(auth.currentUser!, newEmail)
      .then(async () => {
        Alert.alert('Your email ' + newEmail + ' has been successfully updated');
        await signInWithEmailAndPassword(auth, newEmail, verifyPassword);
        navigation.goBack();
      })
      .catch((error) => {
        setError(error.message);
        console.log(error.message);
      });
  };

  const removeFollows = () => {
    onValue(ref(db, '/users'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let users = { ...data };

      Object.values(users).map((vendorKey: any) => {
        Object.values(vendorKey).map((vendorKey2: any) => {
          Object.keys(vendorKey2).map((vendorKey3: any) => {
            if (vendorKey3 === auth?.currentUser?.uid) {
              remove(ref(db, '/users/' + vendorKey.uid + '/vendorsFollowing/' + auth?.currentUser?.uid));
            }
          });
        });
      });
    });
  };

  const removeBooths = () => {
    onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let events = { ...data };

      Object.values(events).map((eventKey: any) => {
        remove(ref(db, '/events/' + eventKey.key + '/vendors/' + auth?.currentUser?.uid));
      });
    });
  };

  const deleteAccount = async () => {
    Alert.alert('Are you sure?', 'This is irreversible!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete Account',
        onPress: async () => {
          try {
            const authCredential = await verifyAccount();

            try {
              await reauthenticateWithCredential(auth?.currentUser!, authCredential);
              try {
                remove(ref(db, '/users/' + auth?.currentUser?.uid));
                removeFollows();
                removeBooths();

                await deleteUser(auth?.currentUser!)
                  .then(() => {
                    let ref1: any;
                    if (type === 'vendor') ref1 = ref_storage(storage, auth?.currentUser?.uid + '_1.png');
                    let ref2: any;
                    if (type === 'vendor') ref2 = ref_storage(storage, auth?.currentUser?.uid + '_2.png');
                    let ref3: any;
                    if (type === 'vendor') ref3 = ref_storage(storage, auth?.currentUser?.uid + '_3.png');

                    deleteObject(ref1)
                      .then(() => {
                        console.log('deleted img 1');

                        deleteObject(ref2)
                          .then(() => {
                            console.log('deleted img 2');

                            deleteObject(ref3)
                              .then(async () => {
                                console.log('deleted img 3');

                                await deleteUser(auth?.currentUser!)
                                  .then(() => {
                                    console.log('Successfully deleted user');
                                    Alert.alert('Your account has been deleted');
                                  })
                                  .catch((error) => {
                                    setError(error.message);
                                    console.log('error:', error.message);
                                  });
                              })
                              .catch((error) => {
                                console.log(error);
                              });
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                      });

                    console.log('Successfully deleted user');
                    Alert.alert('Your account has been deleted');
                  })
                  .catch((error) => {
                    setError(error.message);
                    console.log('error:', error.message);
                  });
              } catch (error: any) {
                if (error.message.includes('wrong-password')) {
                  setError('Wrong password');
                } else if (error.message.includes('too-many-requests')) {
                  setError('Please wait a while before trying again');
                } else if (error.message.includes('user-mismatch')) {
                  setError('Please make sure your email address is correct');
                } else if (error.message.includes('internal-error')) {
                  setError('Please enter both your email and password');
                } else {
                  setError(error.message);
                }
                console.log('error:', error.message);
              }
            } catch (error: any) {
              if (error.message.includes('wrong-password')) {
                setError('Wrong password');
              } else if (error.message.includes('too-many-requests')) {
                setError('Please wait a while before trying again');
              } else if (error.message.includes('user-mismatch')) {
                setError('Please make sure your email address is correct');
              } else if (error.message.includes('internal-error')) {
                setError('Please enter both your email and password');
              } else {
                setError(error.message);
              }
              console.log('error:', error.message);
            }
          } catch (error: any) {
            if (error.message.includes('wrong-password')) {
              setError('Wrong password');
            } else if (error.message.includes('too-many-requests')) {
              setError('Please wait a while before trying again');
            } else if (error.message.includes('user-mismatch')) {
              setError('Please make sure your email address is correct');
            } else if (error.message.includes('internal-error')) {
              setError('Please enter both your email and password');
            } else {
              setError(error.message);
            }
            console.log('error:', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#FFF8F3', flex: 1 }}>
      <View style={{ backgroundColor: 'transparent', marginLeft: 20, marginTop: 20 }}>
        <View style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginTop: 5, marginRight: 5 }} onPress={() => navigation.goBack()}>
            <Icon name="keyboard-arrow-left" size={50} color="#575FCC" style={{ marginTop: 5 }} />
          </TouchableOpacity>
          <Text style={[styles.title, { textAlignVertical: 'center' }]}>verification</Text>
        </View>
        <Text style={{ color: '#2A3242', fontWeight: '500', marginTop: 20, marginLeft: 10 }}>
          Please sign in again to {type === 'delete account' ? 'delete your account' : 'change your email'}
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          style={[styles.input, { width: '90%', marginLeft: 10, marginTop: 20 }]}
          placeholder="email address"
          placeholderTextColor="#FABF48"
          onChangeText={(text) => setVerifyEmail(text)}
          value={verifyEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          editable={false}
        />
        <TextInput
          style={[styles.input, { width: '90%', marginLeft: 10, marginTop: 20 }]}
          placeholderTextColor="#C4C4C4"
          secureTextEntry
          placeholder="password"
          onChangeText={(text) => setVerifyPassword(text)}
          value={verifyPassword}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        {type != 'delete account' ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#575FCC',
              height: 48,
              width: 160,
              borderRadius: 20,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              marginTop: 10,
            }}
            onPress={() => changeEmail()}
          >
            <Text style={styles.buttonTitle}>VERIFY</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: '#D54826FF',
              height: 48,
              width: 220,
              borderRadius: 20,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              marginTop: 10,
            }}
            onPress={() => deleteAccount()}
          >
            <Text style={styles.buttonTitle}>DELETE ACCOUNT</Text>
          </TouchableOpacity>
        )}
      </View>
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
    marginLeft: 10,
    marginTop: 20,
  },
});
