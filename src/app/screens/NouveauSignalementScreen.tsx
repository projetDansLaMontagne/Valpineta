// Librairies
import React, { FC, useState, useRef, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, TextInput, Image, View } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { Button } from "app/components"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"
import * as MediaLibrary from "expo-media-library"

// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

// Composants
import { Screen, Text } from "app/components"

interface NouveauSignalementScreenProps extends AppStackScreenProps<"NouveauSignalement"> {}

export const NouveauSignalementScreen: FC<NouveauSignalementScreenProps> = observer(
  function NouveauSignalementScreen() {

    const [titreSignalement, setTitreSignalement] = useState("")
    const [descriptionSignalement, setDescriptionSignalement] = useState("")
    const [photoSignalement, setPhotoSignalement] = useState(null)

    const [cameraPermission, setCameraPermission] = useState(null)

    useEffect(() => {
      ;(async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
        setCameraPermission(cameraStatus.granted)
      })()
    }, [])

    const prendrePhoto = async () => {
      let photo = await ImagePicker.launchCameraAsync()
      setPhotoSignalement(photo.uri)
    }

    return (
      <Screen style={$container} preset="scroll" safeAreaEdges={["top", "bottom"]}>
        <Text style={$titre} text="Nouveau Signalement" size="xxl" />
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
        <Text text="Insérez une photo" size="sm" />
        {cameraPermission ? (
          <View>
            {
              photoSignalement && <Image source={{ uri: photoSignalement }} style={$image} />
            }
            <Button text="Prendre une photo" onPress={prendrePhoto} />
          </View>
        ) : (
          <Text text="Permission refusée" size="sm" />
        )}
      </Screen>
    )
  },
)

const $container: TextStyle = {
  paddingRight: spacing.sm,
  paddingLeft: spacing.sm,
}

const $titre: TextStyle = {
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
  height: 200,
}
