/**
 * Service qui s'occupe de la synchronisation montante
 * @oiercesat Cesat Oier
 * @Nicolas-Delahaie Delahaie Nicolas
 * @version 2.0
 * @date 2021-02-28
 * @info Les informations de fonctionnement sont à retrouver dans le fichier SynchroMontanteService.md dans le dossier Documentation
 * @see app/models/SynchroMontante
 */

import { T_Signalement } from "app/navigators";
//Api
import { api } from "app/services/api";
import { getGeneralApiProblem } from "app/services/api/apiProblem";
import { ApiResponse } from "apisauce";
//Models
import { SynchroMontanteStore } from "app/models";

export enum EtatSynchro {
  RienAEnvoyer,
  NonConnecte,
  ErreurServeur,
  BienEnvoye,
}
let tryingToPush = false;

/**
 * Primitive qui tente de pousser les signalements vers le serveur
 * @prerequis etre connecte et avoir des signalements valides à pousser
 * @param isConnected booleen indiquant si l'utilisateur est connecté
 * @param signalements liste des signalements à pousser
 * @returns booleen indiquant si la synchronisation a reussi
 */
export const tryToPush = async (
  isConnected: boolean,
  signalements: T_Signalement[],
  SynchroMontante: SynchroMontanteStore,
): Promise<EtatSynchro> => {
  if (isConnected) {
    if (signalements.length > 0 && !tryingToPush) {
      tryingToPush = true;
      const response = await callApi(signalements);
      const success = await traiterResultat(response, SynchroMontante);
      if (success) {
        tryingToPush = false;

        return EtatSynchro.BienEnvoye;
      } else {
        tryingToPush = false;
        return EtatSynchro.ErreurServeur;
      }
    }
    return EtatSynchro.RienAEnvoyer;
  }
  return EtatSynchro.NonConnecte;
};

/**
  * Fonction qui traite le resultat de la requete
  * @param response reponse de la requete de type ApiResponse
  * @param SynchroMontante store de la synchronisation montante permetant de supprimer les signalements
  * @returns booleen indiquant si la synchronisation a reussi
 */
export const traiterResultat = async(
  response: ApiResponse<any, any>,
  SynchroMontante: SynchroMontanteStore,
): Promise<boolean> => {
  if (response) {
    if (response.ok) {
      SynchroMontante.removeAllSignalements();
      return true;
    } else {
      getGeneralApiProblem(response);
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Fonction qui appelle l'api pour envoyer les signalements
 * @param signalements liste des signalements à envoyer
 * @returns reponse de l'api
 * @info Pour modifier l'url de l'api, il faut modifier le fichier src/app/config
 * @see src/app/services/api
 */
export const callApi = async (signalements: T_Signalement[]) : Promise<ApiResponse<any, any>> => {
  const response = await api.apisauce.post(
    "set-signalement",
    {
      signalements: JSON.stringify(signalements),
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response;
};
