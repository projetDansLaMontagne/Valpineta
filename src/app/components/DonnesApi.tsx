import React, { useEffect, useState } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, typography } from "app/theme"
import {
  Text,
  Screen,
  Card,
} from '../components'

const DonnesApi = () => {
  //const [excursionNames, setExcursionNames] = useState([]);

  const [excursionDetails, setExcursionDetails] = useState([]);

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        const response = await fetch('https://valpineta.eu/wp-json/api-wp/excursions');
        const data = await response.json();

        // Récupérer les noms des excursions
        /*const names = data.data.map(excursion => excursion.nom_excursions);
        setExcursionNames(names); // Mettre à jour l'état avec les noms des excursions

        const typeParcours = data.data.map(name => name.type_parcours);
        setParcoursType (typeParcours);*/

        const details = data.data.map(excursion => ({
          nom: excursion.nom_excursions,
          zone: excursion.vallee,
          typeParcours: excursion.type_parcours.name, ////a traduire
          duree: excursion.duree,
          distance: excursion.distance_excursion,
          denivelePositif: excursion.denivele,
          difficulteParcours: excursion.difficulte_technique,
          difficulteOrientation:  excursion.difficulte_orientation

        }));
        setExcursionDetails(details); // Mettre à jour l'état avec les détails des excursions



      } catch (error) {
        console.error('Erreur lors du chargement du fichier JSON :', error);
      }
    };

    fetchExcursions();
  }, []);

  return (
    <View>

      <Text>Liste des excursions :</Text>
      {excursionDetails.map((excursion, index) => (
        <Card 
        nomExcursions={excursion.nom} 
        parcours={excursion.typeParcours} 
        zone={excursion.zone} 
        temps={excursion.duree} 
        distance={excursion.distance}
        denivelePositif={excursion.denivelePositif}
        difficulteParcours={excursion.difficulteParcours}
        difficulteOrientation={excursion.difficulteOrientation}
        />
      ))}
      

    </View>
  );
};
//        <Text key={index}>{name}</Text>

  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('https://valpineta.eu/wp-json/api-wp/excursions');
  //       const json = await response.json();
  //       setData(json);
  //     } catch (error) {
  //       console.error('Une erreur s\'est produite : ', error);
  //     }
  //   };
  
  //   fetchData();
  // }, []);
  
  // return (
  //   <View>
  //     {data ? (
  //       data.map((excursion, index) => (
  //         <Text key={index}>{excursion.nomExcursion}</Text>
  //       ))
  //     ) : (
  //       <Text>Chargement en cours...</Text>
  //     )}
  //   </View>
  // );
  
    

export default DonnesApi;