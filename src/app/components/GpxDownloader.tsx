import * as React from "react"
import { StyleProp, View, ViewStyle, TouchableOpacity,Image, ImageStyle  } from "react-native"
import { observer } from "mobx-react-lite"
import { colors } from "app/theme"
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export interface GpxDownloaderProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const GpxDownloader = observer(function GpxDownloader(props: GpxDownloaderProps) {
  const { style } = props
  const $styles = [$container, style]

  const downloadAndSaveFile = () => {
    Sharing.shareAsync(FileSystem.documentDirectory + 'PuntaFulsaAciron.gpx');
  };

  return (
    <View style={$styles}>
      <TouchableOpacity
        onPress={() => downloadAndSaveFile()}
      >
        <Image
          source={require("../../assets/icons/download.png")}
          style={$iconDownload}
        >
        </Image>
      </TouchableOpacity>
    </View>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
}

const $iconDownload: ImageStyle = {
  width: 40,
  height: 40,
  tintColor: colors.bouton,
}
