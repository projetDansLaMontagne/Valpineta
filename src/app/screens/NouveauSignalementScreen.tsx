// Librairies
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, TextInput, Image, View, Dimensions, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { Button } from "app/components"
import * as ImagePicker from "expo-image-picker"

// Composants
import { Screen, Text } from "app/components"

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {
  type: string
}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen(props) {
    //type de signalement
    let type = "signalement"
    if (props.route.params) {
      type = props.route.params.type
    }

    // Variables
    const [titreSignalement, setTitreSignalement] = useState("")
    const [descriptionSignalement, setDescriptionSignalement] = useState("")
    const [photoSignalement, setPhotoSignalement] = useState(undefined)

    const [cameraPermission, setCameraPermission] = useState(false)
    const [LibrairiesPermission, setLibrairiesPermission] = useState(null)

    //Variables d'erreurs
    const [titreError, setTitreError] = useState(false)
    const [descriptionError, setDescriptionError] = useState(false)
    const [photoError, setPhotoError] = useState(false)

    //Fonction pour prendre une photo
    const prendrePhoto = async () => {
      if (cameraPermission) {
        let photo = await ImagePicker.launchCameraAsync()
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri)
        }
      } else {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
        if (cameraStatus.granted) {
          setCameraPermission(true)
          let photo = await ImagePicker.launchCameraAsync()
          if (!photo.canceled) {
            setPhotoSignalement(photo.assets[0].uri)
          }
        }
      }
    }

    //Fonction pour choisir une photo
    const choisirPhoto = async () => {
      if (LibrairiesPermission) {
        let photo = await ImagePicker.launchImageLibraryAsync()
        if (!photo.canceled) {
          setPhotoSignalement(photo.assets[0].uri)
        }
      } else {
        const LibrairiesStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (LibrairiesStatus.granted) {
          setLibrairiesPermission(true)
          let photo = await ImagePicker.launchImageLibraryAsync()
          if (!photo.canceled) {
            setPhotoSignalement(photo.assets[0].uri)
          }
        }
      }
    }

    const envoyerSignalement = () => {

      const regex = /^[a-zA-Z0-9\u00C0-\u00FF\s'’!$%^*-+,.:;"]+$/;


      if (
        titreSignalement === "" ||
        !regex.test(titreSignalement) ||
        titreSignalement.length < 3 ||
        titreSignalement.length > 50
      ) {
        setTitreError(true)
      } else {
        setTitreError(false)
      }

      if (
        descriptionSignalement === "" ||
        !regex.test(descriptionSignalement) ||
        descriptionSignalement.length < 10 ||
        descriptionSignalement.length > 1000
      ) {
        setDescriptionError(true)
      } else {
        setDescriptionError(false)
      }

      if (photoSignalement === undefined || photoSignalement === null) {
        setPhotoError(true)
      } else {
        // Vérification de la taille de la photo (max 5Mo) ainsi que du format
        const imageFormats = ["jpg", "jpeg", "png", "gif"] // Liste des formats autorisés
        const extension = photoSignalement.split(".").pop().toLowerCase()
        if (!imageFormats.includes(extension)) {
          setPhotoError(true)
        } else {
          setPhotoError(false)
        }
      }

      if (photoError === false && descriptionError === false && titreError === false) {
        console.log("envoyer")
      }
    }

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
    )
  },
)

// Styles

const { width } = Dimensions.get("window")

const $container: ViewStyle = {
  paddingRight: spacing.sm,
  paddingLeft: spacing.sm,
}

const $h1: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.sm,
}

const $inputTitre: TextStyle = {
  borderRadius: spacing.sm,
  padding: spacing.sm,
  borderWidth: 1,
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
}

const $inputDescription: TextStyle = {
  ...$inputTitre,
  height: 200,
}

const $image: TextStyle = {
  width: "100%",
  height: width,
  marginBottom: spacing.sm,
  marginTop: spacing.sm,
  borderRadius: spacing.sm,
}

const $imageError: TextStyle = {
  color: colors.palette.rouge,
  marginBottom: spacing.sm,
}

const $boutonContainer: ViewStyle = {
  justifyContent: "space-around",
  flexDirection: "row",
}

const $bouton: TextStyle = {
  marginBottom: spacing.sm,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.vert,
}

const $textBouton: TextStyle = {
  color: colors.palette.blanc,
}
