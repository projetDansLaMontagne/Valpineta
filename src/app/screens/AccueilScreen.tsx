import React,{useEffect, useState} from 'react'
import {
    Text,
    Screen,
    Card,
} from '../components'
import { 
    StyleSheet,
    ScrollView,
    View
 } from 'react-native'
import DonnesApi from 'app/components/DonnesApi'




  

export function AccueilScreen() {



    return (
        <Screen 
        style={styles.container}
        >
            <ScrollView>

            <Text>Accueil</Text>
            <DonnesApi/>
            </ScrollView>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
        width: '90%',
        alignSelf: 'center'
    }
})