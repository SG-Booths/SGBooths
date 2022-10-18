import { StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen: React.FC<RootStackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          marginLeft: 20,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          marginTop: 30,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="keyboard-arrow-left" size={50} color="#575FCC" style={{ marginTop: 5 }} />
        </TouchableOpacity>
        <Text style={styles.title}>profile</Text>
      </View>
      <TouchableOpacity onPress={() => signOut(auth)}>
        <Text style={{ color: 'black', marginLeft: 20, marginTop: 40 }}>sign out</Text>
      </TouchableOpacity>
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
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
});
export default SettingsScreen;
