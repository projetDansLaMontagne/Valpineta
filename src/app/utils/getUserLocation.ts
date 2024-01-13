import * as Location from "expo-location";

/**
 *
 * @returns les coordonnées de l'utilisateur
 */
export const getUserLocation = () =>
  new Promise(async (resolve, reject) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync(); // utiliser la fonction requestForegroundPermissionsAsync de Location pour demander la permission à l'utilisateur
      if (status !== "granted") {
        // Si l'utilisateur n'a pas accepté la permission
        console.error("Permission to access location was denied"); // Afficher une erreur
        resolve(null);
      }

      const location = await Location.getCurrentPositionAsync({}); // uti²e la fonction getCurrentPositionAsync de Location pour récupérer la position de l'utilisateur
      resolve(location.coords); // Renvoie les coordonnées de l'utilisateur (latitude et longitude) pour pouvoir calculer la distance
    } catch (error) {
      console.error("Error getting location", error);
      reject(error);
    }
  });
