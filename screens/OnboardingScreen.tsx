import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const completeOnboarding = () => {
    navigation.navigate('SignIn');
  };

  return (
    <Onboarding
      onDone={completeOnboarding}
      onSkip={completeOnboarding}
      bottomBarHighlight={false}
      pages={[
        {
          backgroundColor: '#9190F5',
          image: <Image source={require('../assets/images/onboarding_1.png')} style={{ height: 300, width: 300 }} />,
          title: 'Welcome to SG Booths!',
          subtitle: 'Keep track of upcoming arts & crafts events and booths here in Singapore',
          titleStyles: { color: 'white', fontWeight: '600' },
          subTitleStyles: { color: 'white', opacity: 0.7, width: 350 },
        },
        {
          backgroundColor: '#FEDA92',
          image: <Image source={require('../assets/images/onboarding_2.png')} style={{ height: 300, width: 300 }} />,
          title: 'For creators...',
          subtitle: 'Organise boothing dates and connect with the community',
          titleStyles: { color: '#2A3242', fontWeight: '600' },
          subTitleStyles: { color: '#2A3242', opacity: 0.7, width: 350 },
        },
        {
          backgroundColor: '#AFDFC8',
          image: <Image source={require('../assets/images/onboarding_3.png')} style={{ height: 300, width: 300 }} />,
          title: '...and customers!',
          subtitle: 'Discover new creators and stay up to date with events',
          titleStyles: { color: '#2A3242', fontWeight: '600' },
          subTitleStyles: { color: '#2A3242', opacity: 0.7, width: 350 },
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
export default OnboardingScreen;
