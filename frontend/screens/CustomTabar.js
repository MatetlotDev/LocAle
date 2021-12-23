/**
 * Matthias
 * 20/12/2021
 * 
 */

// imports
import React, {useState} from 'react'
import { StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons';

// navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// components
import Homepage from './Homepage';
import Wishlist from './Wishlist';
import Search from './Search';
import Profile from './Profile';
import BeerList from './BeerList';
import BeerInfo from './BeerInfo';
import Log from './Log';

const HomeStack = createNativeStackNavigator();

// stack navigation 
const StackNavigator = () => {
  return (
    <HomeStack.Navigator initialRouteName="Homepage" screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Homepage" component={Homepage} />
      <HomeStack.Screen name="BeerList" component={BeerList} />
      <HomeStack.Screen name="BeerInfo" component={BeerInfo} />
      <HomeStack.Screen name="Log" component={Log} />
    </HomeStack.Navigator>
  )
}

const Tab = createBottomTabNavigator();


// tab bar navigation
export default function CustomTabar() {

  const [tabDisplay, setTabDisplay] = useState('none');

  // not displaying tab bar during the animation at the start
  setTimeout(() => {
    setTabDisplay('flex');
  }, 3000)
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          if (route.name === 'StackNav') return <Image source={require('../assets/logo_loc_ale_contour_bleufonce.png')} style={styles.logo} />;
          else if (route.name === 'Search') return <Ionicons name="search" size={35} color={color} />;
          else if (route.name === 'Wishlist') return <Ionicons name="heart-outline" size={35} color={color} />;
          else if (route.name === 'Profile') return <Ionicons name="person-outline" size={35} color={color} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#F9D512',
        tabBarInactiveTintColor: '#fff',
        tabBarItemStyle: {
          backgroundColor: '#194454'
        },
        tabBarStyle: {
          display: tabDisplay,
          backgroundColor: '#194454'
        },

      })}
    >
      <Tab.Screen name="StackNav" component={StackNavigator} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Wishlist" component={Wishlist} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    backgroundColor: '#194454',
  },
  logo: {
    width: 60,
    height: 60,
  }
})
