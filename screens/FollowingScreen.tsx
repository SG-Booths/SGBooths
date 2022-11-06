import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TextInput,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, View } from '../components/Themed';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref as ref_db, onValue, ref, remove, update, set } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import Image from 'react-native-image-progress';

export default function FollowingScreen({ route, navigation }: any) {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [vendorsFollowing, setVendorsFollowing]: any = useState([]);
  const [vendorsBlocked, setVendorsBlocked]: any = useState([]);

  const [vendorArray, setVendorArray]: any = useState([]);
  const [filteredVendorArray, setFilteredVendorArray]: any = useState([]);
  const [search, setSearch] = useState('');
  const [events, setEvents]: any = useState({});
  const [refreshing, setRefreshing] = useState(true);

  const [starredFilter, setStarredFilter] = useState(false);
  const [loaded, setLoaded] = useState(false)
  const [newRender, setNewRender] = useState(false)

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  // applies the starred filter
  const applyStarredFilter = () => {
    // sets the new filter to the opposite of what it was previously
    const newStarredFilter = !starredFilter;
    console.log('new filter is ', newStarredFilter);
    setStarredFilter(newStarredFilter);

    // filters cards based on starred
    getStarred(newStarredFilter);
  };

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter) {
      console.log('getting starred')
      console.log('following right now:', vendorsFollowing)
      setFilteredVendorArray(
        vendorArray.filter((obj: any) => {
          return (
            obj.name
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .toLowerCase()
              .includes(search) &&
            vendorsFollowing.includes(obj.uid)
          );
        }).sort((a: any, b: any) => b.referrals - a.referrals)
      );
      setNewRender(!newRender)
    }
    // if starred is false, ignores the starred filter and only applies the search
    else {
      console.log('vendors following', vendorsFollowing)
      setFilteredVendorArray(vendorArray);
      searchVendors(search);
      setNewRender(!newRender)
    }
  };

  // toggles a card's starred status
  const updateStarred = (uid: string, following: boolean) => {
    console.log('updating starred');
    if (vendorsFollowing && vendorsFollowing.length > 0) {
      console.log('following:', following)
      if (following && starredFilter === true) {
        console.log('unfollowing')
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
        getStarred(starredFilter);
        setFilteredVendorArray(
          filteredVendorArray.filter((obj: any) => {
            return !(obj.uid === uid) && obj.type === 'vendor';
          }).sort((a: any, b: any) => (a.referrals && b.referrals) && b.referrals - a.referrals)
        );
        vendorsFollowing &&
        setVendorsFollowing(
          vendorsFollowing.filter((obj: any) => {
            return !(obj.uid === uid);
          })
        );
      } else if (following) {
        console.log('unfollowing')
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
        setFilteredVendorArray(
          filteredVendorArray.filter((obj: any) => {
            return !(obj.uid === uid) && obj.type === 'vendor';
          }).sort((a: any, b: any) => b.referrals - a.referrals)
        );
        vendorsFollowing &&
        setVendorsFollowing(
          vendorsFollowing.filter((obj: any) => {
            return !(obj.uid === uid);
          })
        );
      } else {
        update(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
          [uid]: '',
        });
        let newArray = [...filteredVendorArray, uid]
        newArray &&
        setVendorsFollowing(
          newArray.sort((a: any, b: any) => b.referrals - a.referrals)
        );
        getStarred(starredFilter);
      }
    } else {
      set(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
        [uid]: '',
      });
      setFilteredVendorArray(
        {...filteredVendorArray, uid}.sort((a: any, b: any) => b.referrals - a.referrals)
      );
      let newArray = [...filteredVendorArray, uid]
      newArray &&
      setVendorsFollowing(
        newArray.sort((a: any, b: any) => b.referrals - a.referrals)
      );
      getStarred(starredFilter);
    }
    if (!following && search != '') {
      setNewRender(!newRender)
    }
  };

  const loadNewData = () => {
    setRefreshing(true);
    onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);
    });

      onValue(ref(db, '/users'), (querySnapShot) => {
        let data = querySnapShot.val() || {};
        let vendorList = { ...data };
        let newArray: any = Object.values(vendorList).filter((a: any) => {
          return a.type === 'vendor' && a.uid != auth?.currentUser?.uid;
        }).sort((a: any, b: any) => b.referrals - a.referrals);
        let currentUser: any = Object.values(vendorList).filter((a: any) => {
          return a.uid === auth?.currentUser?.uid;
        });
  
        currentUser[0].vendorsFollowing && setVendorsFollowing(Object.keys(currentUser[0].vendorsFollowing))
        setVendorArray(newArray);
        setFilteredVendorArray(newArray);
      });
    getStarred(starredFilter);
    setRefreshing(false);
    setNewRender(!newRender)
  };

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);
      setRefreshing(false);
    });
  }, []);

  // useEffect(() => {
  //   setRefreshing(true);
  //   return onValue(ref(db, '/users/' + auth?.currentUser?.uid + '/vendorsFollowing'), async (querySnapShot) => {
  //     let data = (await querySnapShot.val()) || {};
  //     let vendorData = { ...data };
  //     setVendorsFollowing(Object.keys(vendorData))
  //     setRefreshing(false);
  //   });
  // }, []);

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref(db, '/users'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorList = { ...data };
      let newArray: any = Object.values(vendorList).filter((a: any) => {
        return a.type === 'vendor' && a.uid != auth?.currentUser?.uid;
      });
      newArray = newArray.sort((a: any, b: any) => b.referrals - a.referrals)
      setVendorArray(newArray);
      setFilteredVendorArray(newArray);
      setRefreshing(false);

      setRefreshing(true);

      let currentUser: any = Object.values(vendorList).filter((a: any) => {
        return a.uid === auth?.currentUser?.uid;
      });

      currentUser[0].vendorsFollowing && setVendorsFollowing(Object.keys(currentUser[0].vendorsFollowing))
      currentUser[0].blocked && setVendorsBlocked(Object.keys(currentUser[0].blocked));
      setRefreshing(false);
      setLoaded(true)
    });
  }, []);

  const searchVendors = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendorArray(
      vendorArray.filter((obj: any) => {
        return obj.name
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          .replace(/\s{2,}/g, ' ')
          .toLowerCase()
          .includes(text);
      }).sort((a: any, b: any) => b.referrals - a.referrals)
    );
    
    if (text === '') {
      setFilteredVendorArray(
        vendorArray.sort((a: any, b: any) => b.referrals - a.referrals)
      );
      setNewRender(!newRender)
    }
  };

  const getImgUrl = (key: any, boothKey: any) => {
    const ref = ref_storage(storage, key + '.png');

    getDownloadURL(ref)
      .then((url) => {
        navigation.navigate('EventInfoScreen', {
          imgUrl: url,
          eventID: events[boothKey.eventID as keyof typeof events]['key'],
          month: events[boothKey.eventID as keyof typeof events]['date']['month'],
          startDay: events[boothKey.eventID as keyof typeof events]['date']['startDay'],
          endDay: events[boothKey.eventID as keyof typeof events]['date']['endDay'],
          location: events[boothKey.eventID as keyof typeof events]['location'],
          avail: events[boothKey.eventID as keyof typeof events]['avail'],
          name: events[boothKey.eventID as keyof typeof events]['name'],
          year: events[boothKey.eventID as keyof typeof events]['date']['year'],
          instagram: events[boothKey.eventID as keyof typeof events]['instagram'],
          time: events[boothKey.eventID as keyof typeof events]['time']
        });
      })
      .catch((error) => {
        console.log('error:' + error);
      });
  };

  const VendorItem = React.memo(({ vendor }: any) => {
    // console.log('vendor', vendor)
    let blocked = vendorsBlocked.includes(vendor.uid);
    const [following, setFollowing] = useState(vendorsFollowing.includes(vendor.uid));

    const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
    const ref1 = ref_storage(storage, vendor.uid + '_1.png');

    const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
    const ref2 = ref_storage(storage, vendor.uid + '_2.png');

    const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
    const ref3 = ref_storage(storage, vendor.uid + '_3.png');

    if (!blocked) {
      getDownloadURL(ref1)
        .then((url) => {
          setImgUrl1(url);
        })
        .catch((error) => {
        });

      getDownloadURL(ref2)
        .then((url) => {
          setImgUrl2(url);
        })
        .catch((error) => {
        });

      getDownloadURL(ref3)
        .then((url) => {
          setImgUrl3(url);
        })
        .catch((error) => {
        });
    }
    return (
      <View style={styles.eventDetailsContainer}>
        <View
          style={{
            flexDirection: 'row',
            width: Dimensions.get('window').width - 100,
            borderRadius: 20,
            backgroundColor: 'transparent',
            flex: 1,
            marginTop: 20,
            justifyContent: 'space-between',
            alignContent: 'center',
          }}
        >
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              marginBottom: (imgUrl1 || imgUrl2 || imgUrl3) && 5,
            }}
          >
            {vendor.instagram && !blocked && (
              <TouchableOpacity
                style={{ marginRight: 20 }}
                onPress={() =>
                  Linking.openURL('https://instagram.com/' + vendor.instagram).catch((err) => {
                    console.error('Failed opening page because: ', err);
                    alert('Failed to open page');
                  })
                }
              >
                <Icon name="instagram" color="white" size={25} />
              </TouchableOpacity>
            )}
            {!blocked && (
              <TouchableOpacity style={{ marginRight: 20 }} onPress={() => {
                following ? setFollowing(false) : setFollowing(true)
                updateStarred(vendor.uid, following)
                }}>
                <Icon
                  name={following ? 'bookmark' : 'bookmark-o'}
                  size={25}
                  color="white"
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
                          [vendor.uid]: '',
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
                              [vendor.uid]: '',
                            });
                            update(ref(db, '/users/' + auth?.currentUser?.uid + '/blocked'), {
                              [vendor.uid]: '',
                            });
                            Alert.alert(
                              'Reported and blocked successfully',
                              "We will review the content in 24 hours and remove it if inappropriate. You will no longer see this user's details."
                            );
                          }
                        : () => {
                            remove(ref(db, '/reportedUsers/' + vendor.uid));
                            remove(ref(db, '/users/' + auth?.currentUser?.uid + '/blocked/' + vendor.uid));
                            remove(ref(db, '/users/' + auth?.currentUser?.uid + '/vendorsFollowing/' + vendor.uid));
                            Alert.alert('Successfully unblocked.');
                          },
                    },
                  ]
                )
              }
            >
              <Icon2 name={'report'} size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.eventImageContainer, { marginVertical: (imgUrl1 || imgUrl2 || imgUrl3) && 5 }]}>
          {imgUrl1 && <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />}
          {imgUrl2 && <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />}
          {imgUrl3 && <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />}
        </View>
        <View
          style={{
            backgroundColor: 'white',
            width: Dimensions.get('window').width - 60,
            marginTop: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            flex: 1,
            borderWidth: 1,
            borderColor: '#C4C4C4',
            paddingBottom: 20,
          }}
        >
          {blocked ? (
            <Text style={{ color: 'black', alignSelf: 'flex-start', marginLeft: 30, marginTop: 15 }}>
              Blocked! Click on the icon to unblock.
            </Text>
          ) : (
            <View style={{ backgroundColor: 'transparent' }}>
              <Text
                style={{ color: '#2A3242', alignSelf: 'flex-start', marginLeft: 20, fontWeight: '700', marginTop: 15 }}
              >
                NEXT BOOTHS
              </Text>
              {vendor.upcomingBooths ? (
                Object.values(vendor.upcomingBooths)
                  .sort((a: any, b: any) => {
                    return a.date - b.date;
                  })
                  .map((boothKey: any) => (
                    <TouchableOpacity
                      key={vendor.uid + boothKey.eventID}
                      style={{
                        flexDirection: 'row',
                        backgroundColor: 'transparent',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: 340,
                        marginLeft: 5,
                      }}
                      onPress={() => getImgUrl(events[boothKey.eventID as keyof typeof events]['key'], boothKey)}
                    >
                      <Text style={{ color: '#2A3242', marginLeft: 15, marginTop: 10 }}>
                        {monthNames[events[boothKey.eventID as keyof typeof events]['date']['month'] - 1]}{' '}
                        {events[boothKey.eventID as keyof typeof events]['date']['startDay']}{' '}
                        {events[boothKey.eventID as keyof typeof events]['date']['startDay'] !=
                          events[boothKey.eventID as keyof typeof events]['date']['endDay'] &&
                          '- ' + events[boothKey.eventID as keyof typeof events]['date']['endDay'] + ' '}
                        @ {events[boothKey.eventID as keyof typeof events]['name']}
                      </Text>
                      <Icon2 name="keyboard-arrow-right" size={20} color="#2A3242" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                  ))
              ) : (
                <Text style={{ color: '#2A3242', marginTop: 10, fontWeight: '400', marginLeft: 20 }}>
                  no upcoming booths...
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }, (prevProps, nextProps) => {
    // if (vendorsFollowing.includes(prevProps.vendor.uid) === vendorsFollowing.includes(nextProps.vendor.uid)) return true;
    if (prevProps === nextProps) return true;
    return false;
  });

  const renderItemFn = useCallback((item: any) => (
    // console.log('item is', filteredVendorArray[item])
    <VendorItem vendor={filteredVendorArray[item]} />
    ), [loaded, newRender])

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 30, backgroundColor: 'transparent' }}>
        <Text style={styles.title}>creators</Text>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'transparent',
            alignContent: 'flex-end',
            marginBottom: 10,
            alignSelf: 'center',
          }}
        >
          <TextInput
            style={styles.searchBar}
            value={search}
            placeholder="search by creator..."
            underlineColorAndroid="transparent"
            onChangeText={(text) => {setNewRender(!newRender); searchVendors(text)}}
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
        {refreshing ? <ActivityIndicator /> : null}
        { loaded && 
        <View style={{ backgroundColor: 'transparent', alignSelf: 'center' }}>
          <FlatList
            initialNumToRender={7}
            contentContainerStyle={{ paddingBottom: 325 }}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 10 }}
            data={Object.keys(filteredVendorArray)}
            keyExtractor={(item) => filteredVendorArray[item].uid}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
            renderItem={({ item }) => renderItemFn(item)}
            ListEmptyComponent={() =>
              search ? null : (
                <Text style={{ marginTop: 10, marginLeft: 10, color: '#2A3242', height: 500 }}>
                  you haven't saved any creators!
                </Text>
              )
            }
          />
        </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  title: {
    alignSelf: 'flex-start',
    marginTop: 30,
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
  searchBar: {
    height: 40,
    width: (Dimensions.get('window').width - 60) * 0.85,
    borderRadius: 20,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  eventDetailsContainer: {
    width: Dimensions.get('window').width - 60,
    flex: 1,
    backgroundColor: '#575FCC',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#C4C4C4',
    marginBottom: 20
  },
  vendorName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    alignSelf: 'center',
    width: Dimensions.get('window').width - 220,
    backgroundColor: 'transparent',
    flexShrink: 1,
    flexWrap: 'wrap',
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
  eventImageContainer: {
    maxWidth: 85,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  vendorImage: {
    width: 90,
    height: 90,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});
