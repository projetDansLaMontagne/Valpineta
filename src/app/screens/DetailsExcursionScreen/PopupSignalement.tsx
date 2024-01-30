import { TSignalement } from "app/navigators";
import { colors } from "app/theme";
import { spacing } from "app/theme/spacing";
import { ImageStyle, TextStyle, View, ViewStyle, Image, Modal } from "react-native";
import { Text, Button } from "app/components";

export interface PopupSignalementProps {
    signalement: TSignalement;
    modalSignalementVisible: boolean;
    setModalSignalementVisible: (modalSignalementVisible: boolean) => void;
    estEntier: boolean;
    setEstEntier: (estEntier: boolean) => void;
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
                    <Text weight="bold" size="xl" style={$titreSignalement}>{signalement.nom}</Text>
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
                        tx="detailsExcursion.popup.present"
                        onPress={() => setModalSignalementVisible(false)}
                    />
                    <Button
                        style={[$bouton, { backgroundColor: colors.palette.rouge }]}
                        textStyle={$texteBouton}
                        tx="detailsExcursion.popup.absent"
                        onPress={() => setModalSignalementVisible(false)}
                    />
                    <Button
                        style={[$bouton, { backgroundColor: colors.palette.orange }]}
                        textStyle={$texteBouton}
                        tx={estEntier ? "detailsExcursion.popup.voirMoins" : "detailsExcursion.popup.voirPlus"}
                        onPress={() => setEstEntier(!estEntier)}
                    />
                    {/* <View>
                      <Text style={{ width: 100, textAlign: "center" }}>Toujours présent ?</Text>
                      <Image source={require("assets/icons/aime.png")} tintColor={colors.bouton} style={[$iconeStyle, { width: 40, height: 40 }]} />
                    </View>
                    <Image source={require("assets/icons/deployer.png")} style={$iconeStyle} /> */}
                </View>
            </View>
        </Modal>
    )

}

/* ------------------------------- Style PopUp ------------------------------ */

const $containerSignalement: ViewStyle = {
    marginTop: spacing.xl,
    backgroundColor: colors.palette.blanc,
    padding: 10,
    borderRadius: 20,
    margin: spacing.sm,
    width: "90%"
}

const $containerTitrePopup: ViewStyle = {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: spacing.sm
}

const $titreSignalement: TextStyle = {
    color: "black",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm
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