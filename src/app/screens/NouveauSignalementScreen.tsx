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
import { AppStackScreenProps, T_TypeSignalement, T_Signalement } from "app/navigators";
import { colors, spacing } from "app/theme";
import * as ImagePicker from "expo-image-picker";
import { useStores } from "app/models";
import { TStatus, synchroMontanteSignalement } from "app/services/synchroMontanteService";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { translate } from "app/i18n";
// Composants
import { Button, Screen, Text } from "app/components";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: T_TypeSignalement;
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    // Stores
    const { synchroMontante } = useStores();

    //type de signalement
    var type = props.route.params?.type;
    if (type === undefined) {
      throw new Error("[NouveauSignalementScreen] Type de signalement non défini");
    }

    // Saisies
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(undefined);

    // Erreurs
    const [titreErreur, setTitreErreur] = useState(false);
    const [descriptionErreur, setDescriptionErreur] = useState(false);
    const [photoErreur, setPhotoErreur] = useState(false);

    // Loader
    const [isLoading, setIsLoading] = useState(false);

    // ActionSheet
    const { showActionSheetWithOptions } = useActionSheet();

    /**
     * Fonction qui aguille l'utilisateur pour ajouter une photo à son signalement
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
            choisirImage();
          }
        },
      );
    };

    /**
     * Fonction pour prendre une photo avec la caméra si la permission est accordée sinon demande la permission
     */
    const prendrePhoto = async (): Promise<void> => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.granted) {
        const photo = await ImagePicker.launchCameraAsync();
        if (!photo.canceled) {
          setImage(photo.assets[0].uri);
        }
      }
    };

    /**
     * Fonction pour choisir une photo dans la librairie
     */
    const choisirImage = async (): Promise<void> => {
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (mediaPermission.granted) {
        const photo = await ImagePicker.launchImageLibraryAsync();
        if (!photo.canceled) {
          setImage(photo.assets[0].uri);
        }
      }
    };

    /**
     * Indique si les informations du signalement sont correctes (tailles de champs, caractères autorisés et photo OK)
     */
    const verifSaisies = (): boolean => {
      let saisieBonne = true;

      // Regex pour vérifier si les champs sont corrects et contiennent uniquement des caractères autorisés
      const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*-+,.:;"]+$/;

      // Vérification du titre
      if (titre === "" || !regex.test(titre) || titre.length < 3 || titre.length > 50) {
        setTitreErreur(true);
        saisieBonne = false;
      } else {
        setTitreErreur(false);
      }

      // Vérification de la description
      if (
        description === "" ||
        !regex.test(description) ||
        description.length < 10 ||
        description.length > 1000
      ) {
        setDescriptionErreur(true);
        saisieBonne = false;
      } else {
        setDescriptionErreur(false);
      }

      // Vérification de la photo
      if (!image) {
        setPhotoErreur(true);
        saisieBonne = false;
      } else {
        setPhotoErreur(false);
      }
      return saisieBonne;
    };

    /**
     * fonction pour afficher une alerte en fonction du status de fin de l'envoi du signalement
     */
    const AlerteStatus = (status: TStatus) => {
      switch (status) {
        case "ajouteEnLocal":
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
          break;

        case "dejaExistant":
          Alert.alert(
            translate("pageNouveauSignalement.alerte.dejaExistant.titre"),
            translate("pageNouveauSignalement.alerte.dejaExistant.message"),
            [{ text: "OK" }],
            { cancelable: false },
          );
          break;

        case "envoyeEnBdd":
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
          break;

        case "erreur":
          Alert.alert(
            translate("pageNouveauSignalement.alerte.erreur.titre"),
            translate("pageNouveauSignalement.alerte.erreur.message"),
            [{ text: "OK" }],
            { cancelable: false },
          );
          break;
      }
    };

    /**
     * Fonction pour envoyer le signalement en base de données
     */
    const envoyerSignalement = async (signalement: T_Signalement): Promise<void> => {
      const signalementValide = verifSaisies();

      if (signalementValide) {
        setIsLoading(true);
        const status = await synchroMontanteSignalement(signalement, synchroMontante);
        setIsLoading(false);

        if (status === "ajouteEnLocal" || status === "envoyeEnBdd") {
          setTitre("");
          setDescription("");
          setImage(undefined);
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
        <TouchableOpacity style={$boutonRetour} onPress={() => props.navigation.goBack()}>
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
          {titreErreur && (
            <Text
              tx="pageNouveauSignalement.erreur.titre"
              size="xs"
              style={{ color: colors.palette.rouge }}
            />
          )}
          <TextInput
            placeholder={translate("pageNouveauSignalement.placeholderTitre")}
            placeholderTextColor={titreErreur ? colors.palette.rouge : colors.text}
            onChangeText={setTitre}
            value={titre}
            style={[
              { ...$inputTitre },
              titreErreur
                ? { borderColor: colors.palette.rouge }
                : { borderColor: colors.palette.vert },
            ]}
          />
          {descriptionErreur && (
            <Text
              tx="pageNouveauSignalement.erreur.description"
              size="xs"
              style={{ color: colors.palette.rouge }}
            />
          )}
          <TextInput
            placeholder={translate("pageNouveauSignalement.placeholderDescription")}
            placeholderTextColor={descriptionErreur ? colors.palette.rouge : colors.text}
            onChangeText={setDescription}
            multiline={true}
            value={description}
            style={[
              { ...$inputDescription },
              descriptionErreur
                ? { borderColor: colors.palette.rouge }
                : { borderColor: colors.palette.vert },
            ]}
          />
          <View>
            {photoErreur && !image && (
              <Text tx="pageNouveauSignalement.erreur.photo" size="xs" style={$imageError} />
            )}
            <TouchableOpacity style={$boutonContainer} onPress={() => choixPhoto()}>
              <Image
                style={{ tintColor: colors.palette.vert }}
                source={require("../../assets/icons/camera.png")}
              />
              <Text tx="pageNouveauSignalement.boutons.photo" size="xs" style={$textBoutonPhoto} />
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={$image} />}
            <Button
              style={$bouton}
              tx="pageNouveauSignalement.boutons.valider"
              onPress={() =>
                envoyerSignalement({
                  titre,
                  type,
                  description,
                  image,
                  // WARNING A CHANGER AVEC LA LOCALISATION REELLE DE L'UTILISATEUR
                  lat: 42.666,
                  lon: 0.1034,
                  post_id: 2049,
                })
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