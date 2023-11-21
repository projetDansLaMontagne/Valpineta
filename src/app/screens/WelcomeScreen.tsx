import { observer } from "mobx-react-lite"
import React, { FC } from "react"
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



// src/app/screens/WelcomeScreen.tsx
// src/app/utils/tiles_struct.json

import fichier_json_aled_jenpeuxPlus from '../utils/tiles_struct.json';

const url = 'https://valpineta.eu/wp-json/api-wp/dl-file?file=carte/Chupaca';
export const folder_dest = `${fileSystem.documentDirectory}cartes/Chupaca`;

let FINAL_IMAGE_MESCOuiLLEs;

const create_folder_struct = async (
  folder_struct: any,
  folder_path: string = folder_dest
) => {
  for (const folder in folder_struct) {
    if (folder_struct.hasOwnProperty(folder)) {
      if (typeof folder_struct[folder] === 'string') {
        const file_name = folder_struct[folder].split('/').pop();

        // remove 'folder_dest' from 'folder_path'
        let file_folder = folder_path.replace(folder_dest, '');
        const final_url = url + file_folder + '/' + file_name;

        console.log(final_url);
        console.log(`DL_DEST --- ${folder_dest}${file_folder}/${file_name}`);


        await fileSystem.makeDirectoryAsync(`${folder_dest}${file_folder}`, {
          intermediates: true,
        });


        const dl_file = await fileSystem.downloadAsync(
          final_url,
          `${folder_dest}${file_folder}/${file_name}`, {
          cache: true,

        });

        if (dl_file.status === 200) {
          console.log(`File downloaded: ${final_url}`);
          FINAL_IMAGE_MESCOuiLLEs = dl_file.uri;
        }



      } else {
        console.log(`Folder name: ${folder}`);

        // create folder in folder_dest
        await fileSystem.makeDirectoryAsync(`${folder_dest}/${folder}`, {
          intermediates: true,
        });

        await create_folder_struct(folder_struct[folder], `${folder_path}/${folder}`);
      }
    }
  }
}

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(
    _props
) {

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const imgRef = React.useRef(null)

  const { navigation } = _props

  const onPress = async () => {
    console.log("Downloading files...");


    create_folder_struct(
      fichier_json_aled_jenpeuxPlus,
      folder_dest
    )
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        console.log("FIIINIIIIIIIIIIIIIIII");


        fileSystem.readDirectoryAsync(FINAL_IMAGE_MESCOuiLLEs.split("/").slice(0, -1).join("/"))

        .then((result) => {
          console.log(result);

          console.log(FINAL_IMAGE_MESCOuiLLEs);
        })

      });
  }

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
          onPress={onPress}
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
