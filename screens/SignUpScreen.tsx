import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Alert, Keyboard, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Icon from 'react-native-vector-icons/AntDesign';
import { db } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { Dropdown } from 'react-native-element-dropdown';
import Checkbox from 'expo-checkbox';

const SignUpScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const auth = getAuth();
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    name: '',
  });
  const [type, setType] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [items, setItems] = useState([
    { label: 'visitor', value: 'visitor' },
    { label: 'creator', value: 'vendor' },
  ]);

  const onFooterLinkPress = () => {
    navigation.navigate('SignIn');
  };

  async function signUp() {
    if (!isChecked) {
      setValue({
        ...value,
        error: 'Accept the Privacy Policy to continue',
      });
      return;
    }

    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory',
      });
      return;
    }

    if (value.password != value.confirmPassword) {
      setValue({
        ...value,
        error: 'Passwords must match',
      });
    }

    if (value.name === '') {
      setValue({
        ...value,
        error: 'Name is mandatory',
      });
      return;
    }

    if (type === 'vendor') {
      try {
        await signInWithEmailAndPassword(auth, value.email, value.password);
      } catch (error: any) {
        console.log(error.message);
        if (error.message.includes('wrong-password')) {
          setValue({
            ...value,
            error: 'Email already in use',
          });
        } else if (error.message.includes('too-many-requests')) {
          setValue({
            ...value,
            error: 'Please wait a while before trying again',
          });
        } else if (error.message.includes('weak-password')) {
          setValue({
            ...value,
            error: 'Password must be at least 6 characters',
          });
        } else if (error.message.includes('user-not-found')) {
          navigation.navigate('SetInstagramUsernameScreen', {
            email: value.email,
            password: value.password,
            name: value.name,
          });
        } else if (error.message.includes('invalid-email')) {
          setValue({
            ...value,
            error: 'Please enter a valid email',
          });
        } else {
          setValue({
            ...value,
            error: error.message,
          });
        }
      }
    } else {
      await createUserWithEmailAndPassword(auth, value.email.trim(), value.password.trim())
        .then(async (data) => {
          await updateProfile(auth.currentUser!, {
            displayName: value.name.trim(),
          });
          set(ref(db, '/users/' + data.user.uid), {
            type: 'visitor',
            name: value.name.trim(),
            uid: data.user.uid,
          });
        })
        .catch((error) => {
          if (error.message.includes('email-already-in-use')) {
            setValue({
              ...value,
              error: 'Email already in use',
            });
          } else if (error.message.includes('weak-passwrd')) {
            setValue({
              ...value,
              error: 'Password must be at least 6 characters',
            });
          } else if (error.message.includes('invalid-email')) {
            setValue({
              ...value,
              error: 'Please enter a valid email',
            });
          } else {
            setValue({
              ...value,
              error: error.message,
            });
          }
        });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>sign up</Text>
          {value.error && <Text style={styles.error}>{value.error}</Text>}
          <View
            style={{
              flexDirection: 'row',
              width: 320,
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            <Dropdown
              statusBarIsTranslucent={true}
              style={{
                width: 270,
                height: 48,
                borderRadius: 20,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#C4C4C4',
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
              }}
              containerStyle={{
                width: 270,
                borderRadius: 20,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#C4C4C4',
              }}
              itemContainerStyle={{
                borderRadius: 20,
              }}
              placeholder="account type"
              placeholderStyle={{ color: '#C4C4C4' }}
              value={type}
              data={items}
              onChange={(item) => setType(item.value)}
              labelField="label"
              valueField="value"
            />
            <TouchableOpacity
              style={{ justifyContent: 'center', marginLeft: 20 }}
              onPress={() => {
                Alert.alert(
                  'What do the account types mean?',
                  'While both account types are able to browse events and creators, only creators can indicate that they are boothing at an event.'
                );
              }}
            >
              <Icon name="questioncircleo" color="#2A3242" size={30} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder={type === 'vendor' ? 'shop name' : 'name'}
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, name: text })}
            value={value.name}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="email address"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, email: text })}
            value={value.email}
            keyboardType="email-address"
            textContentType="emailAddress"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#C4C4C4"
            secureTextEntry
            placeholder="password"
            onChangeText={(text) => setValue({ ...value, password: text })}
            value={value.password}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#C4C4C4"
            secureTextEntry
            placeholder="confirm password"
            onChangeText={(text) => setValue({ ...value, confirmPassword: text })}
            value={value.confirmPassword}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <View style={{ backgroundColor: 'transparent', flexDirection: 'row', marginTop: 10 }}>
            <Checkbox
              style={{ marginRight: 10 }}
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? '#2A3242' : undefined}
            />
            <Text style={{ color: '#2A3242' }}>I have read and agree to the </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://www.iubenda.com/privacy-policy/57949571').catch((err) => {
                  console.error('Failed opening page because: ', err);
                  alert('Failed to open page');
                })
              }
            >
              <Text style={{ color: '#2A3242', fontWeight: 'bold' }}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => signUp()}>
            <Text style={styles.buttonTitle}>SIGN UP →</Text>
          </TouchableOpacity>
          <View style={styles.footerView}>
            <Text style={styles.footerText}>already have an account? </Text>
            <TouchableOpacity onPress={onFooterLinkPress}>
              <Text style={styles.footerLink}>log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
  input: {
    width: 320,
    height: 48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
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
  visitorButton: {
    borderColor: '#8FD8B5',
    borderWidth: 1,
    marginLeft: 30,
    marginRight: 20,
    marginTop: 20,
    height: 48,
    width: 140,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  vendorButton: {
    backgroundColor: '#FABF48',
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
  altButtonTitle: {
    color: 'white',
    fontSize: 16,
  },
  footerView: {
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 16,
    color: '#C4C4C4',
  },
  footerLink: {
    color: '#2A3242',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#D54826FF',
    marginLeft: 30,
    marginTop: 10,
  },
});

export default SignUpScreen;
