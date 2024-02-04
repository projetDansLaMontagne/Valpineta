// Librairies
import React, { FC, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  TextStyle,
  TextInput,
  Image,
  View,
  Dimensions,
  ViewStyle,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ImageStyle,
} from "react-native";
import { AppStackScreenProps, TTypeSignalement, TSignalement } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Button } from "app/components";
import * as ImagePicker from "expo-image-picker";
import { SynchroMontanteStore, useStores } from "app/models";
import { synchroMontanteSignalement } from "app/services/synchroMontanteService";
import { goBack } from "app/navigators";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { translate } from "app/i18n";
// Composants
import { Screen, Text } from "app/components";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: TTypeSignalement;
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    // Stores
    const { synchroMontanteStore } = useStores();

    //type de signalement
    let type: TTypeSignalement;
    if (props.route.params) {
      type = props.route.params.type;
    } else {
      throw new Error("[NouveauSignalementScreen] Type de signalement non défini");
    }

    // Variables
    const [titreSignalement, setTitreSignalement] = useState("");
    const [descriptionSignalement, setDescriptionSignalement] = useState("");
    const [photoSignalement, setPhotoSignalement] = useState(undefined);

    //Variables de permissions
    const [cameraPermission, setCameraPermission] = useState(false);
    const [LibrairiesPermission, setLibrairiesPermission] = useState(null);

    //Variables d'erreurs
    const [titreError, setTitreError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [photoError, setPhotoError] = useState(false);

    //Variables pour le loader
    const [isLoading, setIsLoading] = useState(false);

    // ActionSheet
    const { showActionSheetWithOptions } = useActionSheet();

    /**
     * Fonction pour choisir entre prendre une photo ou choisir une photo utilisant l'actionSheet
     */
    const choixPhoto = () => {
      showActionSheetWithOptions(
        {
          options: [
            translate("pageNouveauSignalement.actionSheet.prendrePhoto"),
            translate("pageNouveauSignalement.actionSheet.choisirPhoto"),
            translate("pageNouveauSignalement.actionSheet.annuler"),
          ],
          cancelButtonIndex: 2,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            prendrePhoto();
          } else if (buttonIndex === 1) {
            choisirPhoto();
          }
        },
      );
    };

    /**
     * Fonction pour prendre une photo avec la caméra si la permission est accordée sinon demande la permission
     * @returns {void}
     * @async
     * @function prendrePhoto
     */
    const prendrePhoto = async (): Promise<void> => {
      //Si la permission est déjà accordée
      if (cameraPermission) {
        let photo = await ImagePicker.launchCameraAsync();
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      }
      // Si la permission n'est pas accordée, demande la permission
      else {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.granted) {
          setCameraPermission(true);
          let photo = await ImagePicker.launchCameraAsync();
          if (!photo.canceled) {
            setPhotoSignalement(photo.assets[0].uri);
          }
        }
      }
    };

    /**
     * Fonction pour choisir une photo dans la librairie
     * @returns {void}
     * @async
     * @function choisirPhoto
     */
    const choisirPhoto = async (): Promise<void> => {
      //Si la permission est déjà accordée
      if (LibrairiesPermission) {
        let photo = await ImagePicker.launchImageLibraryAsync();
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      }
      // Si la permission n'est pas accordée, demande la permission
      else {
        const LibrairiesStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (LibrairiesStatus.granted) {
          setLibrairiesPermission(true);
          let photo = await ImagePicker.launchImageLibraryAsync();
          if (!photo.canceled) {
            setPhotoSignalement(photo.assets[0].uri);
          }
        }
      }
    };

    /**
     * Fonction pour envoyer le signalement en base de données et vérification des champs
     * @returns {void}
     * @function envoyerSignalement
     */
    const verifSignalement = (
      titreSignalement: string,
      descriptionSignalement: string,
      photoSignalement: string,
    ): boolean => {
      let contientErreur = false;
      // Regex pour vérifier si les champs sont corrects et contiennent uniquement des caractères autorisés
      const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*-+,.:;"]+$/;

      // Vérification du titre
      if (
        titreSignalement === "" ||
        !regex.test(titreSignalement) ||
        titreSignalement.length < 3 ||
        titreSignalement.length > 50
      ) {
        setTitreError(true);
        contientErreur = true;
      } else {
        setTitreError(false);
      }

      // Vérification de la description
      if (
        descriptionSignalement === "" ||
        !regex.test(descriptionSignalement) ||
        descriptionSignalement.length < 10 ||
        descriptionSignalement.length > 1000
      ) {
        setDescriptionError(true);
        contientErreur = true;
      } else {
        setDescriptionError(false);
      }

      // Vérification de la photo
      if (photoSignalement === undefined || photoSignalement === null) {
        setPhotoError(true);
        contientErreur = true;
      } else {
        setPhotoError(false);
      }
      return contientErreur;
    };

    /**
     * fonction pour afficher une alerte en fonction du status de fin de l'envoi du signalement
     * @param status
     */
    const AlerteStatus = (
      status: "envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur" | "mauvaisFormat",
    ) => {
      if (status == "ajouteEnLocal") {
        Alert.alert(
          translate("pageNouveauSignalement.alerte.ajouteEnLocal.titre"),
          "Votre signalement a bien été ajouté en mémoire, il sera envoyé lorsque vous serez connecté à internet",
          [
            { text: translate("pageNouveauSignalement.alerte.ajouteEnLocal.boutons.ajoute") },
            {
              text: translate("pageNouveauSignalement.alerte.ajouteEnLocal.boutons.retour"),
              onPress: () => props.navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
      } else if (status == "dejaExistant") {
        Alert.alert(
          translate("pageNouveauSignalement.alerte.dejaExistant.titre"),
          translate("pageNouveauSignalement.alerte.dejaExistant.message"),
          [{ text: "OK" }],
          { cancelable: false },
        );
      } else if (status == "mauvaisFormat") {
        Alert.alert(
          translate("pageNouveauSignalement.alerte.mauvaisFormat.titre"),
          translate("pageNouveauSignalement.alerte.mauvaisFormat.message"),
          [{ text: "OK" }],
          { cancelable: false },
        );
      } else if (status == "envoyeEnBdd") {
        Alert.alert(
          translate("pageNouveauSignalement.alerte.envoyeEnBdd.titre"),
          translate("pageNouveauSignalement.alerte.envoyeEnBdd.message"),
          [
            { text: translate("pageNouveauSignalement.alerte.envoyeEnBdd.boutons.ajoute") },
            {
              text: translate("pageNouveauSignalement.alerte.envoyeEnBdd.boutons.retour"),
              onPress: () => props.navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          translate("pageNouveauSignalement.alerte.erreur.titre"),
          translate("pageNouveauSignalement.alerte.erreur.message"),
          [{ text: "OK" }],
          { cancelable: false },
        );
      }
    };

    /**
     * Fonction pour envoyer le signalement en base de données
     * @returns {void}
     * @async
     * @function envoyerSignalement
     */
    const envoyerSignalement = async (
      titreSignalement: string,
      type: TTypeSignalement,
      descriptionSignalement: string,
      photoSignalement: string,
      lat: number,
      lon: number,
      synchroMontanteStore: SynchroMontanteStore,
    ): Promise<void> => {
      const contientErreur = verifSignalement(
        titreSignalement,
        descriptionSignalement,
        photoSignalement,
      );

      const signalementAEnvoyer: TSignalement = {
        nom: titreSignalement,
        type: type,
        description: descriptionSignalement,
        image: photoSignalement,
        lat: lat,
        lon: lon,
      };

      let status: "envoyeEnBdd" | "ajouteEnLocal" | "dejaExistant" | "erreur" | "mauvaisFormat";
      try {
        if (!contientErreur) {
          setIsLoading(true);
          status = await synchroMontanteSignalement(signalementAEnvoyer, synchroMontanteStore);
        } else {
          status = "mauvaisFormat";
        }
      } catch (error) {
        console.error("[NouveauSignalementScreen -> envoyerSignalement] Erreur :", error);
        status = "erreur";
      } finally {
        setIsLoading(false);
        if (status == "ajouteEnLocal" || status == "envoyeEnBdd") {
          setTitreSignalement("");
          setDescriptionSignalement("");
          setPhotoSignalement(undefined);
        }
        AlerteStatus(status);
      }
    };

    return isLoading ? (
      <Screen style={$containerLoader} preset="fixed" safeAreaEdges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={colors.palette.vert} />
      </Screen>
    ) : (
      <View style={$view}>
        <TouchableOpacity style={$boutonRetour} onPress={() => goBack()}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
        <Screen style={$container} preset="scroll" safeAreaEdges={["top", "bottom"]}>
          <Text
            style={$h1}
            tx={
              type === "Avertissement"
                ? "pageNouveauSignalement.titreAvertissement"
                : "pageNouveauSignalement.titrePointInteret"
            }
            size="xxl"
          />
          <Text text="Col de la marmotte" size="lg" />
          {titreError && (
            <Text
              tx="pageNouveauSignalement.erreur.titre"
              size="xs"
              style={{ color: colors.palette.rouge }}
            />
          )}
          <TextInput
            placeholder={translate("pageNouveauSignalement.placeholderTitre")}
            placeholderTextColor={titreError ? colors.palette.rouge : colors.text}
            onChangeText={setTitreSignalement}
            value={titreSignalement}
            style={[
              { ...$inputTitre },
              titreError
                ? { borderColor: colors.palette.rouge }
                : { borderColor: colors.palette.vert },
            ]}
          />
          {descriptionError && (
            <Text
              tx="pageNouveauSignalement.erreur.description"
              size="xs"
              style={{ color: colors.palette.rouge }}
            />
          )}
          <TextInput
            placeholder={translate("pageNouveauSignalement.placeholderDescription")}
            placeholderTextColor={descriptionError ? colors.palette.rouge : colors.text}
            onChangeText={setDescriptionSignalement}
            multiline={true}
            value={descriptionSignalement}
            style={[
              { ...$inputDescription },
              descriptionError
                ? { borderColor: colors.palette.rouge }
                : { borderColor: colors.palette.vert },
            ]}
          />
          <View>
            {photoError && !photoSignalement && (
              <Text tx="pageNouveauSignalement.erreur.photo" size="xs" style={$imageError} />
            )}
            {photoSignalement && <Image source={{ uri: photoSignalement }} style={$image} />}
            <TouchableOpacity style={$boutonContainer} onPress={() => choixPhoto()}>
              <Image
                style={{ tintColor: colors.palette.vert }}
                source={require("../../assets/icons/camera.png")}
              />
              <Text tx="pageNouveauSignalement.boutons.photo" size="xs" style={$textBoutonPhoto} />
            </TouchableOpacity>
            <Button
              style={$bouton}
              tx="pageNouveauSignalement.boutons.valider"
              onPress={() =>
                envoyerSignalement(
                  titreSignalement,
                  type,
                  descriptionSignalement,
                  photoSignalement,
                  // WARNING A CHANGER AVEC LA LOCALISATION REELLE DE L'UTILISATEUR
                  42.666,
                  0.1034,
                  synchroMontanteStore,
                )
              }
              textStyle={$textBouton}
            />
          </View>
        </Screen>
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const { width } = Dimensions.get("window");

const $view: ViewStyle = {
  flex: 1,
};

const $container: ViewStyle = {
  paddingRight: spacing.sm,
  paddingLeft: spacing.sm,
};

const $containerLoader: ViewStyle = {
  ...$container,
  justifyContent: "center",
  alignItems: "center",
};

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.lg,
  width: 50,
  position: "absolute",
  top: 0,
  zIndex: 1,
};

const $h1: TextStyle = {
  marginTop: 50,
  textAlign: "center",
  marginBottom: spacing.sm,
};

const $inputTitre: TextStyle = {
  borderRadius: spacing.sm,
  padding: spacing.sm,
  borderWidth: 1,
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
};

const $inputDescription: TextStyle = {
  ...$inputTitre,
  height: 200,
};

const $image: ImageStyle = {
  width: "100%",
  height: width,
  marginBottom: spacing.sm,
  marginTop: spacing.sm,
  borderRadius: spacing.sm,
};

const $imageError: TextStyle = {
  color: colors.palette.rouge,
  marginBottom: spacing.sm,
};

const $boutonContainer: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  alignSelf: "center",
  marginBottom: spacing.sm,
};

const $textBoutonPhoto: TextStyle = {
  color: colors.palette.marron,
  marginLeft: spacing.sm,
};

const $bouton: TextStyle = {
  marginBottom: spacing.sm,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.blanc,
  borderWidth: 2,
  borderColor: colors.palette.vert,
};

const $textBouton: TextStyle = {
  color: colors.palette.vert,
};
