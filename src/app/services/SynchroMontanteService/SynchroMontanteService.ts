import { T_Signalement } from "app/navigators";
//Api
import { api } from "app/services/api";
import { getGeneralApiProblem } from "app/services/api/apiProblem";
import { ApiResponse } from "apisauce";
import { SynchroMontanteStore } from "app/models";

export enum EtatSynchro {
  RienAEnvoyer,
  NonConnecte,
  ErreurServeur,
  BienEnvoye,
}
let tryingToPush = false;

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
 * Primitive qui tente de pousser les signalements vers le serveur
 * @prerequis etre connecte et avoir des signalements a pousser
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
