// Librairies
import React, { FC, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { TextStyle, TextInput, Image, View, Dimensions, ViewStyle, Alert, ActivityIndicator } from "react-native";
import { AppStackScreenProps } from "app/navigators";
import { colors, spacing } from "app/theme";
import { Button, TextField } from "app/components";
import * as ImagePicker from "expo-image-picker";
import { RootStore, SynchroMontanteStore, useStores } from "app/models";
import { synchroMontante } from "app/services/synchroMontante/synchroMontanteService"
import NetInfo from '@react-native-community/netinfo';

// Composants
import { Screen, Text } from "app/components";

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: "avertissement" | "pointInteret";
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    // Stores
    const { parametres, synchroMontanteStore } = useStores(); 

    //type de signalement
    let type = "";
    if (props.route.params) {
      type = props.route.params.type;
    } else {
      throw new Error("Type de signalement non défini");
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

    const [ status, setStatus ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);

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

    const AlerteStatus = (status: string) => {
      if (status == "ajoute") { 
      Alert.alert(

        "Ajout réussi",
        "Votre signalement a bien été ajouté",
        [
          { text: "Ajouter un autre" },
          { text: "Retour", onPress: () => props.navigation.goBack() }
        ],
        { cancelable: false }
      )
      }
      else if (status == "existe") {
        Alert.alert(
          "SIgnalement déjà existant",
          "Votre signalement existe déjà dans la base de données",
          [
            { text: "OK" }
          ],
          { cancelable: false }
        )
      }
      else if (status == "format") {
        Alert.alert(
          "Format incorrect",
          "Veuillez vérifier les champs de votre signalement",
          [
            { text: "OK" }
          ],
          { cancelable: false }
        )
      }
    }

    /**
     * Fonction pour envoyer le signalement en base de données
     * @returns {void}
     * @async
     * @function envoyerSignalement
     */
    const envoyerSignalement = async ( titreSignalement:string , descriptionSignalement:string, photoSignalement:string , synchroMontanteStore:SynchroMontanteStore): Promise<void> => {
      
      let status: string = "En attente";

      // Vérification des champs
      verifSignalement();

      // Si les champs sont corrects
      if (!titreError && !descriptionError && !photoError) {

        setIsLoading(true);
        status = await synchroMontante(titreSignalement, descriptionSignalement, photoSignalement, synchroMontanteStore) as string;
        setIsLoading(false);

      } else {
        status = "format";
        AlerteStatus(status);
      }

      AlerteStatus(status);
    };

    useEffect(() => {
      verifSignalement();
    }, [titreSignalement, descriptionSignalement, photoSignalement]);

    // Utilisation d'effets secondaires pour déclencher la vérification des erreurs après chaque modification d'état

    return (
      isLoading ?
      <Screen style={$containerLoader} preset="fixed" safeAreaEdges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={colors.palette.vert} />
      </Screen>
      :
      <Screen style={$container} preset="scroll" safeAreaEdges={["top", "bottom"]}>
        <Text
          style={$h1}
          tx={
            type === "avertissement"
              ? "pageNouveauSignalement.titreAvertissement"
              : "pageNouveauSignalement.titrePointInteret"
          }
          size="xxl"
        />
        <Text text="Track : Col de la marmotte" size="lg" />
        <Text tx="pageNouveauSignalement.consigne" size="sm" />
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
          <View style={$boutonContainer}>
            <Button
              style={$bouton}
              tx="pageNouveauSignalement.boutons.photo"
              onPress={prendrePhoto}
              textStyle={$textBouton}
            />
            <Button
              style={$bouton}
              tx="pageNouveauSignalement.boutons.librairie"
              onPress={choisirPhoto}
              textStyle={$textBouton}
            />
          </View>
          <Button
            style={$bouton}
            tx="pageNouveauSignalement.boutons.valider"
            onPress={() => 
              envoyerSignalement(titreSignalement, descriptionSignalement, photoSignalement, synchroMontanteStore)
            }
            textStyle={$textBouton}
          />
        </View>
        <Text text={status} size="md" />
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

const $containerLoader: ViewStyle = {
  ...$container,
  justifyContent: "center",
  alignItems: "center",
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
