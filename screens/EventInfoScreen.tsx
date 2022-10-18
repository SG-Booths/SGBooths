import { StyleSheet, ScrollView, Linking, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { ref as ref_db, onValue, query, orderByChild, set, ref, remove, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import { Text, View } from '../components/Themed';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import Image from 'react-native-image-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';

export default function EventInfoScreen({ route, navigation }: any) {
  const { user } = useAuthentication();
  const auth = getAuth();
  // TODO: add space bar + filter
  const { eventID, month, day, location, avail, imgUrl, name } = route.params;
  const [vendorList, setVendorList] = useState({});

  const [search, setSearch] = useState('');
  const [filteredVendors, setFilteredVendors] = useState({});
  const [vendorArray, setVendorArray]: any = useState({});

  const [starredFilter, setStarredFilter] = useState(false);

  const [vendorsFollowing, setVendorsFollowing]: any = useState([]);

  const [boothing, setBoothing] = useState(false)
  const [currentUser, setCurrentUser]: any = useState([])

  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  // applies the starred filter
  const applyStarredFilter = () => {
    // sets the new filter to the opposite of what it was previously
    const newStarredFilter = !starredFilter;
    console.log('new filter is ', newStarredFilter)
    setStarredFilter(newStarredFilter);

    // filters cards based on starred
    getStarred(newStarredFilter);
  };

  useEffect(() => {
    return onValue(ref_db(db, '/events/' + eventID + '/' + 'vendors'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorList = { ...data };

      Object.keys(vendorList).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };
          // let info = { ...data, boothNumber: vendorList[vendorKey]['boothNumber'] };
          let updatedValue = {};
          updatedValue = { [vendorKey]: info };
          setVendorList((vendorInfo) => ({ ...vendorInfo, ...updatedValue }));
          setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
            return item.uid != auth.currentUser?.uid
          }));
          setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
            return item.uid != auth.currentUser?.uid
          }));

          // setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
          // setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
        })
      );
    });
  }, []);

  useEffect(() => {
    console.log('use effect');
    // const orderedData = query(
    //   ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'),
    //   orderByChild('boothNumber')
    // );
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let vendorsFollowingTemp = { ...data2 };
      setVendorsFollowing(Object.keys(vendorsFollowingTemp));
    });
  }, []);

  useEffect(() => {
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid), (querySnapShot) => {
      let data3 = querySnapShot.val() || {};
      let userData = { ...data3 };
      setCurrentUser(userData);
    });
  }, []);

  const searchVendors = (text: string) => {
    console.log('filtered: ', filteredVendors);

    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendors(
      vendorArray.filter((obj: { name: string }) => {
        return (
          obj.name
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text)
            // ||
          // obj.boothNumber
          //   .toString()
          //   .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          //   .replace(/\s{2,}/g, ' ')
          //   .toLowerCase()
          //   .includes(text)
        );
      })
      // .sort((a: { boothNumber: number }, b: { boothNumber: number }) => {
      //   return a.boothNumber - b.boothNumber
      // })
    );
  };
  // TODO: delete booths after certain amount of time
  // TODO: when user goes from vendor to visitor account, delete their uid from people's vendorFollowing

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter) {
      setFilteredVendors(
        vendorArray.filter((obj: { name: string; uid: any }) => {
          return (
            obj.name
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .toLowerCase()
              .includes(search)
            //   ||
            // obj.boothNumber
            //   .toString()
            //   .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            //   .replace(/\s{2,}/g, ' ')
            //   .toLowerCase()
            //   .includes(search)
            &&
              vendorsFollowing.includes(obj.uid)
          );
        })
      );
    }
    // if starred is false, ignores the starred filter and only applies the search
    else {
      setFilteredVendors(vendorArray);
      searchVendors(search);
    }
  };

  // toggles a card's starred status
  const updateStarred = (uid: string) => {
    if (vendorsFollowing && vendorsFollowing.length > 0) {
      if (vendorsFollowing.includes(uid)) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
        getStarred(starredFilter);
      } else {
        update(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
          [uid]: '',
        });
        getStarred(starredFilter)
        // set(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + [eventItem['key']]),
        // {'sf': 0}
        // )
      }
    } else {
      console.log(vendorsFollowing.length);
      set(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
        [uid]: '',
      });
      getStarred(starredFilter);
    }
    // TODO: fix bug: when item is unstarred after star filter is already on
    // if (!eventItem['starred'] && starredFilter) {
    //   getStarred(starredFilter);
    //   console.log(cardArray);
    // }
  };

  const VendorItem = ({ eventID, id, self }: any) => {
    let name: string, instagram: string, uid: string | any;
    if (!self) {
      name = filteredVendors[id as keyof typeof filteredVendors]['name' as keyof typeof filteredVendors];
      instagram = filteredVendors[id as keyof typeof filteredVendors]['instagram' as keyof typeof filteredVendors];
      uid = filteredVendors[id as keyof typeof filteredVendors]['uid' as keyof typeof filteredVendors];
      // boothNumber = filteredVendors[id as keyof typeof filteredVendors]['boothNumber' as keyof typeof filteredVendors];
    }
    else {
      name = currentUser.name
      instagram = currentUser.instagram
      uid = auth.currentUser?.uid
    }

    const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
    const ref1 = ref_storage(storage, eventID + uid + '_1.png');

    const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
    const ref2 = ref_storage(storage, eventID + uid + '_2.png');

    const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
    const ref3 = ref_storage(storage, eventID + uid + '_3.png');

    getDownloadURL(ref1)
      .then((url) => {
        setImgUrl1(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    getDownloadURL(ref2)
      .then((url) => {
        setImgUrl2(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    getDownloadURL(ref3)
      .then((url) => {
        setImgUrl3(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

      if (!self) {
        return (
          <View style={styles.eventDetailsContainer}>
            <View
              style={{
                flexDirection: 'row',
                width: 300,
                borderRadius: 20,
                backgroundColor: 'transparent',
                flex: 1,
                maxHeight: 30,
                marginTop: 20,
                paddingHorizontal: 5,
                justifyContent: 'space-between',
                alignContent: 'center',
              }}
            >
              <Text style={styles.vendorName}>{name}</Text>
              <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
                {instagram && 
                  <Icon
                  name="instagram"
                  color="#575FCC"
                  size={25}
                  style={{ marginRight: 20 }}
                  onPress={() =>
                    Linking.openURL('https://instagram.com/' + instagram).catch((err) => {
                      console.error('Failed opening page because: ', err);
                      alert('Failed to open page');
                    })
                  }
                />
                }
                <Icon
                  name={vendorsFollowing.includes(uid) ? 'bookmark' : 'bookmark-o'}
                  size={25}
                  color="#575FCC"
                  onPress={() => updateStarred(uid)}
                />
              </View>
            </View>
            <View style={styles.eventImageContainer}>
              <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </View>
          </View>
        );
      }
      else {
        return (
          <View style={{
            width: 355,
            height: 170,
            backgroundColor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomColor: '#8FD8B5'
          }}>
            <View
              style={{
                flexDirection: 'row',
                width: 300,
                borderRadius: 20,
                backgroundColor: 'transparent',
                flex: 1,
                maxHeight: 30,
                marginTop: 20,
                paddingHorizontal: 5,
                justifyContent: 'space-between',
                alignContent: 'center',
              }}
            >
              <Text style={styles.vendorName}>{name}</Text>
              <Icon2
                  name="edit"
                  color="#575FCC"
                  size={25}
                  onPress={() =>
                    console.log('edit')
                    // TODO: navigate to settings
                  }
                />
            </View>
            <View style={styles.eventImageContainer}>
              <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </View>
          </View>
        )
      }
    
  };

  const boothAtEvent = () => {
    setBoothing(true);
    update(ref(db, '/events/' + eventID + '/' + 'vendors/' + auth.currentUser?.uid), {
      boothNumber: 0,
    });
  }

  const removeBoothFromEvent = () => {
    setBoothing(false);
    remove(ref(db, '/events/' + eventID + '/' + 'vendors/' + auth.currentUser?.uid));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F3' }}>
      <View style={styles.image}>
        <Image
          source={{ uri: imgUrl }}
          style={{
            flex: 1,
            width: undefined,
            height: undefined,
          }}
        />
      </View>
      <ScrollView
          style={styles.eventList}
          contentContainerStyle={styles.contentContainerStyle}
          directionalLockEnabled={true}
          horizontal={false}
        >
      <View style={styles.container}>
        <Text style={styles.date}>
          {monthNames[month]} {day}
        </Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
        {/* TODO: only show if current user is a creator */}
        
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent', alignContent: 'flex-end' }}>
          <TextInput
            style={styles.searchBar}
            value={search}
            placeholder="search by creator..."
            underlineColorAndroid="transparent"
            onChangeText={(text) => searchVendors(text)}
            textAlign="left"
            placeholderTextColor="#C4C4C4"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.savedButton} onPress={() => applyStarredFilter()}>
            <Icon
              name={starredFilter ? 'bookmark' : 'bookmark-o'}
              size={20}
              color="#FFFFFF"
              style={{ alignSelf: 'center' }}
            />
          </TouchableOpacity>
        </View>
        {
          boothing ?
          <View style={{borderRadius: 20, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'transparent', height: 240, marginVertical: 20}}>
            <View style={{borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#8FD8B5', marginTop: -2, height: 70, alignItems: 'center'}}>
              <TouchableOpacity style={styles.boothing} onPress={() => removeBoothFromEvent()}>
              <Text style={{fontWeight:'800', color: '#8FD8B5'}}>BOOTHING</Text>
              </TouchableOpacity>
            </View>
            <View style={{borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderWidth: 2, borderColor: '#8FD8B5', backgroundColor: 'white', marginTop: -2, height: 180, alignItems: 'center'}}>
              <VendorItem eventID={eventID} id={auth.currentUser?.uid} self={true}/>
            </View>
          </View>
          :
          <TouchableOpacity style={styles.notBoothing} onPress={() => boothAtEvent()}>
            <Text style={{fontWeight:'800', color: '#8FD8B5'}}>NOT BOOTHING</Text>
          </TouchableOpacity>
        }
          {Object.keys(filteredVendors).map((vendorKey: any) => (
            <View key={vendorKey} style={{ backgroundColor: '#FFfF8F3' }}>
              <VendorItem eventID={eventID} id={vendorKey} self={false}/>
            </View>
          ))}
                </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 40,
    marginLeft: 30,
    backgroundColor: '#FFF8F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    height: 200,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2A3242',
  },
  name: {
    fontSize: 40,
    color: '#575FCC',
    fontWeight: '500',
    marginBottom: 10,
  },
  location: {
    color: '#FABF48',
    fontSize: 16,
    fontWeight: '700',
  },
  eventDetailsContainer: {
    width: 360,
    height: 170,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#C4C4C4',
  },
  contentContainerStyle: {},
  eventList: {
    marginTop: 20,
  },
  eventImageContainer: {
    width: 85,
    height: 85,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'white',
  },
  vendorName: {
    fontSize: 16,
    color: '#2A3242',
    fontWeight: '500',
    alignSelf: 'center',
  },
  vendorImage: {
    width: 85,
    height: 85,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  searchBar: {
    height: 40,
    width: 300,
    borderRadius: 20,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
  },
  savedButton: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 40,
    height: 40,
    marginLeft: 20,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  notBoothing: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8FD8B5',
    width: 360,
    height: 45,
    marginVertical: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  boothing: {
    borderRadius: 20,
    borderWidth: 2,
    width: 320,
    height: 45,
    marginTop: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent'
  },
});
