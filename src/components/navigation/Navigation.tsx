import React, {FC} from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StackScreen } from 'react-native-screens'
import Splash from '@modules/onboard'
import Home from '@modules/Home'
import { navigationRef } from './NavigationUtil'
import MainNavigator from './MainNavigator'

const Stack = createNativeStackNavigator()

const Navigation: FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
         <Stack.Navigator
             screenOptions={{
                headerShown: false
        }}
             initialRouteName="Splash"
        >
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="MainNavigator" component={MainNavigator} />

        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation