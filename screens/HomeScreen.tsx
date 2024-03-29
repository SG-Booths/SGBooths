import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref, onValue, remove, set, update } from 'firebase/database';
import { ref as ref_storage, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { eachMonthOfInterval, addMonths, getMonth, getYear, isPast, compareAsc, compareDesc } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ route, navigation }: any) {
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

  const [uploadedImages, setUploadedImages]: any = useState(true);

  const today = new Date();
  const months = eachMonthOfInterval({
    start: today,
    end: addMonths(today, 6),
  });

  const [value, setValue] = React.useState({
    email: '',
    name: '',
    instagram: '',
    type: '',
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

      let newArray: any = Object.values(eventItems).sort((a: any, b: any) => {
        return (
          new Date(a.date.year, a.date.month, a.date.startDay).getTime() -
          new Date(b.date.year, b.date.month, b.date.startDay).getTime()
        );
      });

      // uses state to set cardArray and filteredCards to the reverse of this data
      setEventArray(newArray);
      setFilteredEvents(newArray);
    });

    onValue(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing'), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let boothsFollowingTemp = { ...data2 };
      setBoothsFollowing(Object.keys(boothsFollowingTemp));
    });
    getStarred(starredFilter);
    setRefreshing(false);
  };

  // toggles a card's starred status
  const updateStarred = (eventItem: any) => {
    if (boothsFollowing && boothsFollowing.length > 0) {
      console.log('booths following:', boothsFollowing);
      console.log('key:', eventItem['key']);
      console.log('starred filter:', starredFilter);

      if (boothsFollowing.includes(eventItem['key']) && starredFilter === true) {
        remove(ref(db, '/users/' + auth.currentUser?.uid + '/boothsFollowing/' + eventItem['key']));
        getStarred(starredFilter);
        setBoothsFollowing(
          boothsFollowing.filter((obj: string) => {
            return !(obj === eventItem['key']);
          })
        );
        setFilteredEvents(
          filteredEvents.filter((obj: any) => {
            return !(obj.key === eventItem['key']);
          })
        );
      } else if (boothsFollowing.includes(eventItem['key'])) {
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
  };

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
      <View
        style={{
          marginBottom: 20,
          borderWidth: 1,
          borderRadius: 20,
          borderColor: '#C4C4C4',
          width: Dimensions.get('window').width - 60,
        }}
      >
        <Pressable
          onPress={() =>
            navigation.navigate('EventInfoScreen', {
              imgUrl: imgUrl,
              eventID: eventItem['key'],
              month: month,
              startDay: eventItem['date']['startDay'],
              endDay: eventItem['date']['endDay'],
              location: eventItem['location'],
              avail: eventItem['avail'],
              name: eventItem['name'],
              year: eventItem['date']['year'],
              following: boothsFollowing.includes(eventItem['key']),
              instagram: eventItem['instagram'],
            })
          }
        >
          <View style={styles.eventImageContainer}>
            <ImageBackground
              source={{ uri: imgUrl }}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              style={{
                flex: 1,
                width: Dimensions.get('window').width - 60,
                height: undefined,
                zIndex: 0,
              }}
            >
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
            </ImageBackground>
          </View>
          <View
            style={{
              width: Dimensions.get('window').width - 60,
              height: 50 + (eventItem['name'].length / 34) * 12,
              backgroundColor: 'white',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderRightWidth: 1,
              borderColor: '#C4C4C4',
            }}
          >
            {eventItem['date']['startDay'] === eventItem['date']['endDay'] ? (
              <Text style={styles.eventDate}>{eventItem['date']['startDay']}</Text>
            ) : (
              <Text style={styles.eventDate}>
                {eventItem['date']['startDay']} - {eventItem['date']['endDay']}
              </Text>
            )}
            <Text style={styles.eventName}>{eventItem['name']}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  useMemo(() => {
    if (value.type === 'vendor') {
      console.log('use effect');
      getDownloadURL(ref_storage(storage, auth?.currentUser?.uid + '_1.png'))
        .then(() => {
          console.log('image already uploaded');
        })
        .catch((error) => {
          console.log('uploading images');
          uploadImages();
        });
    }
    // if (!value.type) {
    //   set(ref(db, '/users/' + auth?.currentUser?.uid), {
    //     type: 'vendor',
    //     uid: auth?.currentUser?.uid,
    //     name: 'unnamed',
    //   });
    //   uploadImages()
    // }
  }, [value.type]);

  const uploadImages = async () => {
    setUploadedImages(false);
    const imgUrl1Final = await AsyncStorage.getItem('img1');
    const imgUrl2Final = await AsyncStorage.getItem('img2');
    const imgUrl3Final = await AsyncStorage.getItem('img3');

    if (imgUrl1Final != null || imgUrl2Final != null || imgUrl3Final != null) {
      const metadata = {
        contentType: 'image/png',
      };

      // TODO: issue when user clicks on profile straight away after account creation
      const ref1 = ref_storage(storage, auth.currentUser?.uid + '_1.png');
      console.log('ref 1 done');
      const response1 = await fetch(imgUrl1Final!);
      console.log('response 1 done');
      const blob1 = await response1.blob();
      console.log('blob 1 done');

      const file1 = new File([blob1], `${auth.currentUser?.uid}_1.png`, {
        type: 'image/png',
      });
      uploadBytesResumable(ref1, file1, metadata)
        .then(async (snapshot) => {
          console.log('Uploaded image 1');
          AsyncStorage.setItem('img1', '');

          const ref2 = ref_storage(storage, auth.currentUser?.uid + '_2.png');
          console.log('ref 2 done');
          const response2 = await fetch(imgUrl2Final!);
          console.log('response 2 done');
          const blob2 = await response2.blob();
          console.log('blob 2 done');

          const file2 = new File([blob2], `${auth.currentUser?.uid}_2.png`, {
            type: 'image/png',
          });
          uploadBytesResumable(ref2, file2, metadata)
            .then(async (snapshot) => {
              console.log('Uploaded image 2');
              AsyncStorage.setItem('img2', '');

              const ref3 = ref_storage(storage, auth.currentUser?.uid + '_3.png');
              console.log('ref 3 done');
              const response3 = await fetch(imgUrl3Final!);
              console.log('response 3 done');
              const blob3 = await response3.blob();
              console.log('blob 3 done');

              const file3 = new File([blob3], `${auth.currentUser?.uid}_3.png`, {
                type: 'image/png',
              });
              uploadBytesResumable(ref3, file3, metadata)
                .then(async (snapshot) => {
                  console.log('Uploaded image 3');
                  AsyncStorage.setItem('img3', '');
                  setUploadedImages(true);
                })
                .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    } else {
      console.log('missing images');
      setUploadedImages(false);
      Alert.alert('Oh no, some of your shop images are missing!', 'Please upload all 3 images', [
        {
          text: 'Okay',
          onPress: () => {
            navigation.navigate('SettingsScreen', {
              name: '',
              instagram: value.instagram,
              type: value.type,
            });
            setUploadedImages(true);
          },
          style: 'default',
        },
      ]);
    }
  };

  useEffect(() => {
    return onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);

      let newArray: any = Object.values(eventItems).sort((a: any, b: any) => {
        return (
          new Date(a.date.year, a.date.month, a.date.startDay).getTime() -
          new Date(b.date.year, b.date.month, b.date.startDay).getTime()
        );
      });

      for (let i = 0; i < newArray.length; i++) {
        if (
          isPast(
            zonedTimeToUtc(
              new Date(newArray[i].date.year, newArray[i].date.month - 1, newArray[i].date.endDay, 23, 59, 59),
              'Asia/Singapore'
            )
          )
        ) {
          onValue(ref(db, '/users'), (querySnapShot) => {
            let data = querySnapShot.val() || {};
            let users = { ...data };

            Object.values(users).map((userKey: any) => {
              remove(ref(db, '/users/' + userKey.uid + '/upcomingBooths/' + newArray[i].key));
              remove(ref(db, '/users/' + userKey.uid + '/boothsFollowing/' + newArray[i].key));
            });
          });

          deleteObject(ref_storage(storage, newArray[i].key + '.png'));
          remove(ref(db, '/events/' + newArray[i].key));

          return onValue(ref(db, '/events'), (querySnapShot) => {
            let data = querySnapShot.val() || {};
            let eventItems = { ...data };
            setEvents(eventItems);

            newArray = Object.values(eventItems).sort((a: any, b: any) => {
              return (
                new Date(a.date.year, a.date.month, a.date.startDay).getDate() -
                new Date(b.date.year, b.date.month, b.date.startDay).getDate()
              );
            });
          });
        }
      }

      // uses state to set cardArray and filteredCards to the reverse of this data
      setEventArray(newArray);
      setFilteredEvents(newArray);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    console.log('current user id is ', auth.currentUser?.uid);
    return onValue(ref(db, '/users/' + auth.currentUser?.uid), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let boothsFollowingTemp = { ...data2.boothsFollowing };
      setBoothsFollowing(Object.keys(boothsFollowingTemp));
      console.log('booths following are ', Object.keys(boothsFollowingTemp));
      setRefreshing(false);

      setValue({
        name: data2.name,
        email: auth?.currentUser?.email!,
        instagram: data2.instagram,
        type: data2.type,
      });
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

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter) {
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
          width: '100%',
          marginTop: 30,
        }}
      >
        <Text style={styles.title}>events</Text>
        <TouchableOpacity
          style={{ alignSelf: 'center' }}
          onPress={() =>
            uploadedImages
              ? value.name != '' &&
                setTimeout(() => {
                  navigation.navigate('SettingsScreen', {
                    name: '',
                    instagram: value.instagram,
                    type: value.type,
                  });
                }, 500)
              : alert('Please wait a moment! Your shop images are uploading')
          }
        >
          <Icon2 name="person-circle-outline" size={35} color="#2A3242" style={{ marginRight: 20 }} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
        <TextInput
          style={styles.searchBar}
          value={search}
          placeholder="search by event name..."
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
        horizontal={false}
      >
        {months.map((monthKey) => (
          <View key={monthKey.toString()}>
            {filteredEvents.some(function (item) {
              return item['date']['month'] - 1 === getMonth(monthKey);
            }) && (
              <Text style={styles.monthHeader}>
                {monthNames[getMonth(monthKey)]} '{getYear(monthKey) % 100}
              </Text>
            )}
            <View>
              {eventKeys.length > 0 &&
                eventKeys.map((eventKey) =>
                  filteredEvents[eventKey as keyof typeof events]['date']['month'] - 1 == getMonth(monthKey) &&
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
        {filteredEvents.length === 0 &&
          !search &&
          (!starredFilter ? (
            <Text style={{ color: '#2A3242', height: 500 }}>no events yet!</Text>
          ) : (
            <Text style={{ color: '#2A3242', height: 500 }}>you haven't saved any events!</Text>
          ))}
        {value.type === 'admin' && (
          <TouchableOpacity onPress={() => navigation.navigate('AddEvent')} style={{ alignItems: 'center' }}>
            <Text>add event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    width: Dimensions.get('window').width - 60,
    height: 120,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    maxWidth: Dimensions.get('window').width - 190,
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
  savedButton: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 40,
    height: 40,
    marginLeft: 20,
    justifyContent: 'center',
  },
});
