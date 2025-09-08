import { View, StyleSheet, Image } from 'react-native'
import React, { FC, useEffect } from 'react'
import { screenHeight } from '@utils/Constants'
import { resetAndNavigate } from '@components/navigation/NavigationUtil'

const Splash: FC = () => {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            resetAndNavigate('MainNavigator');
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <View style={styles.container}>
            <Image source={require('@assets/images/logo1.png')}
                style={styles.image} />
        </View>
    );
} // <-- closing brace for Splash component

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff914d',
    },
    image: {
        width: screenHeight * 0.35,
        height: screenHeight * 0.35,
    },
});

export default Splash