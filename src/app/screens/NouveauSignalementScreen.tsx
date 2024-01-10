// Librairies
import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { TextStyle, TextInput, Image, View, Dimensions, ViewStyle } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Button } from "app/components";
import * as ImagePicker from "expo-image-picker";

// Composants
import { Screen, Text } from "app/components";
import en from "app/i18n/en";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: string;
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    //type de signalement
    let type = "signalement";
    if (props.route.params) {
      type = props.route.params.type;
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

    /**
     * Fonction pour prendre une photo avec la caméra
     * @returns {void}
     * @async
     * @function prendrePhoto
     */
    const prendrePhoto = async (): Promise<void> => {
      // On vétifie si l'application a accès à la caméra
      if (cameraPermission) {
        let photo = await ImagePicker.launchCameraAsync();
        // On vérifie si l'utilisateur a annulé la prise de photo
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      } else {
        // On demande l'accès à la caméra
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.granted) {
          // Si l'accès est accordé, on met la variable à true
          setCameraPermission(true);
          // On ouvre la caméra
          let photo = await ImagePicker.launchCameraAsync();
          // On vérifie si l'utilisateur a annulé la prise de photo
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
      // On vérifie si l'application a accès à la librairie
      if (LibrairiesPermission) {
        let photo = await ImagePicker.launchImageLibraryAsync();
        // On vérifie si l'utilisateur a annulé la prise de photo
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri);
        }
      } else {
        // On demande l'accès à la librairie
        const LibrairiesStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // Si l'accès est accordé, on met la variable à true
        if (LibrairiesStatus.granted) {
          setLibrairiesPermission(true);
          // On ouvre la librairie
          let photo = await ImagePicker.launchImageLibraryAsync();
          // On vérifie si l'utilisateur a annulé la prise de photo
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
    const verifSignalement = (): void => {
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
      } else {
        setDescriptionError(false);
      }

      // Vérification de la photo
      if (photoSignalement === undefined || photoSignalement === null) {
        setPhotoError(true);
      } else {
        // Vérification de la taille de la photo (max 5Mo) ainsi que du format
        const imageFormats = ["jpg", "jpeg", "png", "gif"]; // Liste des formats autorisés
        const extension = photoSignalement.split(".").pop().toLowerCase();
        if (!imageFormats.includes(extension)) {
          setPhotoError(true);
        } else {
          setPhotoError(false);
        }
      }
    };

    /**
     * Fonction pour envoyer le signalement en base de données
     * @returns {void}
     * @async
     * @function envoyerSignalement
     */
    const envoyerSignalement = () => {
      // Vérification des champs
      verifSignalement();

      // Si les champs sont corrects
      if (!titreError && !descriptionError && !photoError) {
        // On envoie le signalement en base de données
        console.log("Signalement envoyé");
      } else {
        console.log("Signalement non envoyé");
      }
    };

    // Utilisation d'effets secondaires pour déclencher la vérification des erreurs après chaque modification d'état
    useEffect(() => {
      verifSignalement();
    }, [titreSignalement, descriptionSignalement, photoSignalement]);

    return (
      <Screen style={$container} preset="scroll" safeAreaEdges={["top", "bottom"]}>
        <Text
          style={$h1}
          text={type === "signalement" ? "Nouveau signalement" : "Nouveau Point d'interet"}
          size="xxl"
        />
        <Text text="Track : Col de la marmotte" size="lg" />
        <Text text="Insérez un titre et une description" size="sm" />
        {titreError && (
          <Text
            text="Le titre doit contenir entre 3 et 50 caractères et ne doit pas contenir de caractères spéciaux"
            size="sm"
            style={{ color: colors.palette.rouge }}
          />
        )}
        <TextInput
          placeholder="Insérez un titre"
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
            text="La description doit contenir entre 10 et 1000 caractères et ne doit pas contenir de caractères spéciaux"
            size="sm"
            style={{ color: colors.palette.rouge }}
          />
        )}
        <TextInput
          placeholder="Insérez une description"
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
            <Text
              text="Veuillez ajouter une photo dans un des formats : jpg, jpeg, png, gif avec une taille maximum de 5 mo"
              size="sm"
              style={$imageError}
            />
          )}
          {photoSignalement && <Image source={{ uri: photoSignalement }} style={$image} />}
          <View style={$boutonContainer}>
            <Button
              style={$bouton}
              text="Prendre une photo"
              onPress={prendrePhoto}
              textStyle={$textBouton}
            />
            <Button
              style={$bouton}
              text="Choisir une photo"
              onPress={choisirPhoto}
              textStyle={$textBouton}
            />
          </View>
          <Button
            style={$bouton}
            text="Envoyer"
            onPress={envoyerSignalement}
            textStyle={$textBouton}
          />
        </View>
      </Screen>
    );
  },
);

// Styles

const { width } = Dimensions.get("window");

const $container: ViewStyle = {
  paddingRight: spacing.sm,
  paddingLeft: spacing.sm,
};

const $h1: TextStyle = {
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

const $image: TextStyle = {
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
  justifyContent: "space-around",
  flexDirection: "row",
};

const $bouton: TextStyle = {
  marginBottom: spacing.sm,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.vert,
};

const $textBouton: TextStyle = {
  color: colors.palette.blanc,
};
