import { Dimensions, StyleSheet, TouchableOpacity, Text, View, ImageBackground, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref as ref_storage, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import Icon from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth();

export default function SetShopImagesScreen({ route, navigation }: any) {
  const { user } = useAuthentication();
  const auth = getAuth();
  const { name, email, password, instagram } = route.params;
  const [value, setValue] = React.useState({
    error: '',
    tooBig1: false,
    tooBig2: false,
    tooBig3: false,
  });
  const [uploading, setUploading] = useState(false);

  const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
  let imgUrl1Final: any = useRef();

  const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
  let imgUrl2Final: any = useRef();

  const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
  let imgUrl3Final: any = useRef();

  useEffect(() => {}, []);

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

    let name = 'tooBig' + number;
    let otherName = false;
    let otherOtherName = false;
    if (number === 1) {
      otherName = value.tooBig2;
      otherOtherName = value.tooBig3;
    } else if (number === 2) {
      otherName = value.tooBig1;
      otherOtherName = value.tooBig3;
    } else {
      otherName = value.tooBig1;
      otherOtherName = value.tooBig2;
    }

    if (result.fileSize > 3000000) {
      setValue({ ...value, [name]: true, error: 'Image is too large! Please pick another one.' });
      return
    } else if (result.fileSize < 3000000) {
      setValue({ ...value, [name]: false });

      if (!otherName && !otherOtherName) {
        setValue({ ...value, [name]: false, error: '' });
      }
    }

    if (!result.cancelled) {
      switch (number) {
        case 1:
          setImgUrl1(result.uri);
          imgUrl1Final.current = result.uri;
          break;
        case 2:
          setImgUrl2(result.uri);
          imgUrl2Final.current = result.uri;
          break;
        case 3:
          setImgUrl3(result.uri);
          imgUrl3Final.current = result.uri;
          break;
        default:
          break;
      }
    }
  };

  async function signUp() {
    console.log(value.tooBig1 + ' ' + value.tooBig2 + ' ' + value.tooBig3);
    if (imgUrl1 && imgUrl2 && imgUrl3 && !value.tooBig1 && !value.tooBig2 && !value.tooBig3) {
      console.log('img1:', imgUrl1Final.current);
      console.log('img2:', imgUrl2Final.current);
      console.log('img3:', imgUrl3Final.current);
      await createUserWithEmailAndPassword(auth, email, password)
        .then(async (data) => {
          AsyncStorage.setItem('uploadedImages', 'false');
          console.log('UID:', data.user.uid);
          const metadata = {
            contentType: 'image/png',
          };
          setUploading(true);
          const ref1 = ref_storage(storage, data.user.uid + '_1.png');
          console.log('ref 1 done');
          const response1 = await fetch(imgUrl1Final.current);
          console.log('response 1 done');
          const blob1 = await response1.blob();
          console.log('blob 1 done');

          const file1 = new File([blob1], `${data.user.uid}_1.png`, {
            type: 'image/png',
          });
          uploadBytesResumable(ref1, file1, metadata)
            .then(async (snapshot) => {
              console.log('Uploaded image 1');

              const ref2 = ref_storage(storage, data.user.uid + '_2.png');
              console.log('ref 2 done');
              const response2 = await fetch(imgUrl2Final.current);
              console.log('response 2 done');
              const blob2 = await response2.blob();
              console.log('blob 2 done');
              const file2 = new File([blob2], `${data.user.uid}_2.png`, {
                type: 'image/png',
              });
              uploadBytesResumable(ref2, file2, metadata)
                .then(async (snapshot) => {
                  console.log('Uploaded image 2');

                  const ref3 = ref_storage(storage, data.user.uid + '_3.png');
                  console.log('ref 3 done');
                  const response3 = await fetch(imgUrl3Final.current);
                  console.log('response 3 done');
                  const blob3 = await response3.blob();
                  console.log('blob 3 done');
                  const file3 = new File([blob3], `${data.user.uid}_3.png`, {
                    type: 'image/png',
                  });
                  uploadBytesResumable(ref3, file3, metadata)
                    .then(async (snapshot) => {
                      console.log('Uploaded image 3');
                      AsyncStorage.setItem('uploadedImages', 'true');
                      await updateProfile(auth.currentUser!, {
                        displayName: name.trim(),
                      });
                      set(ref(db, '/users/' + data.user.uid), {
                        type: 'vendor',
                        name: name.trim(),
                        uid: data.user.uid,
                        instagram: instagram.replace(/\s+/g, ''),
                      });
                    })
                    .catch((error) => {
                      // Uh-oh, an error occurred!
                      console.log(error);
                      setValue({
                        ...value,
                        error: error.message,
                      });
                      return
                    });
                    setUploading(false);
                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                  console.log(error);
                  setValue({
                    ...value,
                    error: error.message,
                  });
                  return
                });
            })
            .catch((error) => {
              // Uh-oh, an error occurred!
              console.log(error);
              setValue({
                ...value,
                error: error.message,
              });
            });
        })
        .catch((error) => {
          setValue({
            ...value,
            error: error.message,
          });
        });
    } else if (!value.tooBig1 && !value.tooBig2 && !value.tooBig3) {
      setValue({
        ...value,
        error: '3 images are required',
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop Images</Text>
      <Text style={styles.subtitle}>
        Visitors will see these images when browsing. Don't worry, you can change them later!
      </Text>
      {value.error && <Text style={styles.error}>{value.error}</Text>}
      <View style={styles.eventImageContainer}>
        <TouchableOpacity onPress={() => _pickImage(1)}>
          <ImageBackground
            source={{ uri: imgUrl1 }}
            style={[styles.vendorImage, imgUrl1 ? { borderWidth: 0 } : { borderWidth: 1 }, {marginRight: 20}]}
            imageStyle={{ borderRadius: 20 }}
          >
            {!imgUrl1 && <Icon name="plus" color="#C4C4C4" size={40} />}
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _pickImage(2)}>
          <ImageBackground
            source={{ uri: imgUrl2 }}
            style={[styles.vendorImage, imgUrl2 ? { borderWidth: 0 } : { borderWidth: 1 }, {marginRight: 20}]}
            imageStyle={{ borderRadius: 20 }}
          >
            {!imgUrl2 && <Icon name="plus" color="#C4C4C4" size={40} />}
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _pickImage(3)}>
          <ImageBackground
            source={{ uri: imgUrl3 }}
            style={[styles.vendorImage, imgUrl3 ? { borderWidth: 0 } : { borderWidth: 1 }]}
            imageStyle={{ borderRadius: 20 }}
          >
            {!imgUrl3 && <Icon name="plus" color="#C4C4C4" size={40} />}
          </ImageBackground>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={imgUrl1 && imgUrl2 && imgUrl3 ? styles.button : styles.altButton}
        onPress={() => !uploading && signUp()}
      >
        <Text style={imgUrl1 && imgUrl2 && imgUrl3 ? styles.buttonTitle : styles.altButtonTitle}>NEXT →</Text>
      </TouchableOpacity>
      {uploading && <ActivityIndicator style={{ marginTop: 20 }} animating={true} />}
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
    marginLeft: 30,
    marginBottom: 10,
    width: '90%',
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
  },
  eventImageContainer: {
    marginHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  vendorImage: {
    width: 98,
    height: 98,
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
