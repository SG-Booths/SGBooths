import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Image, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button } from 'react-native-elements';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { StackScreenProps } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const auth = getAuth();
// TODO: reset pw
const SignInScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: '',
  });

  const onFooterLinkPress = () => {
    navigation.navigate('SignUpVendorScreen');
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

  async function signIn() {
    console.log(value.email, value.password);
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, value.email, value.password);
    } catch (error: any) {
      console.log(error);
      setValue({
        ...value,
        error: error.message,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} keyboardShouldPersistTaps="always">
        <Text style={styles.title}>log in</Text>
        {value.error && <Text style={styles.error}>{value.error}</Text>}
        <TextInput
          style={styles.input}
          placeholder="email address"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, email: text })}
          keyboardType="email-address"
          textContentType="emailAddress"
          value={value.email}
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
        <TouchableOpacity style={styles.button} onPress={() => signIn()}>
          <Text style={styles.buttonTitle}>LOG IN →</Text>
        </TouchableOpacity>
        <View style={styles.footerView}>
          <Text style={styles.footerText}>
            don't have an account?{' '}
            <Text onPress={onFooterLinkPress} style={styles.footerLink}>
              sign up
            </Text>
          </Text>
          <Text
            style={{ fontSize: 16, color: '#FABF48', marginTop: 30, fontWeight: '600', fontStyle: 'italic' }}
            onPress={() => handlePasswordReset(value.email)}
          >
            reset password
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200, // TODO: fix spacing
  },
  title: {
    alignSelf: 'center',
    margin: 30,
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
  },
  button: {
    backgroundColor: '#2A3242',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    width: 120,
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
  footerView: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
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
    marginBottom: 20,
  },
});

export default SignInScreen;
