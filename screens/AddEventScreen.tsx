import { StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { ref, push, set, update } from 'firebase/database';
import { ref as ref_storage, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import Icon from 'react-native-vector-icons/Entypo';

export default function AddEventScreen({ navigation }: RootStackScreenProps<'AddEvent'>) {
  const [value, setValue] = React.useState({
    name: '',
    day: '',
    month: '',
    year: '',
    location: '',
    error: '',
    tooBig: false,
  });

  const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
  let imgUrl1Final: any = useRef();

  const _pickImage = async () => {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      maxWidth: 500,
      maxHeight: 500,
    });

    console.log(result.fileSize);

    if (result.fileSize > 4000000) {
      setValue({ ...value, tooBig: true, error: 'Image is too large! Please pick another one.' });
    } else if (result.fileSize < 4000000) {
      setValue({ ...value, tooBig: false });
    }

    if (!result.cancelled) {
      setImgUrl1(result.uri);
      imgUrl1Final.current = result.uri;
    }
  };

  const addEvent = async () => {
    if (!value.tooBig) {
      const newReference = push(ref(db, '/events/'), {
        name: value.name,
        date: {
          day: value.day,
          month: value.month,
          year: value.year,
        },
        location: value.location,
      });

      update(newReference, {
        key: newReference.key,
      });

      const ref1 = ref_storage(storage, newReference.key + '.png');
      console.log('ref 1 done');
      const response1 = await fetch(imgUrl1Final.current);
      console.log('response 1 done');
      const blob1 = await response1.blob();
      console.log('blob 1 done');

      const metadata = {
        contentType: 'image/png',
      };

      const file1 = new File([blob1], `${newReference.key}.png`, {
        type: 'image/png',
      });
      uploadBytesResumable(ref1, file1, metadata).then(async (snapshot) => {
        console.log('Uploaded image 1');
        alert('uploaded');
        setValue({
          name: '',
          day: '',
          month: '',
          year: '',
          location: '',
          error: '',
          tooBig: false,
        });
      });
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add event</Text>
      {value.error && <Text style={styles.error}>{value.error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="name"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setValue({ ...value, name: text.toLowerCase() })}
        value={value.name}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
      />
      <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
        <TextInput
          style={[styles.input, { width: 100, marginHorizontal: 10 }]}
          placeholder="day"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, day: text })}
          value={value.day}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, { width: 100, marginHorizontal: 10 }]}
          placeholder="month"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, month: text })}
          value={value.month}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, { width: 100, marginHorizontal: 10 }]}
          placeholder="year"
          placeholderTextColor="#C4C4C4"
          onChangeText={(text) => setValue({ ...value, year: text })}
          value={value.year}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="location"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setValue({ ...value, location: text.toLowerCase() })}
        value={value.location}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        multiline={true}
      />
      <TouchableOpacity onPress={() => _pickImage()}>
        <ImageBackground
          source={{ uri: imgUrl1 }}
          style={[styles.vendorImage, imgUrl1 ? { borderWidth: 0 } : { borderWidth: 1 }]}
          imageStyle={{ borderRadius: 20 }}
        >
          {!imgUrl1 && <Icon name="plus" color="#C4C4C4" size={40} />}
        </ImageBackground>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addEvent()}>
        <Text style={{ color: 'black' }}>add event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A3242',
  },
  input: {
    width: 300,
    height: 48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 30,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  vendorImage: {
    width: 98,
    height: 98,
    marginRight: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#D54826FF',
    marginLeft: 30,
    marginBottom: 10,
  },
});
