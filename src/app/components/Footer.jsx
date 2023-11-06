import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from "../theme"

const explorerLogo = require('../../assets/icons/explorer.png')
const carteLogo = require('../../assets/icons/carte.png')
const parametresLogo = require('../../assets/icons/parametres.png')

export function Footer({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("Accueil")}
            >
                <Image
                    source={explorerLogo}
                    style={styles.icon}
                />

            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Carte")}
            >
                <Image
                    source={carteLogo}
                    style={styles.icon}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Parametres")}
            >
                <Image
                    source={parametresLogo}
                    style={styles.icon}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    icon: {
        width: 40,
        height: 40,
        tintColor: colors.bouton,
    },
});