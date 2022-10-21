import { StyleSheet, TouchableOpacity, TextInput, Text, View } from 'react-native';
import React from 'react'
export default function UpdateInstagramUsernameScreen({ route, navigation }: any) {
  const { name, email } = route.params;
  const [value, setValue] = React.useState({
    instagram: ''
  });
  const signUp = () => {
    navigation.navigate('UpdateShopImagesScreen', {
      email: email,
      name: name,
      instagram: value.instagram
    })
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop Instagram</Text>
      <Text style={styles.subtitle}>This will allow visitors to visit your Instagram!</Text>
      <TextInput
          style={styles.input}
          placeholder="instagram username (without @)"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, instagram: text })}
          value={value.instagram}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={value.instagram ? (styles.button) : (styles.altButton)} onPress={() => signUp()}>
          <Text style={value.instagram ? (styles.buttonTitle) : (styles.altButtonTitle)}>{value.instagram ? ('NEXT →') : ('SKIP →')}</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF8F3'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 30,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    marginLeft: 30,
    marginBottom: 10
  },
  input: {
    width: 320,
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
  }
});