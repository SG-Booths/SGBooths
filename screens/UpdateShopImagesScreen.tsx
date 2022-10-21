import { StyleSheet, TouchableOpacity, Text, View, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react'
import { db, storage } from '../config/firebase';
import { ref, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { ref as ref_storage, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import Icon from 'react-native-vector-icons/Entypo';

const auth = getAuth();

export default function UpdateShopImagesScreen({ route, navigation }: any) {
    const { user } = useAuthentication();
    const auth = getAuth();
    const { instagram } = route.params;
    const [value, setValue] = React.useState({
        error: ''
      });

    const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);

    const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);

    const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);

    useEffect(() => {
        getPermissionAsync()
      }, []);

    const getPermissionAsync = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("...");
        }
    };

    const _pickImage = async (number: number) => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1]
        });
    
        console.log(result);
    
        if (!result.cancelled) {
          switch (number) {
            case 1:
              setImgUrl1(result.uri)
              break;
            case 2:
              setImgUrl2(result.uri)
              break;
            case 3:
              setImgUrl3(result.uri)
              break;
            default:
              break;
          }
        }
      };

    const signUp = async () => {
      if (imgUrl1 && imgUrl2 && imgUrl3) {
      console.log('img1:', imgUrl1)
      console.log('img2:', imgUrl2)
      console.log('img3:', imgUrl3)

      const metadata = {
          contentType: 'image/png',
        };

        const ref1 = ref_storage(storage, user?.uid + '_1.png');
        const response1 = await fetch(imgUrl1);
        const blob1 = await response1.blob();
        uploadBytesResumable(ref1, blob1, metadata).then(async (snapshot) => {
          console.log('Uploaded image 1');

          const ref2 = ref_storage(storage, user?.uid + '_2.png');
          const response2 = await fetch(imgUrl2);
          const blob2 = await response2.blob();
          uploadBytesResumable(ref2, blob2, metadata).then(async (snapshot) => {
            console.log('Uploaded image 2');

            const ref3 = ref_storage(storage, user?.uid + '_3.png');
            const response3 = await fetch(imgUrl3);
            const blob3 = await response3.blob();
            uploadBytesResumable(ref3, blob3, metadata).then((snapshot) => {
              console.log('Uploaded image 3');

              try {
                update(ref(db, '/users/' + auth.currentUser?.uid), {
                  instagram: instagram.replace(/\s+/g, ''),
                  type: 'vendor'
                });
                navigation.navigate('SettingsScreen');
              } catch (error: any) {
                setValue({
                  ...value,
                  error: error.message,
                });
              }
            }).catch((error) => {
              // Uh-oh, an error occurred!
              console.log(error)
            })
          }).catch((error) => {
            // Uh-oh, an error occurred!
            console.log(error)
          })
        }).catch((error) => {
          // Uh-oh, an error occurred!
          console.log(error)
          return
        })
      }
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop Images</Text>
      <Text style={styles.subtitle}>Visitors will see these images when browsing. Don't worry, you can change them later!</Text>
      <View style={styles.eventImageContainer}>
            <TouchableOpacity onPress={() => _pickImage(1)}>
              <ImageBackground source={{ uri: imgUrl1 }} style={[styles.vendorImage, imgUrl1 ? {borderWidth: 0}:{borderWidth: 1}]} imageStyle={{borderRadius: 20, borderWidth: 0}}>
                {!imgUrl1 && 
                <Icon name="plus" color="#C4C4C4" size={40} />
                }
                </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => _pickImage(2)}>
                <ImageBackground source={{ uri: imgUrl2 }} style={[styles.vendorImage, imgUrl2 ? {borderWidth: 0}:{borderWidth: 1}]} imageStyle={{borderRadius: 20}}>
                    {!imgUrl2 && 
                    <Icon name="plus" color="#C4C4C4" size={40} />
                    }
                </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => _pickImage(3)}>
                <ImageBackground source={{ uri: imgUrl3 }} style={[styles.vendorImage, imgUrl3 ? {borderWidth: 0}:{borderWidth: 1}]} imageStyle={{borderRadius: 20}}>
                    {!imgUrl3 && 
                    <Icon name="plus" color="#C4C4C4" size={40} />
                    }
                </ImageBackground>
            </TouchableOpacity>
          </View>
      <TouchableOpacity style={imgUrl1 && imgUrl2 && imgUrl3 ? (styles.button) : (styles.altButton)} onPress={() => signUp()}>
          <Text style={imgUrl1 && imgUrl2 && imgUrl3 ? (styles.buttonTitle) : (styles.altButtonTitle)}>NEXT →</Text>
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
      },
      eventImageContainer: {
        marginLeft: 30,
        width: 85,
        height: 85,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        backgroundColor: 'transparent',
        marginBottom: 30,
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
});
