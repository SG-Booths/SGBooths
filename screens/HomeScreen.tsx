import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Button,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref, onValue, remove, push, set, update } from 'firebase/database';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import { eachMonthOfInterval, addMonths, getMonth, getYear } from 'date-fns';
import { StackScreenProps } from '@react-navigation/stack';
import Image from 'react-native-image-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';

const HomeScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventArray, setEventArray]: any = useState([]);

  const [boothsFollowing, setBoothsFollowing]: any = useState([]);

  const [search, setSearch] = useState('');

  const [starredFilter, setStarredFilter] = useState(false);

  const eventKeys = Object.keys(filteredEvents);

  const [refreshing, setRefreshing] = useState(true);

  const today = new Date();
  const months = eachMonthOfInterval({
    start: today,
    end: addMonths(today, 6),
  });

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const loadNewData = () => {
    onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);

      let newArray: any = Object.values(eventItems).reverse();

      // uses state to set cardArray and filteredCards to the reverse of this data
      setEventArray(newArray);
      setFilteredEvents(newArray);
    });

    onValue(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let boothsFollowingTemp = { ...data2 };
      setBoothsFollowing(Object.keys(boothsFollowingTemp));
      console.log('booths following are ', Object.keys(boothsFollowingTemp));
    });
    setRefreshing(false)
  }

  // toggles a card's starred status
  const updateStarred = (eventItem: any) => {
    if (boothsFollowing && boothsFollowing.length > 0) {
      console.log('boothsFollowing exists');
      if (boothsFollowing.includes(eventItem['key'])) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/' + eventItem['key']));
      } else {
        update(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/'), {
          [eventItem['key']]: '',
        });
        // set(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/' + [eventItem['key']]),
        // {'sf': 0}
        // )
      }
    } else {
      console.log(boothsFollowing.length);
      set(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/'), {
        [eventItem['key']]: '',
      });
    }
    // TODO: fix bug: when item is unstarred after star filter is already on
    // if (!eventItem['starred'] && starredFilter) {
    //   getStarred(starredFilter);
    //   console.log(cardArray);
    // }
  };

// TODO: delete event if today's date is later
  const EventItem = ({ eventItem, month }: any) => {
    const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
    const ref = ref_storage(storage, eventItem['key'] + '.png');

    getDownloadURL(ref)
      .then((url) => {
        setImgUrl(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    return (
      <View style={{ marginBottom: 15, borderWidth: 1, borderRadius: 20, borderColor: '#C4C4C4'}}>
        <Pressable
          onPress={() =>
            navigation.navigate('EventInfoScreen', {
              imgUrl: imgUrl,
              eventID: eventItem['key'],
              month: month,
              day: eventItem['date']['day'],
              location: eventItem['location'],
              avail: eventItem['avail'],
              name: eventItem['name'],
              year: eventItem['date']['year'],
            })
          }
        >
          <View style={styles.eventImageContainer}>
            {/* TODO: fix zIndex */}
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderRadius: 100,
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'flex-end',
                marginRight: 15,
                marginTop: 15,
                zIndex: 1,
              }}
              onPress={() => updateStarred(eventItem)}
            >
              <Icon
                name={boothsFollowing.includes(eventItem['key']) ? 'bookmark' : 'bookmark-o'}
                size={25}
                color="#575FCC"
              />
            </TouchableOpacity>
            <Image
              source={{ uri: imgUrl }}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              style={{
                flex: 1,
                width: undefined,
                height: undefined,
                zIndex: 0,
              }}
            />
          </View>
          <View style={styles.eventDetailsContainer}>
            <Text style={styles.eventDate}>{eventItem['date']['day']}</Text>
            <Text style={styles.eventName}>{eventItem['name']}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  useEffect(() => {
    return onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);

      let newArray: any = Object.values(eventItems).reverse();

      // uses state to set cardArray and filteredCards to the reverse of this data
      setEventArray(newArray);
      setFilteredEvents(newArray);
      setRefreshing(false)
    });
    
  }, []);

  useEffect(() => {
    console.log('current user id is ', auth.currentUser?.uid);
    return onValue(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let boothsFollowingTemp = { ...data2 };
      setBoothsFollowing(Object.keys(boothsFollowingTemp));
      console.log('booths following are ', Object.keys(boothsFollowingTemp));
      setRefreshing(false)
    });
  }, []);

  const searchEvents = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredEvents(
      eventArray.filter((obj: { name: string; location: string }) => {
        return (
          obj.name
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase()
            .includes(text) ||
          obj.location
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
  // TODO: load more on scroll

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter && boothsFollowing && boothsFollowing.length > 0) {
      setFilteredEvents(
        eventArray.filter((obj: { name: string; location: string; key: any }) => {
          return (
            (obj.name
              .toLowerCase()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
              .replace(/\s{2,}/g, ' ')
              .includes(search) ||
              obj.location
                .toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .replace(/\s{2,}/g, ' ')
                .includes(search)) &&
            boothsFollowing.includes(obj.key)
          );
        })
      );
    }
    // if starred is false, ignores the starred filter and only applies the search
    else {
      setFilteredEvents(eventArray);
      searchEvents(search);
    }
  };

  // applies the starred filter
  const applyStarredFilter = () => {
    // sets the new filter to the opposite of what it was previously
    const newStarredFilter = !starredFilter;
    setStarredFilter(newStarredFilter);

    // filters cards based on starred
    getStarred(newStarredFilter);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'transparent',
          justifyContent: 'space-between',
          width: 390,
          marginTop: 30,
        }}
      >
        <Text style={styles.title}>events</Text>
        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon2 name="person-circle-outline" size={35} color="#2A3242" />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput
          style={styles.searchBar}
          value={search}
          placeholder="search by event name or location..."
          underlineColorAndroid="transparent"
          onChangeText={(text) => searchEvents(text)}
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
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadNewData} />
        }
      >
        {months.map((monthKey) => (
          <View key={monthKey.toString()}>
            {filteredEvents.some(function (item) {
              return item['date']['month'] === getMonth(monthKey);
            }) && (
              <Text style={styles.monthHeader}>
                {monthNames[getMonth(monthKey)]} '{getYear(monthKey) % 100}
              </Text>
            )}
            <View>
              {eventKeys.length > 0 &&
                eventKeys.map((eventKey) =>
                  filteredEvents[eventKey as keyof typeof events]['date']['month'] == getMonth(monthKey) &&
                  filteredEvents[eventKey as keyof typeof events]['date']['year'] == getYear(monthKey) ? (
                    <EventItem
                      key={eventKey}
                      id={eventKey}
                      eventItem={filteredEvents[eventKey as keyof typeof events]}
                      month={getMonth(monthKey) + 1}
                    />
                  ) : null
                )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  eventList: {
    flex: 1,
    alignSelf: 'center',
  },
  title: {
    marginLeft: 30,
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
  monthHeader: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    fontSize: 36,
    color: '#FABF48',
    fontWeight: '500',
  },
  contentContainerStyle: {
    padding: 24,
  },
  eventImageContainer: {
    width: 350,
    height: 120,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  eventDetailsContainer: {
    width: 350,
    height: 50,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontWeight: '800',
    fontSize: 20,
    marginLeft: 20,
    color: '#2A3242',
  },
  eventName: {
    fontSize: 20,
    marginLeft: 20,
    color: '#2A3242',
    fontWeight: '500',
  },
  searchBar: {
    height: 40,
    width: 300,
    borderRadius: 20,
    marginLeft: 30,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4'
  },
  savedButton: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 40,
    height: 40,
    marginLeft: 20,
    justifyContent: 'center',
  },
});

export default HomeScreen;
