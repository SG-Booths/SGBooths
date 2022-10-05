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

  const vendorsFollowing: any = useRef([]);

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
          let info = { ...data, boothNumber: vendorList[vendorKey]['boothNumber'] };
          let updatedValue = {};
          updatedValue = { [vendorKey]: info };
          setVendorList((vendorInfo) => ({ ...vendorInfo, ...updatedValue }));
          setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
          setFilteredVendors((vendorInfo) => Object.values({ ...vendorInfo, ...updatedValue }));
        })
      );
    });
  }, []);

  useEffect(() => {
    console.log('use effect');
    const orderedData = query(
      ref_db(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing'),
      orderByChild('boothNumber')
    );
    return onValue(orderedData, (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let vendorsFollowingTemp = { ...data2 };
      vendorsFollowing.current = Object.keys(vendorsFollowingTemp);
    });
  }, []);

  const searchVendors = (text: string) => {
    console.log('following: ', vendorsFollowing.current);
    console.log('filtered: ', filteredVendors);

    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendors(
      vendorArray.filter((obj: { name: string; boothNumber: number }) => {
        return (
          obj.name
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text) ||
          obj.boothNumber
            .toString()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text)
        );
      })
    );
  };
  // TODO: delete booths after certain amount of time
  // TODO: when user goes from vendor to visitor account, delete their uid from people's vendorFollowing

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter) {
      setFilteredVendors(
        vendorArray.filter((obj: { name: string; boothNumber: number; key: any }) => {
          return (
            obj.name
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .toLowerCase()
              .includes(search) ||
            (obj.boothNumber
              .toString()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .toLowerCase()
              .includes(search) &&
              vendorsFollowing.current.includes(obj.key))
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
    if (vendorsFollowing.current && vendorsFollowing.current.length > 0) {
      if (vendorsFollowing.current.includes(uid)) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + uid));
      } else {
        update(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/'), {
          uid: '',
        });
        // set(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/' + [eventItem['key']]),
        // {'sf': 0}
        // )
      }
    } else {
      console.log(vendorsFollowing.current.length);
      set(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/'), {
        uid: '',
      });
    }
    // TODO: fix bug: when item is unstarred after star filter is already on
    // if (!eventItem['starred'] && starredFilter) {
    //   getStarred(starredFilter);
    //   console.log(cardArray);
    // }
  };

  const VendorItem = ({ eventID, id }: any) => {
    const name = filteredVendors[id as keyof typeof filteredVendors]['name' as keyof typeof filteredVendors];
    const instagram = filteredVendors[id as keyof typeof filteredVendors]['instagram' as keyof typeof filteredVendors];
    const uid = filteredVendors[id as keyof typeof filteredVendors]['uid' as keyof typeof filteredVendors];

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
            <Icon
              name={vendorsFollowing.current.includes(uid) ? 'bookmark' : 'bookmark-o'}
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
  };

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
      <View style={styles.container}>
        <Text style={styles.date}>
          {monthNames[month]} {day}
        </Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent', alignContent: 'flex-end' }}>
          <TextInput
            style={styles.searchBar}
            value={search}
            placeholder="search by event name or location..."
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
        <ScrollView
          style={styles.eventList}
          contentContainerStyle={styles.contentContainerStyle}
          directionalLockEnabled={true}
          horizontal={false}
        >
          {Object.keys(filteredVendors).map((vendorKey: any) => (
            <View key={vendorKey} style={{ backgroundColor: '#FFfF8F3' }}>
              <VendorItem eventID={eventID} id={vendorKey} />
            </View>
          ))}
        </ScrollView>
      </View>
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
});
