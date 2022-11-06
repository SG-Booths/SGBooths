import { StyleSheet, TouchableOpacity, TextInput, Text, View, Dimensions } from 'react-native';
import React from 'react';
export default function ReferralScreen({ route, navigation }: any) {
  const { name, email, password } = route.params;
  const [value, setValue] = React.useState({
    referral: '',
  });
  const signUp = () => {
    navigation.navigate('SetInstagramUsernameScreen', {
      email: email,
      password: password,
      name: name,
      referral: value.referral,
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Referral Code</Text>
      <Text style={styles.subtitle}>
        If another creator referred you, please enter their referral code! This will boost your and their shop when
        visitors are browsing creators and events.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="referral code"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setValue({ ...value, referral: text })}
        value={value.referral}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={6}
      />
      <TouchableOpacity style={value.referral ? styles.button : styles.altButton} onPress={() => signUp()}>
        <Text style={value.referral ? styles.buttonTitle : styles.altButtonTitle}>
          {value.referral ? 'NEXT →' : 'SKIP →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF8F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    marginHorizontal: 30,
    marginBottom: 10,
  },
  input: {
    width: Dimensions.get('window').width - 60,
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
  altButton: {
    borderWidth: 1,
    borderColor: '#2A3242',
    backgroundColor: 'transparent',
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
    color: '#2A3242',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
