import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing'
import { Button } from './Button';
import { StatusBar } from 'expo-status-bar';



export default function GpxDownloader() {

  const copyFile = async () => {
    const filename = "test.json";

    try {
      const fileUri = './test.json'; // Chemin du fichier source
      const newFileUri = FileSystem.documentDirectory + filename; // Nouvel emplacement du fichier
  
      await FileSystem.copyAsync({ from: fileUri, to: newFileUri });
  
      console.log('Fichier copié avec succès !');
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la copie du fichier : ', error);
    }
  };

  const downloadFromUrl = async () => {
    // const result = await FileSystem.downloadAsync(
    //   'http://techslides.com/demos/sample-videos/small.mp4',
    //   FileSystem.documentDirectory + filename
    // );

    copyFile();



/*
      console.log(result);
    save(result);*/

  };

  const save = (url) => {
    shareAsync(url);
  }

  return(
      
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Button text="Telecharge" onPress={downloadFromUrl}/>
      <StatusBar style="auto" />
    </View>
    )
}