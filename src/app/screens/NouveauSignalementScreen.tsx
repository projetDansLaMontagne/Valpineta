// Librairies
import React, { FC, useState, useRef, useEffect } from "react"
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

    const [titreSignalement, setTitreSignalement] = useState("")
    const [descriptionSignalement, setDescriptionSignalement] = useState("")
    const [photoSignalement, setPhotoSignalement] = useState(null)

    const [cameraPermission, setCameraPermission] = useState(null)
    const [LibrairiesPermission, setLibrairiesPermission] = useState(null)

    //Demande de permission pour acceder a la camera et aux librairies
    useEffect(() => {
      ;(async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
        setCameraPermission(cameraStatus.granted)
        const LibrairiesStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
        setLibrairiesPermission(LibrairiesStatus.granted)
      })()
    }, [])

    //Fonction pour prendre une photo
    const prendrePhoto = async () => {
      let photo = await ImagePicker.launchCameraAsync()
      setPhotoSignalement(photo.assets[0].uri)
    }

    //Fonction pour choisir une photo
    const choisirPhoto = async () => {
      let photo = await ImagePicker.launchImageLibraryAsync()
      setPhotoSignalement(photo.assets[0].uri)
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
        <TextInput
          placeholder="Insérez un titre"
          placeholderTextColor={colors.text}
          onChangeText={setTitreSignalement}
          value={titreSignalement}
          style={$inputTitre}
        />
        <TextInput
          placeholder="Insérez une description"
          placeholderTextColor={colors.text}
          onChangeText={setDescriptionSignalement}
          multiline={true}
          value={descriptionSignalement}
          style={$inputDescription}
        />
        {cameraPermission && LibrairiesPermission ? (
          <View>
            {photoSignalement && <Image source={{ uri: photoSignalement }} style={$image} />}
            <View style={{ flexDirection: "row" }}>
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
          </View>
        ) : (
          <Text text="Permission refusée" size="sm" />
        )}
      </Screen>
    )
  },
)

// Styles

const { width } = Dimensions.get("window")

const $container: TextStyle = {
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
  borderColor: colors.bordure,
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

const $bouton: TextStyle = {
  marginBottom: spacing.sm,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.vert,
  marginRight: spacing.sm,
}

const $textBouton: TextStyle = {
  color: colors.palette.blanc,
}
