import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, TextInput, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref as ref_db, onValue, ref, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';

const FollowingScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();
  const [vendorsFollowing, setVendorsFollowing]: any = useState({});
  const [vendorArray, setVendorArray]: any = useState([]);
  const [filteredVendorArray, setFilteredVendorArray]: any = useState([]);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState({});

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  useEffect(() => {
    return onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);
    });
  }, []);

  // TODO: pull to refresh
  useEffect(() => {
    return onValue(ref(db, '/users/' + user?.uid + '/vendorsFollowing'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorsFollowing = { ...data };
      setVendorsFollowing([]);
      setVendorArray([]);
      setFilteredVendorArray([]);

      Object.keys(vendorsFollowing).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };

          let updatedValue = {};
          updatedValue = { [vendorKey]: info };
          setVendorsFollowing((vendorInfo: any) => ({ ...vendorInfo, ...updatedValue }));
          setVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
          setFilteredVendorArray((vendorInfo: any) => Object.values({ ...vendorInfo, ...updatedValue }));
        })
      );
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

  const getImgUrl = (key: string) => {
    const ref = ref_storage(storage, key + '.png');

    getDownloadURL(ref)
      .then((url) => {
        return url;
      })
      .catch((error) => {
        console.log('error:' + error);
        return error;
      });
  };

  const VendorItem = ({ vendor }: any) => {
    console.log(vendor.upcomingBooths);
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
            width: 360,
            marginTop: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            height: 110,
            borderWidth: 2,
            borderColor: '#C4C4C4',
          }}
        >
          <Text style={{ color: '#2A3242', alignSelf: 'flex-start', marginLeft: 15, fontWeight: '700', marginTop: 15 }}>
            NEXT BOOTHS
          </Text>
          {vendor.upcomingBooths ? (
            [
              Object.keys(vendor.upcomingBooths).map((boothKey: any) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'transparent',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 340,
                  }}
                  onPress={() =>
                    navigation.navigate('EventInfoScreen', {
                      imgUrl: getImgUrl(events[boothKey as keyof typeof events]['key']),
                      eventID: events[boothKey as keyof typeof events]['key'],
                      month: events[boothKey as keyof typeof events]['date']['month'],
                      day: events[boothKey as keyof typeof events]['date']['day'],
                      location: events[boothKey as keyof typeof events]['location'],
                      avail: events[boothKey as keyof typeof events]['avail'],
                      name: events[boothKey as keyof typeof events]['name'],
                    })
                  }
                >
                  <Text style={{ color: '#2A3242', marginLeft: 15, marginTop: 10 }}>
                    {monthNames[events[boothKey as keyof typeof events]['date']['month']]}{' '}
                    {events[boothKey as keyof typeof events]['date']['day']} @{' '}
                    {events[boothKey as keyof typeof events]['name']}
                  </Text>
                  <Icon2 name="keyboard-arrow-right" size={20} color="#2A3242" />
                </TouchableOpacity>
              )),
            ]
          ) : (
            <Text style={{ color: '#FABF48', marginTop: 40, fontWeight: '600', marginLeft: 15 }}>
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
        <ScrollView>
          {filteredVendorArray.length > 0 ? (
            [
              Object.keys(filteredVendorArray).map((vendorKey: any) => (
                <View key={vendorKey} style={{ backgroundColor: '#FFfF8F3', marginTop: 20 }}>
                  <VendorItem vendor={filteredVendorArray[vendorKey]} />
                </View>
              )),
            ]
          ) : (
            <Text style={{ color: '#FABF48', marginTop: 40, fontWeight: '600' }}>time to follow some creators!</Text>
          )}
        </ScrollView>
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
  },
  eventDetailsContainer: {
    width: 360,
    height: 170,
    backgroundColor: '#575FCC',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
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
