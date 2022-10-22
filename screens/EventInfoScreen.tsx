import {
  StyleSheet,
  Linking,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  FlatList,
  RefreshControl
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import { ref as ref_db, onValue, set, ref, remove, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import { Text, View } from '../components/Themed';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import Image from 'react-native-image-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';

export default function EventInfoScreen({ route, navigation }: any) {
  const [refreshing, setRefreshing] = useState(true);
  const { user } = useAuthentication();
  const auth = getAuth();
  const { eventID, month, day, location, year, imgUrl, name, following } = route.params;
  const [boothFollowed, setBoothFollowed] = useState(following);
  const [vendorList, setVendorList] = useState({});

  const [search, setSearch] = useState('');
  const [filteredVendors, setFilteredVendors]: any = useState([]);
  const [vendorArray, setVendorArray]: any = useState([]);

  const [starredFilter, setStarredFilter] = useState(false);

  const [vendorsFollowing, setVendorsFollowing]: any = useState([]);

  const [boothing, setBoothing] = useState(false);
  const [currentUser, setCurrentUser]: any = useState([]);

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
    console.log('new filter is ', newStarredFilter);
    setStarredFilter(newStarredFilter);

    // filters cards based on starred
    getStarred(newStarredFilter);
  };

  useMemo(() => {
    if (Object.keys(vendorList).includes(user?.uid!)) {
      setBoothing(true);
      console.log('boothing');
    } else {
      console.log(Object.keys(vendorList));
    }
  }, [vendorList]);

  useEffect(() => {
    return onValue(ref_db(db, '/events/' + eventID + '/vendors'), async (querySnapShot) => {
      let data = (await querySnapShot.val()) || {};
      let vendorList = { ...data };

      setVendorList({});
      setVendorArray([]);
      setFilteredVendors([]);

      Object.keys(vendorList).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };
          // let info = { ...data, boothNumber: vendorList[vendorKey]['boothNumber'] };

          if (info.type === 'visitor' || !info) {
            remove(ref(db, '/events/' + eventID + '/vendors/' + vendorKey));
          } else {
            let updatedValue = { [vendorKey]: info };
            setVendorList((vendorInfo) => ({ ...vendorInfo, ...updatedValue }));
            setVendorArray((vendorInfo: any) =>
              Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
                return item.uid != auth.currentUser?.uid;
              })
            );
            setFilteredVendors((vendorInfo: any) =>
              Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
                return item.uid != auth.currentUser?.uid;
              })
            );
          }
          // setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
          // setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
        })
      );
      setRefreshing(false)
    });
  }, []);

  useEffect(() => {
    // const orderedData = query(
    //   ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'),
    //   orderByChild('boothNumber')
    // );
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let vendorsFollowingTemp = { ...data2 };
      setVendorsFollowing(Object.keys(vendorsFollowingTemp));
      setRefreshing(false)
    });
  }, []);

  useEffect(() => {
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid), (querySnapShot) => {
      let data3 = querySnapShot.val() || {};
      let userData = { ...data3 };
      setCurrentUser(userData);
      setRefreshing(false)
    });
  }, []);

  const loadNewData = () => {
    return onValue(ref_db(db, '/events/' + eventID + '/vendors'), async (querySnapShot) => {
      let data = (await querySnapShot.val()) || {};
      let vendorList = { ...data };

      setVendorList({});
      setVendorArray([]);
      setFilteredVendors([]);

      Object.keys(vendorList).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };
          // let info = { ...data, boothNumber: vendorList[vendorKey]['boothNumber'] };

          if (info.type === 'visitor' || !info) {
            remove(ref(db, '/events/' + eventID + '/vendors/' + vendorKey));
          } else {
            let updatedValue = { [vendorKey]: info };
            setVendorList((vendorInfo) => ({ ...vendorInfo, ...updatedValue }));
            setVendorArray((vendorInfo: any) =>
              Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
                return item.uid != auth.currentUser?.uid;
              })
            );
            setFilteredVendors((vendorInfo: any) =>
              Object.values({ ...vendorInfo, ...updatedValue }).filter((item: any) => {
                return item.uid != auth.currentUser?.uid;
              })
            );
          }
          // setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
          // setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
        })
      );
      setRefreshing(false)
    });
  }

  const searchVendors = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    if (text.replace(/ /g, '')) {
      setFilteredVendors(
        vendorArray.filter((obj: { name: string }) => {
          return obj.name
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text);
          // ||
          // obj.boothNumber
          //   .toString()
          //   .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          //   .replace(/\s{2,}/g, ' ')
          //   .toLowerCase()
          //   .includes(text)
        })
        // .sort((a: { boothNumber: number }, b: { boothNumber: number }) => {
        //   return a.boothNumber - b.boothNumber
        // })
      );
    }
  };

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
              .includes(search) &&
            //   ||
            // obj.boothNumber
            //   .toString()
            //   .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            //   .replace(/\s{2,}/g, ' ')
            //   .toLowerCase()
            //   .includes(search)
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
      if (vendorsFollowing.includes(uid) && starredFilter === true) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
        getStarred(starredFilter);
        setVendorsFollowing(
          vendorsFollowing.filter((obj: string) => {
            return !(obj === uid);
          })
        );
        setFilteredVendors(
          filteredVendors.filter((obj: any) => {
            return !(obj.uid === uid);
          })
        );
      } 
      else if (vendorsFollowing.includes(uid)) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
      }
      else {
        update(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
          [uid]: '',
        });
        getStarred(starredFilter);
      }
    } else {
      console.log(vendorsFollowing.length);
      set(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
        [uid]: '',
      });
      getStarred(starredFilter);
    }
  };

  const VendorItem = ({ id, self }: any) => {
    let name: string, instagram: string, uid: string | any;
    if (!self) {
      name = filteredVendors[id as keyof typeof filteredVendors]['name' as keyof typeof filteredVendors];
      instagram = filteredVendors[id as keyof typeof filteredVendors]['instagram' as keyof typeof filteredVendors];
      uid = filteredVendors[id as keyof typeof filteredVendors]['uid' as keyof typeof filteredVendors];
      // boothNumber = filteredVendors[id as keyof typeof filteredVendors]['boothNumber' as keyof typeof filteredVendors];
    } else {
      name = currentUser.name;
      instagram = currentUser.instagram;
      uid = auth.currentUser?.uid;
    }

    const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
    const ref1 = ref_storage(storage, uid + '_1.png');

    const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
    const ref2 = ref_storage(storage, uid + '_2.png');

    const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
    const ref3 = ref_storage(storage, uid + '_3.png');

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
              {instagram && (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://instagram.com/' + instagram).catch((err) => {
                      console.error('Failed opening page because: ', err);
                      alert('Failed to open page');
                    })
                  }
                >
                  <Icon name="instagram" color="#575FCC" size={25} style={{ marginRight: 20 }} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => updateStarred(uid)}>
                <Icon name={vendorsFollowing.includes(uid) ? 'bookmark' : 'bookmark-o'} size={25} color="#575FCC" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.eventImageContainer}>
            <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
          </View>
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: 355,
            height: 170,
            backgroundColor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomColor: '#8FD8B5',
          }}
        >
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
            <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen', {
              instagram: currentUser.instagram,
              type: currentUser.type,
            })}>
              <Icon2 name="edit" color="#575FCC" size={25} />
            </TouchableOpacity>
          </View>
          <View style={styles.eventImageContainer}>
            <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
          </View>
        </View>
      );
    }
  };

  const boothAtEvent = () => {
    setBoothing(true);
    update(ref(db, '/events/' + eventID + '/vendors/' + auth.currentUser?.uid), {
      boothNumber: 0,
    });
    update(ref(db, '/users/' + auth.currentUser?.uid + '/upcomingBooths/' + eventID), {
      eventID: eventID,
      [eventID]: '' + day + (month + 1) + year,
    });
  };

  const removeBoothFromEvent = () => {
    setBoothing(false);
    remove(ref(db, '/events/' + eventID + '/vendors/' + auth.currentUser?.uid));
    remove(ref(db, '/users/' + auth.currentUser?.uid + '/upcomingBooths/' + eventID));
  };

  const NotBoothing = () => {
    return(
      <TouchableOpacity style={styles.notBoothing} onPress={() => boothAtEvent()}>
        <Text style={{ fontWeight: '800', color: '#8FD8B5' }}>CLICK IF BOOTHING</Text>
      </TouchableOpacity>
    )
  }

  const Boothing = () => {
    return(
      <TouchableOpacity style={styles.boothing} onPress={() => removeBoothFromEvent()}>
        <Text style={{ fontWeight: '800', color: '#8FD8B5' }}>CLICK TO CANCEL BOOTH</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F3' }}>
      <View style={styles.image}>
        <ImageBackground
          source={{ uri: imgUrl }}
          style={{
            flex: 1,
            width: undefined,
            height: undefined,
          }}
        >
          <SafeAreaView
            style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#FFF8F3',
                borderRadius: 100,
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 15,
              }}
              onPress={() => navigation.goBack()}
            >
              <Icon2 name="keyboard-arrow-left" size={30} color="#2A3242" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderRadius: 100,
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 15,
              }}
              onPress={() => {
                if (boothFollowed) {
                  remove(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/' + eventID));
                  setBoothFollowed(false);
                } else {
                  update(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/'), {
                    [eventID]: '',
                  });
                  setBoothFollowed(true);
                }
              }}
            >
              <Icon name={boothFollowed ? 'bookmark' : 'bookmark-o'} size={25} color="#575FCC" />
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <View style={styles.container}>
        <FlatList
          style={styles.eventList}
          showsVerticalScrollIndicator={false}
          data={Object.keys(filteredVendors)}
          renderItem={({ item }) => <VendorItem id={item} self={false} />}
          keyExtractor={(item) => filteredVendors[item]['uid' as keyof typeof filteredVendors]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
          ListEmptyComponent={() => <Text>no creators yet!</Text>}
          ListHeaderComponent={(item) => (
            <View style={{ backgroundColor: 'transparent' }}>
              <Text style={styles.date}>
                {monthNames[month - 1]} {day}, {year}
              </Text>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.location}>{location}</Text>

              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                  alignContent: 'flex-end',
                  marginBottom: 10,
                }}
              >
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
              {currentUser.type === 'vendor' && 
                 (boothing ? (
                  <View
                    style={{
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: 'transparent',
                      backgroundColor: 'transparent',
                      height: 240,
                      marginVertical: 20,
                    }}
                  >
                    <View
                      style={{
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderWidth: 1,
                        borderColor: 'transparent',
                        backgroundColor: '#8FD8B5',
                        marginTop: -2,
                        height: 70,
                        alignItems: 'center',
                      }}
                    >
                      <Boothing/>
                    </View>
                    <View
                      style={{
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                        borderWidth: 1,
                        borderColor: '#8FD8B5',
                        backgroundColor: 'white',
                        marginTop: -2,
                        height: 180,
                        alignItems: 'center',
                      }}
                    >
                      <VendorItem id={auth.currentUser?.uid} self={true} />
                    </View>
                  </View>
                ) : (
                  <NotBoothing/>
                ))
              }
            </View>
          )}
        />
      </View>
    </View>
  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 10,
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
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  contentContainerStyle: {},
  eventList: {
    marginTop: 20,
    marginBottom: 40,
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
    borderWidth: 1,
    borderColor: '#C4C4C4',
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
    borderWidth: 1,
    borderColor: '#8FD8B5',
    width: 360,
    height: 45,
    marginVertical: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boothing: {
    borderRadius: 20,
    borderWidth: 1,
    width: 320,
    height: 45,
    marginTop: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
});
