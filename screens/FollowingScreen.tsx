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
} from 'react-native';
import { Text, View } from '../components/Themed';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref as ref_db, onValue, ref, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';

const FollowingScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();
  const [vendorArray, setVendorArray]: any = useState([]);
  const [filteredVendorArray, setFilteredVendorArray]: any = useState([]);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState({});
  const [refreshing, setRefreshing] = useState(true);

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  let imgUrl: any = useRef()

  const loadNewData = () => {
    onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);
    });

    onValue(ref(db, '/users/' + user?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorsFollowing = { ...data };
      setVendorArray([]);
      setFilteredVendorArray([]);

      Object.keys(vendorsFollowing).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };

          if (info.type === 'visitor' || !info) {
            remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + vendorKey));
          } else {
            let updatedValue = { [vendorKey]: info };
            setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
            setFilteredVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
          }
        })
      );
      setRefreshing(false);
    });
  };

  // TODO: fix loading issue
  useEffect(() => {
    return onValue(ref(db, '/users/' + user?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorsFollowing = { ...data };
      setVendorArray([]);
      setFilteredVendorArray([]);

      Object.keys(vendorsFollowing).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };

          console.log('type:', info.type);
          if (info.type === 'visitor') {
            remove(ref(db, '/users/' + user?.uid + '/vendorsFollowing/' + vendorKey));
          } else {
            let updatedValue = { [vendorKey]: info };
            setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
            setFilteredVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
          }
        })
      );

      onValue(ref(db, '/events'), (querySnapShot1) => {
        let data = querySnapShot1.val() || {};
        let eventItems = { ...data };
        setEvents(eventItems);
        setRefreshing(false);
      });
    });
  }, []);

  const searchVendors = (text: string) => {
    console.log('filtered: ', vendorArray);

    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredVendorArray(
      vendorArray.filter((obj: { name: string }) => {
        return obj.name
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
          .replace(/\s{2,}/g, ' ')
          .toLowerCase()
          .includes(text);
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
        })
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
            <TouchableOpacity
              onPress={() => remove(ref(db, '/users/' + auth.currentUser?.uid + '/vendorsFollowing/' + vendor.uid))}
            >
              <Icon name="bookmark" size={25} color="white" />
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
            height: 110,
            borderWidth: 1,
            borderColor: '#C4C4C4',
          }}
        >
          <Text style={{ color: '#2A3242', alignSelf: 'flex-start', marginLeft: 15, fontWeight: '700', marginTop: 15 }}>
            NEXT BOOTHS
          </Text>
          {vendor.upcomingBooths ? (
              Object.values(vendor.upcomingBooths)
                .sort((a: any, b: any) => {
                  return b.date - a.date;
                })
                .slice(0, 2)
                .map((boothKey: any) => (
                  <TouchableOpacity
                    key={vendor.uid + boothKey.eventID}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'transparent',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: 340,
                    }}
                    onPress={() =>
                      getImgUrl(events[boothKey.eventID as keyof typeof events]['key'], boothKey)
                    }
                  >
                    <Text style={{ color: '#2A3242', marginLeft: 15, marginTop: 10 }}>
                      {monthNames[events[boothKey.eventID as keyof typeof events]['date']['month'] - 1]}{' '}
                      {events[boothKey.eventID as keyof typeof events]['date']['day']} @{' '}
                      {events[boothKey.eventID as keyof typeof events]['name']}
                    </Text>
                    <Icon2 name="keyboard-arrow-right" size={20} color="#2A3242" />
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
      <View style={{ marginLeft: 30, backgroundColor: 'transparent' }}>
        <Text style={styles.title}>following</Text>
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
        {refreshing ? <ActivityIndicator /> : null}
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ height: 580 }}
          data={Object.keys(filteredVendorArray)}
          keyExtractor={(item) => filteredVendorArray[item].uid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#FFfF8F3', marginTop: 20 }}>
              <VendorItem vendor={filteredVendorArray[item]}/>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={{ marginTop: 30, color: '#2A3242' }}>pull to refresh if you don't see your favourite creators!</Text>
          )}
        />
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
    width: 350,
    borderRadius: 20,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  eventDetailsContainer: {
    width: 350,
    height: 170,
    backgroundColor: '#575FCC',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
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
});

export default FollowingScreen;
