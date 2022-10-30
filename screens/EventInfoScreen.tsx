import {
  StyleSheet,
  Linking,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  FlatList,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import { ref as ref_db, onValue, set, ref, remove, update, push } from 'firebase/database';
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
  const { eventID, month, startDay, endDay, location, year, imgUrl, name, following, instagram } = route.params;
  const [boothFollowed, setBoothFollowed] = useState(following);
  const [vendorList, setVendorList] = useState({});

  const [search, setSearch] = useState('');
  const [filteredVendors, setFilteredVendors]: any = useState([]);
  const [vendorArray, setVendorArray]: any = useState([]);

  const [starredFilter, setStarredFilter] = useState(false);

  const [vendorsFollowing, setVendorsFollowing]: any = useState([]);
  const [vendorsBlocked, setVendorsBlocked]: any = useState([]);

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
    if (Object.keys(vendorList).includes(auth?.currentUser?.uid!)) {
      setBoothing(true);
      console.log('boothing');
    } else {
      setBoothing(false);
    }
  }, [vendorList]);

  useEffect(() => {
    setRefreshing(true);
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
          // setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
          // setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }).sort((a: any, b: any) => {
          //   return a.boothNumber - b.boothNumber
          // }));
        })
      );
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    // const orderedData = query(
    //   ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'),
    //   orderByChild('boothNumber')
    // );
    setRefreshing(true);
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let vendorsFollowingTemp = { ...data2 };
      setVendorsFollowing(Object.keys(vendorsFollowingTemp));
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid + '/blocked'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let blockedTemp = { ...data2 };
      setVendorsBlocked(Object.keys(blockedTemp));
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref_db(db, '/users/' + auth.currentUser?.uid), (querySnapShot) => {
      let data3 = querySnapShot.val() || {};
      let userData = { ...data3 };
      setCurrentUser(userData);
      setRefreshing(false);
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
      if (Object.keys(vendorList).includes(auth?.currentUser?.uid!)) {
        setBoothing(true);
        console.log('boothing');
      } else {
        setBoothing(false);
      }
      getStarred(starredFilter);
      setRefreshing(false);
    });
  };

  const searchVendors = (text: string) => {
    console.log('search: ' + text);
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendors(
      vendorArray.filter((obj: any) => {
        return obj.name
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          .replace(/\s{2,}/g, ' ')
          .toLowerCase()
          .includes(text);
      })
    );
    console.log(
      'filtered: ',
      vendorArray.filter((obj: any) => {
        return obj.name
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          .replace(/\s{2,}/g, ' ')
          .toLowerCase()
          .includes(text);
      })
    );
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
      } else if (vendorsFollowing.includes(uid)) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
      } else {
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
    let blocked = false;
    if (!self) {
      name = filteredVendors[id as keyof typeof filteredVendors]['name' as keyof typeof filteredVendors];
      instagram = filteredVendors[id as keyof typeof filteredVendors]['instagram' as keyof typeof filteredVendors];
      uid = filteredVendors[id as keyof typeof filteredVendors]['uid' as keyof typeof filteredVendors];
      blocked = vendorsBlocked.includes(uid);
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

    if (!blocked) {
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
    }
    if (!self) {
      return (
        <View style={styles.eventDetailsContainer}>
          <View
            style={{
              flexDirection: 'row',
              width: Dimensions.get('window').width - 110,
              borderRadius: 20,
              backgroundColor: 'transparent',
              flex: 1,
              paddingHorizontal: 5,
              justifyContent: 'space-between',
              alignContent: 'center',
              marginHorizontal: 30,
              alignItems: 'center',
            }}
          >
            <Text style={styles.vendorName}>{name}</Text>
            <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
              {instagram && !blocked && (
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
              {!blocked && (
                <TouchableOpacity onPress={() => updateStarred(uid)}>
                  <Icon
                    name={vendorsFollowing.includes(uid) ? 'bookmark' : 'bookmark-o'}
                    size={25}
                    color="#575FCC"
                    style={{ marginRight: 20 }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Report Inappropriate Content',
                    'Reported content will be checked within 24 hours and removed if deemed inappropriate.',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Report',
                        onPress: () => {
                          update(ref(db, '/reportedUsers/'), {
                            [uid]: '',
                          });
                          Alert.alert(
                            'Reported successfully',
                            'We will review the content in 24 hours and remove it if inappropriate.'
                          );
                        },
                      },
                      {
                        text: blocked ? 'Unblock user' : 'Block User and Report',
                        onPress: !blocked
                          ? () => {
                              update(ref(db, '/reportedUsers/'), {
                                [uid]: '',
                              });
                              update(ref(db, '/users/' + auth?.currentUser?.uid + '/blocked'), {
                                [uid]: '',
                              });
                              Alert.alert(
                                'Reported and blocked successfully',
                                "We will review the content in 24 hours and remove it if inappropriate. You will no longer see this user's details."
                              );
                            }
                          : () => {
                              remove(ref(db, '/reportedUsers/' + uid));
                              remove(ref(db, '/users/' + auth?.currentUser?.uid + '/blocked/' + uid));
                              remove(ref(db, '/users/' + auth?.currentUser?.uid + '/vendorsFollowing/' + uid));
                              Alert.alert('Successfully unblocked.');
                            },
                      },
                    ]
                  )
                }
              >
                <Icon2 name={'report'} size={25} color="#D54826FF" />
              </TouchableOpacity>
            </View>
          </View>
          {blocked ? (
            <Text style={{ color: 'black', alignSelf: 'flex-start', marginLeft: 30, marginTop: 10 }}>
              Blocked! Click on the red icon to unblock.
            </Text>
          ) : (
            <View style={styles.eventImageContainer}>
              <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
              <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: Dimensions.get('window').width - 60,
            height: 170,
            backgroundColor: 'transparent',
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
              width: Dimensions.get('window').width - 110,
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
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SettingsScreen', {
                  instagram: currentUser.instagram,
                  type: currentUser.type,
                })
              }
            >
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
      date: '' + startDay + (month + 1) + year,
    });
  };

  const removeBoothFromEvent = () => {
    remove(ref(db, '/events/' + eventID + '/vendors/' + auth.currentUser?.uid));
    remove(ref(db, '/users/' + auth.currentUser?.uid + '/upcomingBooths/' + eventID));
    setBoothing(false);
    loadNewData();
  };

  const NotBoothing = () => {
    return (
      <TouchableOpacity style={styles.notBoothing} onPress={() => boothAtEvent()}>
        <Text style={{ fontWeight: '800', color: '#8FD8B5' }}>CLICK IF BOOTHING</Text>
      </TouchableOpacity>
    );
  };

  const Boothing = () => {
    return (
      <TouchableOpacity style={styles.boothing} onPress={() => removeBoothFromEvent()}>
        <Text style={{ fontWeight: '800', color: '#8FD8B5' }}>CLICK TO CANCEL BOOTH</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F3' }}>
      <View style={{ alignSelf: 'center', backgroundColor: 'transparent' }}>
        <FlatList
          contentContainerStyle={{ paddingBottom: 50, width: Dimensions.get('window').width }}
          showsVerticalScrollIndicator={false}
          data={Object.keys(filteredVendors)}
          renderItem={({ item }) => <VendorItem id={item} self={false} />}
          keyExtractor={(item) => filteredVendors[item]['uid' as keyof typeof filteredVendors]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
          ListEmptyComponent={() =>
            !starredFilter ? (
              <Text style={{ marginLeft: 30, paddingBottom: 15 }}>no creators yet!</Text>
            ) : !search ? (
              <Text style={{ marginLeft: 30, paddingBottom: 15 }}>no creators you follow are boothing here!</Text>
            ) : null
          }
          ListHeaderComponent={() => (
            <View style={{ flex: 1, backgroundColor: '#FFF8F3' }}>
              <View style={styles.image}>
                <ImageBackground
                  source={{ uri: imgUrl }}
                  style={{
                    flex: 1,
                    width: Dimensions.get('window').width,
                    height: undefined,
                  }}
                >
                  <SafeAreaView
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
                    }}
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
                    <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
                      {instagram && (
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
                            Linking.openURL('https://instagram.com/' + instagram).catch((err) => {
                              console.error('Failed opening page because: ', err);
                              alert('Failed to open page');
                            });
                          }}
                        >
                          <Icon name={'instagram'} size={25} color="#575FCC" />
                        </TouchableOpacity>
                      )}
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
                    </View>
                  </SafeAreaView>
                </ImageBackground>
              </View>
              <View style={styles.container}>
                <View
                  style={{
                    marginTop: 10,
                    marginLeft: 30,
                    width: Dimensions.get('window').width - 60,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text style={styles.date}>
                    {monthNames[month - 1]} {startDay}
                    {startDay != endDay && ' - ' + endDay}, {year}
                  </Text>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.location}>{location}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#565FCC',
                      borderRadius: 100,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 15,
                      marginTop: 15,
                    }}
                    onPress={() =>
                      Linking.openURL('https://instagram.com/buaytahansia').catch((err) => {
                        console.error('Failed opening page because: ', err);
                        alert('Failed to open page');
                      })
                    }
                  >
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>PERSONAL SHOPPER SERVICE</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'transparent',
                      alignContent: 'flex-end',
                      marginBottom: 10,
                      justifyContent: 'center',
                      alignSelf: 'center',
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
                </View>
              </View>
              <View
                style={{
                  backgroundColor: 'transparent',
                  width: Dimensions.get('window').width - 60,
                  alignSelf: 'center',
                }}
              >
                {currentUser.type === 'vendor' ? (
                  boothing ? (
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
                          height: 70,
                          alignItems: 'center',
                        }}
                      >
                        <Boothing />
                      </View>
                      <View
                        style={{
                          borderBottomLeftRadius: 20,
                          borderBottomRightRadius: 20,
                          borderWidth: 1,
                          borderColor: '#8FD8B5',
                          backgroundColor: 'white',
                          height: 180,
                          alignItems: 'center',
                        }}
                      >
                        <VendorItem id={auth.currentUser?.uid} self={true} />
                      </View>
                    </View>
                  ) : (
                    <NotBoothing />
                  )
                ) : (
                  <View></View>
                )}
              </View>
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
    backgroundColor: '#FFF8F3',
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
    width: Dimensions.get('window').width * 0.85,
  },
  location: {
    color: '#FABF48',
    fontSize: 16,
    fontWeight: '700',
    width: Dimensions.get('window').width * 0.85,
  },
  eventDetailsContainer: {
    width: Dimensions.get('window').width - 60,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    alignSelf: 'center',
    paddingVertical: 20,
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
    maxWidth: Dimensions.get('window').width - 240,
    backgroundColor: 'transparent',
    flexWrap: 'wrap',
    flex: 1,
  },
  vendorImage: {
    width: 85,
    height: 85,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  searchBar: {
    height: 40,
    width: (Dimensions.get('window').width - 60) * 0.83,
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
    width: Dimensions.get('window').width - 60,
    height: 45,
    marginVertical: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boothing: {
    borderRadius: 20,
    borderWidth: 1,
    width: Dimensions.get('window').width - 110,
    height: 45,
    marginTop: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
});
