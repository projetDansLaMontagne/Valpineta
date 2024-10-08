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
import {
  AppStackScreenProps,
  T_type_signalement,
  T_flat_point,
  T_signalement,
} from "app/navigators";
import { colors, spacing } from "app/theme";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { translate } from "app/i18n";
// Composants
import { Button, Screen, Text } from "app/components";
import { EtatSynchro, useStores } from "app/models";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: T_type_signalement;
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    //type de signalement
    let type = props.route.params?.type;
    if (type === undefined) {
      throw new Error("[NouveauSignalementScreen] Type de signalement non défini");
    }

    // Saisies
    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(undefined);

    // Erreurs
    const [nomErreur, setNomErreur] = useState(false);
    const [descriptionErreur, setDescriptionErreur] = useState(false);
    const [photoErreur, setPhotoErreur] = useState(false);

    // Loader
    const [isLoading, setIsLoading] = useState(false);

    // ActionSheet
    const { showActionSheetWithOptions } = useActionSheet();

    /** @todo STATIC, a remplacer par le store */
    const SuiviExcursion = { etat: "enCours", trackSuivi: [] as T_flat_point[], iPointCourant: 0 };
    const { synchroMontante } = useStores();

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
    const saisiesValides = (nom: string, description: string, image: string): boolean => {
      let saisieBonne = true;

      // Regex pour vérifier si les champs sont corrects et contiennent uniquement des caractères autorisés
      const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*-+,.:;"]+$/;

      // Vérification du nom
      if (nom === "" || !regex.test(nom) || nom.length < 3 || nom.length > 50) {
        setNomErreur(true);
        saisieBonne = false;
      } else {
        setNomErreur(false);
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
    const AlerteStatus = (status: EtatSynchro) => {
      switch (status) {
        case EtatSynchro.BienEnvoye:
          Alert.alert("Reussite !", "Votre signalement a bien été enregistré", [], {
            cancelable: true,
          });
          break;

        case EtatSynchro.NonConnecte:
          Alert.alert(
            "Hors connexion",
            "Votre signalement sera automatiquement enregistré lors de votre prochaine connexion (duree du cycle parametrable)",
            [],
            { cancelable: true },
          );
          break;

        case EtatSynchro.ErreurServeur:
          Alert.alert(
            "Erreur serveur",
            "Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer plus tard.",
            [],
            { cancelable: true },
          );
          break;
      }
    };

    /**
     * Fonction pour envoyer le signalement en base de données
     */
    const envoyerSignalement = async (
      nom: string,
      type: T_type_signalement,
      description: string,
      image: string,
    ) => {
      if (SuiviExcursion.etat === "enCours") {
        if (saisiesValides(nom, description, image)) {
          //Conversion de l'image url en base64
          const blob = await fetch(image).then(response => response.blob());
          const pointCourant = SuiviExcursion.trackSuivi[SuiviExcursion.iPointCourant];

          // Fabrication du nouveau signalement
          const newSignalement: T_signalement = {
            nom,
            type,
            description,
            image: await blobToBase64(blob),
            lat: pointCourant.lat,
            lon: pointCourant.lon,
          };

          setIsLoading(true);
          synchroMontante.addSignalement(newSignalement);
          const status = await synchroMontante.tryToPush();
          setIsLoading(false);

          AlerteStatus(status);
          props.navigation.goBack();
        }
      } else {
        console.error(
          "[NouveauSignalement] ERREUR : impossible de creer un signalement sans etre en randonnee",
        );
      }
    };

    return isLoading ? (
      <Screen
        style={{ justifyContent: "center", alignItems: "center" }}
        preset="fixed"
        safeAreaEdges={["top", "bottom"]}
      >
        <ActivityIndicator size="large" color={colors.palette.vert} />
      </Screen>
    ) : (
      <Screen style={$container} preset="scroll" safeAreaEdges={["top", "bottom"]}>
        <TouchableOpacity style={$boutonRetour} onPress={() => props.navigation.goBack()}>
          <Image
            style={{ tintColor: colors.bouton }}
            source={require("../../assets/icons/back.png")}
          />
        </TouchableOpacity>
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
        {nomErreur && (
          <Text
            text="pageNouveauSignalement.erreur.titre"
            size="xs"
            style={{ color: colors.palette.rouge }}
          />
        )}
        <TextInput
          placeholder={translate("pageNouveauSignalement.placeholderNom")}
          placeholderTextColor={nomErreur ? colors.palette.rouge : colors.text}
          onChangeText={setNom}
          value={nom}
          style={[
            { ...$inputnom },
            nomErreur
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
            onPress={() => {
              envoyerSignalement(nom, type, description, image);
            }}
            textStyle={$textBouton}
          />
        </View>
      </Screen>
    );
  },
);

/**
 * Transforme un blob en base64
 * @param blob
 * @returns blob en base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            "[SynchroMontanteService -> blobToBase64 ]Conversion Blob vers Base64 a échoué.",
          ),
        );
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const { width } = Dimensions.get("window");

const $container: ViewStyle = {
  paddingRight: spacing.sm,
  paddingLeft: spacing.sm,
};

const $boutonRetour: ViewStyle = {
  backgroundColor: colors.fond,
  borderWidth: 1,
  borderColor: colors.bordure,
  borderRadius: 10,
  padding: spacing.sm,
  margin: spacing.md,
  width: 50,
  top: 0,
  zIndex: 1,
};

const $h1: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.sm,
};

const $inputnom: TextStyle = {
  borderRadius: spacing.sm,
  padding: spacing.sm,
  borderWidth: 1,
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
};

const $inputDescription: TextStyle = {
  ...$inputnom,
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
