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
import { AppStackScreenProps } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Button } from "app/components";
import * as ImagePicker from "expo-image-picker";
import { SynchroMontanteStore, useStores } from "app/models";
import { synchroMontante } from "app/services/synchroMontante/synchroMontanteService";
import { goBack } from "app/navigators";
import {useActionSheet } from "@expo/react-native-action-sheet";
// Composants
import { Screen, Text } from "app/components";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: "Avertissement" | "PointInteret";
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    // Stores
    const { parametres, synchroMontanteStore } = useStores();

    //type de signalement
    let type = "" as string;
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
     * Fonction pour choisir entre prendre une photo ou choisir une photo dans la librairie
     */
    const choixPhoto = () => {
      showActionSheetWithOptions(
        {
          options: parametres.langues == "fr" ? ["Prendre une photo", "Choisir une photo", "Annuler"] : ["Tomar una foto", "Elegir una foto", "Cancelar"],
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
     * Fonction pour prendre une photo avec la caméra
     * @returns {void}
     * @async
     * @function prendrePhoto
     */
    const prendrePhoto = async (): Promise<void> => {
      if (cameraPermission) {
        let photo = await ImagePicker.launchCameraAsync();
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      } else {
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
      if (LibrairiesPermission) {
        let photo = await ImagePicker.launchImageLibraryAsync();
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      } else {
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
     * fonction pour afficher une alerte en fonction du status
     * @param status 
     */
    const AlerteStatus = (status: string) => {
      if (status == "ajoute") {
        if (parametres.langues == "fr") {
          Alert.alert(
            "Ajout réussi",
            "Votre signalement a bien été ajouté en mémoire, il sera envoyé lorsque vous serez connecté à internet",
            [
              { text: "Ajouter un autre" },
              { text: "Retour", onPress: () => props.navigation.goBack() },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            "Añadido con éxito",
            "Su informe ha sido agregado a la memoria, se enviará cuando esté conectado a Internet",
            [{ text: "Añadir otro" }, { text: "Volver", onPress: () => props.navigation.goBack() }],
            { cancelable: false },
          );
        }
      } else if (status == "existe") {
        if (parametres.langues == "fr") {
          Alert.alert(
            "Signalement déjà existant",
            "Ce signalement existe déjà en base de données, veuillez en choisir un autre",
            [{ text: "OK" }],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            "Informe ya existente",
            "Este informe ya existe en la base de datos, elija otro",
            [{ text: "OK" }],
            { cancelable: false },
          );
        }
      } else if (status == "format") {
        if (parametres.langues == "fr") {
          Alert.alert(
            "Format incorrect",
            "Veuillez vérifier que les champs sont correctement remplis",
            [{ text: "OK" }],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            "Formato incorrecto",
            "Verifique que los campos estén completados correctamente",
            [{ text: "OK" }],
            { cancelable: false },
          );
        }
      } else if (status == "envoye") {
        if (parametres.langues == "fr") {
          Alert.alert(
            "Signalement envoyé",
            "Votre signalement a bien été envoyé en base de données",
            [
              { text: "Ajouter un autre" },
              { text: "Retour", onPress: () => props.navigation.goBack() },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            "Informe enviado",
            "Su informe ha sido enviado a la base de datos",
            [
              { text: "Añadir otro" },
              { text: "Volver", onPress: () => props.navigation.goBack() },
            ],
            { cancelable: false },
          );
        }
      } else if (status == "erreurBDD") {
        if (parametres.langues == "fr") {
          Alert.alert(
            "Erreur",
            "Une erreur est survenue lors de l'envoi du signalement en base de données",
            [{ text: "OK" }],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            "Error",
            "Se produjo un error al enviar el informe a la base de datos",
            [{ text: "OK" }],
            { cancelable: false },
          );
        }
      } else {
        if (parametres.langues == "fr") {
          Alert.alert("Erreur", "Une erreur est survenue", [{ text: "OK" }], { cancelable: false });
        } else {
          Alert.alert("Error", "Se produjo un error", [{ text: "OK" }], { cancelable: false });
        }
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
      type: string,
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
    
      let status = "" as string;
      try {
        if (!contientErreur) {
          setIsLoading(true);
          status = await synchroMontante(
            titreSignalement,
            type,
            descriptionSignalement,
            photoSignalement,
            lat,
            lon,
            synchroMontanteStore,
          );
        } else {
          status = "format";
        }
      } catch (error) {
        console.error("[NouveauSignalementScreen -> envoyerSignalement] Erreur :", error);
        status = "erreur"; 
      } finally {
        setIsLoading(false);
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
              placeholder={parametres.langues == "fr" ? "Insérez un titre" : "Insertar un título"}
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
              placeholder={
                parametres.langues == "fr" ? "Insérez une description" : "Insertar una descripción"
              }
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
                  <Text
                    tx="pageNouveauSignalement.boutons.photo"
                    size="xs"
                    style={$textBoutonPhoto}
                  />
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
                    // WARNING A CHANGER AVEC LA LOCALISATION
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
