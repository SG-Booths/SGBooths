import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Pressable, Button, TextInput } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import { eachMonthOfInterval, addMonths, getMonth, getYear } from 'date-fns';
import { StackScreenProps } from '@react-navigation/stack';
import Image from 'react-native-image-progress';

const HomeScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventArray, setEventArray]: any = useState({});

  const [boothsFollowing, setBoothsFollowing]: any = useState({});

  const [search, setSearch] = useState('');

  const eventKeys = Object.keys(filteredEvents);

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
      <View style={{marginBottom: 15}}>
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
            })
          }
        >
          <View style={styles.eventImageContainer}>
            <Image
              source={{ uri: imgUrl }}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              style={{
                flex: 1,
                width: undefined,
                height: undefined,
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

      onValue(ref(db, '/users/' + user?.uid + '/boothsFollowing' ), (querySnapShot) => {
        let data2 = querySnapShot.val() || {};
        let boothsFollowing = { ...data2 };
        setBoothsFollowing(boothsFollowing);
      })
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
          obj.name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase().includes(text) ||
          obj.location.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase().includes(text)
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
      setFilteredEvents(
        eventArray.filter((obj: { name: string; location: string, key: any }) => {
          return (
            ((obj.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").includes(search) ||
              obj.location.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").includes(search)) && boothsFollowing.includes(obj.key))
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>events</Text>
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
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {months.map((monthKey) => (
          <View key={monthKey.toString()}>
            {
              filteredEvents.some(function (item) {
                return item['date']['month'] === getMonth(monthKey)}) && 
              <Text style={styles.monthHeader}>
              {monthNames[getMonth(monthKey)]} '{getYear(monthKey) % 100}
            </Text>
            }
            <View>
              {eventKeys.length > 0 && (
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
                )
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <Button title="Sign Out" onPress={() => signOut(auth)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eventList: {
    flex: 1,
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginTop: 30,
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
    width: 350,
    borderRadius: 20,
    marginLeft: 30,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
  },
});

export default HomeScreen;
