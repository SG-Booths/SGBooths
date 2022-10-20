import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { db } from '../config/firebase';
import { push, ref, set } from 'firebase/database';

const auth = getAuth();

const SignUpVisitorScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    name: '',
  });

  const onFooterLinkPress = () => {
    navigation.navigate('SignIn');
  };

  async function signUp() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.',
      });
      return;
    }

    if (value.password != value.confirmPassword) {
      setValue({
        ...value,
        error: 'Passwords must match.',
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, value.email, value.password);
      updateProfile(auth.currentUser!, {
        displayName: value.name,
      });
      set(ref(db, '/users/' + auth.currentUser?.uid), {
        type: 'visitor',
        name: value.name,
      });
      navigation.navigate('SignIn');
    } catch (error: any) {
      setValue({
        ...value,
        error: error.message,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} keyboardShouldPersistTaps="always">
        <Text style={styles.title}>sign up</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'center', margin: 30 }}>
          <TouchableOpacity style={styles.visitorButton}>
            <Text style={{ color: 'white', fontSize: 16 }}>visitor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vendorButton} onPress={() => navigation.navigate('SignUpVendorScreen')}>
            <Text style={{ color: '#FABF48', fontSize: 16 }}>creator</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="name"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, name: text })}
          value={value.name}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
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
        <TouchableOpacity style={styles.button} onPress={() => signUp()}>
          <Text style={styles.buttonTitle}>SIGN UP →</Text>
        </TouchableOpacity>
        <View style={styles.footerView}>
          <Text style={styles.footerText}>
            already have an account?{' '}
            <Text onPress={onFooterLinkPress} style={styles.footerLink}>
              log in
            </Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150, // TODO: fix spacing
  },
  title: {
    alignSelf: 'center',
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
  visitorButton: {
    backgroundColor: '#8FD8B5',
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
  vendorButton: {
    borderColor: '#FABF48',
    borderWidth: 1,
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
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
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
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  },
});

export default SignUpVisitorScreen;
