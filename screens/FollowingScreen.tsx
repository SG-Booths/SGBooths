import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

const FollowingScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();
  const [vendorsFollowing, setVendorsFollowing]: any = useState({});

  useEffect(() => {
    return onValue(ref(db, '/users/' + user?.uid + '/vendorsFollowing' ), (querySnapShot) => {
        let data = querySnapShot.val() || {};
        let vendorsFollowing = { ...data };
        setVendorsFollowing(vendorsFollowing);

        console.log(JSON.stringify(data))
      })
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Following
      </Text>
      <Text>{JSON.stringify(vendorsFollowing)}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

export default FollowingScreen;
