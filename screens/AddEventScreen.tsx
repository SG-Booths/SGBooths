import { StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { db, storage } from '../config/firebase';
import { ref, push, set, update } from 'firebase/database';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';

export default function AddEventScreen({ navigation }: RootStackScreenProps<'AddEvent'>) {
    const [value, setValue] = React.useState({
        name: '',
        day: '',
        month: '',
        year: '',
        location: ''
      });

      const addEvent = () => {
        const newReference = push(ref(db, '/events/'), {
            name: value.name,
            date: {
                day: value.day,
                month: value.month,
                year: value.year
            },
            location: value.location,
          });

          update (newReference, {
            key: newReference.key,
        })

          const ref1 = ref_storage(storage, newReference.key + '.png');

          getDownloadURL(ref1)
          .then((url) => {
            console.log('url is ',url)
              let imgurl = url;
              set (newReference, {
                key: newReference.key,
                imgUrl: imgurl
            })
            alert('done')
            setValue({
                name: '',
                day: '',
                month: '',
                year: '',
                location: ''
            })
          })
          .catch((error) => {
              console.log('error:' + error);
          });

      }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add event</Text>
      <TextInput
        style={styles.input}
        placeholder="name"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setValue({ ...value, name: text })}
        value={value.name}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
          />
          <View style={{backgroundColor: 'transparent', flexDirection: 'row'}}>
            <TextInput
            style={[styles.input, {width: 100, marginHorizontal: 10}]}
            placeholder="day"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, day: text })}
            value={value.day}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            keyboardType='numeric'
            maxLength={2}
            />
            <TextInput
            style={[styles.input, {width: 100, marginHorizontal: 10}]}
            placeholder="month"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, month: text })}
            value={value.month}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            keyboardType='numeric'
            maxLength={2}
            />
            <TextInput
            style={[styles.input, {width: 100, marginHorizontal: 10}]}
            placeholder="year"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, year: text })}
            value={value.year}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            keyboardType='numeric'
            maxLength={4}
            />
          </View>
        <TextInput
        style={styles.input}
        placeholder="location"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setValue({ ...value, location: text })}
        value={value.location}
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        multiline={true}
          />
          <TouchableOpacity onPress={() => addEvent()}>
            <Text style={{color: 'black'}}>add event</Text>
          </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black'
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
});
