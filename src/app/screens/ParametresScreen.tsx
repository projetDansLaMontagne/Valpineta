import React from 'react'
import {
    Text,
    Screen,
    Card
} from '../components'
import { 
    StyleSheet
} from 'react-native'

export function ParametresScreen() {
    return (
        <Screen 
        style={styles.container}
        >
            <Text>Paramètres</Text>
            <Card></Card>
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