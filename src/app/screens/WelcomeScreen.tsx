import { observer } from "mobx-react-lite"
import React, {FC, useEffect} from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import {
  Button,
  Text,
} from "../components"
import { isRTL } from "../i18n"
import { colors, spacing } from "../theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import {AppStackScreenProps} from "../navigators";

import welcomeLogo from "../../assets/images/logo.png"
import welcomeFace from "../../assets/images/welcome-face.png"

import * as fileSystem from 'expo-file-system';
import {Asset, useAssets} from "expo-asset";
import formatRequire from "../services/importAssets/assetRequire";

// src/app/screens/WelcomeScreen.tsx
// src/app/utils/tiles_struct.json

import fichier_json_aled_jenpeuxPlus from '../../assets/tiles_struct.json';

export const folder_dest = `${fileSystem.documentDirectory}cartes/OSM`;

let FINAL_IMAGE_MESCOuiLLEs;
let COMPTEUR = 0;

const create_folder_struct = async (
    folder_struct: any,
    folder_path: string = folder_dest,
    assets_list: Promise<Asset[]>
) => {
  for (const folder in folder_struct) {
    if (folder_struct.hasOwnProperty(folder)) {
      if (typeof folder_struct[folder] === 'string') {
        const file_name = folder_struct[folder].split('/').pop();
        // remove 'folder_dest' from 'folder_path'
        let file_folder = folder_path.replace(folder_dest, '');

        await fileSystem.makeDirectoryAsync(`${folder_dest}${file_folder}`, {
          intermediates: true,
        });

        const assets_list_uri = assets_list[COMPTEUR].localUri;
        COMPTEUR++;
        console.log(COMPTEUR)

        await fileSystem.copyAsync(
            {
                from: assets_list_uri,
                to: `${folder_dest}${file_folder}/${file_name}`
            }
        );
      } else {
        await create_folder_struct(folder_struct[folder], `${folder_path}/${folder}`, assets_list, COMPTEUR);
      }
    }
  }
}

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(
    _props
) {

  const assets_list:Asset[] = formatRequire();
  // Export the result to a file

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const imgRef = React.useRef(null)

  const { navigation } = _props

  const onPress = async (assets: Promise<Asset[]>) => {
    console.log("Downloading files...");

    create_folder_struct(
      fichier_json_aled_jenpeuxPlus,
      folder_dest,
      await assets
    )
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {

      });
  }

   useEffect(() => {
     fileSystem.deleteAsync(folder_dest).then(() => {
       console.log("Folder deleted");
     }).catch((error) => {
       console.log(error);
     });

   }, []);

  return (
    <View style={$container}>
      <View style={$topContainer}>
        <Image
          style={$welcomeLogo}
          source={FINAL_IMAGE_MESCOuiLLEs ?? welcomeLogo}
          resizeMode="contain"

          ref={imgRef}
        />
        <Text
          testID="welcome-heading"
          style={$welcomeHeading}
          tx="welcomeScreen.readyForLaunch"
          preset="heading"
        />
        <Text tx="welcomeScreen.exciting" preset="subheading" />
        <Image style={$welcomeFace} source={welcomeFace} resizeMode="contain" />

      </View>

      <View style={[$bottomContainer, $bottomContainerInsets]}>
        <Text tx="welcomeScreen.postscript" size="md" />
        {/* Add a button that takes to the 'EcranTestScreen */}
        <Button
          title="Go to EcranTest"
          tx={"welcomeScreen.button"}
          onPress={onPress.bind(null, assets_list)}
        />
      </View>

    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
}
const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.md,
}
