import React from 'react'
import {
    Text,
    Screen
} from '../components'
import { 
    StyleSheet
 } from 'react-native'


export function AccueilScreen() {
    return (
        <Screen 
        style={styles.container}
        >
            <Text>Accueil</Text>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})