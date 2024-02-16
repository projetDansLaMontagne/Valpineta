import { T_Signalement } from "app/navigators";
import { colors } from "app/theme";
import { spacing } from "app/theme/spacing";
import { ImageStyle, TextStyle, View, ViewStyle, Image, Modal } from "react-native";
import { Text, Button } from "app/components";
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export interface PopupSignalementProps {
    signalement: T_Signalement;
    modalSignalementVisible: boolean; // Etat du modal (modal = popup permettant d'alerter l'utilisateur sur un signalement)
    setModalSignalementVisible: (modalSignalementVisible: boolean) => void; // Permet de changer l'état de modal
    estEntier: boolean; // Si true, on affiche la description du signalement en entier
    setEstEntier: (estEntier: boolean) => void; // Permet de changer l'état de estEntier
}

export function PopupSignalement(props: PopupSignalementProps) {
    const { signalement, modalSignalementVisible, setModalSignalementVisible, estEntier, setEstEntier } = props;

    return (
        <Modal
            animationType="slide"
            visible={modalSignalementVisible}
            transparent={true}
        >
            <View style={$containerSignalement}>
                <View style={$containerTitrePopup}>
                    <Image tintColor={signalement.type == "PointInteret" ? colors.palette.vert : colors.palette.rouge} source={signalement.type == "PointInteret" ? require("assets/icons/view.png") : require("assets/icons/attentionV2.png")} style={$iconeStyle} />
                    <View style={{ width: "80%" }}><Text weight="bold" size="xl" style={$titreSignalement}>{signalement.nom}</Text></View>
                    <Image tintColor={signalement.type == "PointInteret" ? colors.palette.vert : colors.palette.rouge} source={signalement.type == "PointInteret" ? require("assets/icons/view.png") : require("assets/icons/attentionV2.png")} style={$iconeStyle} />
                </View>
                {estEntier ?
                    <View style={$containerImageDesc}>
                        <Image source={{ uri: `data:image/png;base64,${signalement.image}` }} style={$imageStyle} />
                        <Text style={[$descriptionSignalement, {
                            padding: spacing.md,
                            flex: 1,
                        }]}>{signalement.description}</Text>
                    </View>
                    :
                    <Text style={$descriptionSignalement}>{signalement.description}</Text>}

                <View style={$containerBoutons}>
                    <Button
                        style={[$bouton, { backgroundColor: colors.bouton }]}
                        textStyle={$texteBouton}
                        tx="detailsExcursion.popup.signalement.present"
                        onPress={() => setModalSignalementVisible(false)}
                    />
                    <Button
                        style={[$bouton, { backgroundColor: colors.palette.rouge }]}
                        textStyle={$texteBouton}
                        tx="detailsExcursion.popup.signalement.absent"
                        onPress={() => setModalSignalementVisible(false)}
                    />
                    <Button
                        style={[$bouton, { backgroundColor: colors.palette.orange }]}
                        textStyle={$texteBouton}
                        tx={estEntier ? "detailsExcursion.popup.signalement.voirMoins" : "detailsExcursion.popup.signalement.voirPlus"}
                        onPress={() => setEstEntier(!estEntier)}
                    />
                </View>
            </View>
        </Modal>
    )

}

/* ------------------------------- Style PopUp ------------------------------ */

const $containerSignalement: ViewStyle = {
    marginTop: height / 7,
    backgroundColor: colors.palette.blanc,
    padding: 10,
    borderRadius: 20,
    margin: spacing.sm,
    width: "90%"
}

const $containerTitrePopup: ViewStyle = {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: spacing.sm,
    width: "100%"
}

const $titreSignalement: TextStyle = {
    color: "black",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    textAlign: "center",
}

const $iconeStyle: ImageStyle = {
    width: 30,
    height: 30,
    alignSelf: "center"
}

const $imageStyle: ImageStyle = {
    marginStart: spacing.md,
    width: 125,
    height: 125,
    alignSelf: "center",
    borderRadius: 10
}

const $descriptionSignalement: TextStyle = {
    textAlign: "center",
    color: "black",
}

const $containerBoutons: ViewStyle = {
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-around",
    padding: 12,
    width: "100%"
}

const $containerImageDesc: ViewStyle = {
    flexDirection: "row",
    alignSelf: "center",
    paddingHorizontal: spacing.sm
}

const $bouton: ViewStyle = {
    alignSelf: "center",
    backgroundColor: colors.bouton,
    borderRadius: 13,
    borderColor: colors.fond,
    minHeight: 10,
    height: 25,
    paddingVertical: 0,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
    marginRight: spacing.sm
}

const $texteBouton: TextStyle = {
    color: colors.palette.blanc,
    fontSize: spacing.md,
    fontWeight: "bold",
    justifyContent: "center"
}