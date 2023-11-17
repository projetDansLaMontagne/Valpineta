import { View,  Button } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const YourComponent = () => {

  const downloadAndSaveFile = () => {
    Sharing.shareAsync(FileSystem.documentDirectory + 'PuntaFulsaAciron.gpx');
  };

  return (
    <View>
      <Button title="Télécharger le fichier" onPress={downloadAndSaveFile} />
    </View>
  );
};

export default YourComponent;
