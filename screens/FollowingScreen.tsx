import React, { useState, useEffect, useRef } from 'react';
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

const FollowingScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [vendorsFollowing, setVendorsFollowing]: any = useState([]);
  const [vendorArray, setVendorArray]: any = useState([]);
  const [filteredVendorArray, setFilteredVendorArray]: any = useState([]);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState({});
  const [refreshing, setRefreshing] = useState(true);

  const [starredFilter, setStarredFilter] = useState(false);

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  let imgUrl: any = useRef();

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
      setFilteredVendorArray(
        vendorArray.filter((obj: any) => {
          return (
            (obj.name
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .toLowerCase()
              .includes(search) ||
              obj.instagram
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .replace(/\s{2,}/g, ' ')
                .toLowerCase()
                .includes(search)) &&
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
      setFilteredVendorArray(vendorArray);
      searchVendors(search);
    }
  };

  // toggles a card's starred status
  const updateStarred = (uid: string) => {
    console.log('updating starred');
    loadNewData();
    if (vendorsFollowing && vendorsFollowing.length > 0) {
      if (vendorsFollowing.includes(uid) && starredFilter === true) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
        getStarred(starredFilter);
        setVendorsFollowing(
          vendorsFollowing.filter((obj: string) => {
            return !(obj === uid);
          })
        );
        setFilteredVendorArray(
          filteredVendorArray.filter((obj: any) => {
            return !(obj.uid === uid) && obj.type === 'vendor';
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

  const loadNewData = () => {
    setRefreshing(true);
    onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);

      onValue(ref(db, '/users/' + auth?.currentUser?.uid + '/vendorsFollowing'), (querySnapShot) => {
        let data = querySnapShot.val() || {};
        let vendorsFollowing = { ...data };
        setVendorsFollowing(Object.keys(vendorsFollowing));
        console.log('vendors following:', Object.keys(vendorsFollowing));

        onValue(ref(db, '/users'), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let vendorList = { ...data };
          let newArray: any = Object.values(vendorList).filter((a: any) => {
            return a.type === 'vendor' && a.uid != auth?.currentUser?.uid;
          });
          console.log('all vendors:', newArray);
          setVendorArray(newArray);
          setFilteredVendorArray(newArray);
        });
      });
    });
    getStarred(starredFilter);
    setRefreshing(false);
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

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref(db, '/users/' + auth?.currentUser?.uid + '/vendorsFollowing'), async (querySnapShot) => {
      let data = (await querySnapShot.val()) || {};
      let vendorData = { ...data };
      setVendorsFollowing(Object.keys(vendorData));
      console.log('vendors following:', Object.keys(vendorData));
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    setRefreshing(true);
    return onValue(ref(db, '/users'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorList = { ...data };
      let newArray: any = Object.values(vendorList).filter((a: any) => {
        return a.type === 'vendor' && a.uid != auth?.currentUser?.uid;
      });
      console.log('all vendors:', newArray);
      setVendorArray(newArray);
      setFilteredVendorArray(newArray);
      setRefreshing(false);
    });
  }, []);

  const searchVendors = (text: string) => {
    console.log('filtered: ', vendorArray);

    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendorArray(
      vendorArray.filter((obj: any) => {
        return (
          obj.name
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text) ||
          obj.instagram
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text)
        );
      })
    );
  };

  const getImgUrl = (key: any, boothKey: any) => {
    const ref = ref_storage(storage, key + '.png');

    getDownloadURL(ref)
      .then((url) => {
        navigation.navigate('EventInfoScreen', {
          imgUrl: url,
          eventID: events[boothKey.eventID as keyof typeof events]['key'],
          month: events[boothKey.eventID as keyof typeof events]['date']['month'],
          day: events[boothKey.eventID as keyof typeof events]['date']['day'],
          location: events[boothKey.eventID as keyof typeof events]['location'],
          avail: events[boothKey.eventID as keyof typeof events]['avail'],
          name: events[boothKey.eventID as keyof typeof events]['name'],
        });
      })
      .catch((error) => {
        console.log('error:' + error);
      });
  };

  const VendorItem = ({ vendor }: any) => {
    return (
      <View style={styles.eventDetailsContainer}>
        <View
          style={{
            flexDirection: 'row',
            width: 320,
            borderRadius: 20,
            backgroundColor: 'transparent',
            flex: 1,
            maxHeight: 30,
            marginTop: 20,
            justifyContent: 'space-between',
            paddingHorizontal: 5,
          }}
        >
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
            {vendor.instagram && (
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
            <TouchableOpacity onPress={() => updateStarred(vendor.uid)}>
              <Icon name={vendorsFollowing.includes(vendor.uid) ? 'bookmark' : 'bookmark-o'} size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            backgroundColor: 'white',
            width: 350,
            marginTop: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            flex: 1,
            borderWidth: 1,
            borderColor: '#C4C4C4',
            paddingBottom: 20,
          }}
        >
          <Text style={{ color: '#2A3242', alignSelf: 'flex-start', marginLeft: 20, fontWeight: '700', marginTop: 15 }}>
            NEXT BOOTHS
          </Text>
          {vendor.upcomingBooths ? (
            Object.values(vendor.upcomingBooths)
              .sort((a: any, b: any) => {
                return b.date - a.date;
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
                    {events[boothKey.eventID as keyof typeof events]['date']['day']} @{' '}
                    {events[boothKey.eventID as keyof typeof events]['name']}
                  </Text>
                  <Icon2 name="keyboard-arrow-right" size={20} color="#2A3242" style={{ marginRight: 10 }} />
                </TouchableOpacity>
              ))
          ) : (
            <Text style={{ color: '#2A3242', marginTop: 10, fontWeight: '400', marginLeft: 15 }}>
              no upcoming booths...
            </Text>
          )}
        </View>
      </View>
    );
  };

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
        {refreshing ? <ActivityIndicator /> : null}
        <View style={{ backgroundColor: 'transparent', alignSelf: 'center' }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 10 }}
            data={Object.keys(filteredVendorArray)}
            keyExtractor={(item) => filteredVendorArray[item].uid}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: '#FFfF8F3', marginBottom: 20 }}>
                <VendorItem vendor={filteredVendorArray[item]} />
              </View>
            )}
            ListEmptyComponent={() =>
              search ? null : (
                <Text style={{ marginTop: 10, marginLeft: 10, color: '#2A3242', height: 500 }}>
                  you haven't saved any creators!
                </Text>
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    width: 290,
    borderRadius: 20,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  eventDetailsContainer: {
    width: 350,
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
  },
  vendorName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    alignSelf: 'center',
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
});

export default FollowingScreen;
