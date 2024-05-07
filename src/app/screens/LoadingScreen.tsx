/**
 * @file src/app/screens/LoadingScreen.tsx
 * @description Écran de chargement des fichiers GPX et du fichier `excursions.json`.
 * Cet écran est le premier écran de l'application, il est affiché lors du lancement de l'application.
 * Il est aussi affiché lors de la synchronisation manuelle (paramètres > Synchroniser).
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import { AppStackScreenProps } from "../navigators";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useMemo, useState } from "react";
import { Button, Icon, Screen, Text } from "../components";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import {
  ESynchroDescendanteRes,
  getNumberOfExcursions,
  synchroDescendante,
} from "../services/synchroDescendante/synchroDesc";
import i18n from "i18n-js";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// types & interfaces
interface LoadingScreenProps {
  onFinished: () => void;
}
type TEtape = {
  title: string;
  description?: string;
  error?: string;

  totalStep?: number;
  totalGoal?: number;

  currentStep?: number;
  goal?: number;
};

// END VARIABLES ======================================================================================= END VARIABLES

// COMPONENENT  ============================================================================================= COMPONENT
/**
 * Composant Step
 *
 * Il représente une étape de la synchronisation descendante.
 * Une étape peut être en chargement, terminée ou en erreur.
 * Elle peut aussi avoir une description.
 *
 * Elle peut aussi avoir un compteur de progression (ex: 3/5).
 * 3 serait `currentStep` et 5 serait `goal`.
 *
 * @return {JSX.Element}
 */
const Step: FC<TEtape> = ({
  title, // titre de l'étape
  description, // description de l'étape
  error, // erreur de l'étape
  currentStep, // étape actuelle / progression par rapport à l'objectif de l'étape actuelle
  goal, // objectif de l'étape actuelle
  totalStep, // étape totale de la synchronisation
  totalGoal, // objectif total de la synchronisation
}): JSX.Element => {
  // States
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Render
  return (
    <View style={$stepStyle}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",

          width: "100%",
        }}
      >
        <View
          style={{
            height: "100%",
            maxWidth: "80%",
          }}
        >
          <Text
            style={{
              // wrap
              flexWrap: "wrap",
              overflow: "hidden",

              width: "100%",
            }}
          >
            {title}
            {
              // affichage du pourcentage
              goal && currentStep && (
                <Text>
                  {"\n"}
                  &nbsp;{currentStep}/{goal}
                </Text>
              )
            }
          </Text>
        </View>

        {totalStep < totalGoal && description && (
          <Button
            text="+"
            style={$stepButtonStyle}
            onPress={() => setIsDetailVisible(!isDetailVisible)}
          />
        )}

        {totalStep >= totalGoal ? (
          <Icon
            icon={"check"}
            style={{
              alignSelf: "center",
            }}
          />
        ) : (
          <ActivityIndicator size="small" color="black" />
        )}
      </View>

      {totalStep < totalGoal && isDetailVisible && <Text>{description}</Text>}

      {error && <Text>{error}</Text>}
    </View>
  );
};

/**
 * LoadingScreen component
 * @return
 * @constructor
 **/
export function LoadingScreen(props: LoadingScreenProps) {
  // States
  const [step, setStep] = useState(0);
  const [stepsArray, setStepsArray] = useState<TEtape[]>();

  const [dlGPX, setDlGPX] = useState(0);
  const [totalGPX, setTotalGPX] = useState(0);

  const [synchroDescRes, setSynchroDescRes] = useState<ESynchroDescendanteRes>();
  const [synchoTries, setSynchoTries] = useState(0);

  // Fonctions
  const trySyncho = async () => {
    const MAX_TRIES = 2;
    let triesCounter = 0;

    while (true) {
      const nbExcursions = await getNumberOfExcursions();
      setStep(0);
      setTotalGPX(nbExcursions);
      setSynchoTries(synchoTries => synchoTries + 1);
      const res = await synchroDescendante(
        (step, totalSteps) => {
          console.log(`[LoadingScreen] step: ${step}/${totalSteps}`);
          setStep(step);
        },
        (filesDownloaded, filesToDl) => {
          filesDownloaded > dlGPX && setDlGPX(filesDownloaded);
          filesToDl > totalGPX && setTotalGPX(filesToDl);
        },
      );

      triesCounter++;

      if (res === ESynchroDescendanteRes.KO && triesCounter !== MAX_TRIES) {
        continue;
      }

      switch (res) {
        case ESynchroDescendanteRes.KO:
        case ESynchroDescendanteRes.NO_CONNEXION:
          setSynchroDescRes(res);
          setTimeout(() => {
            props.onFinished();
          }, 3000);
          break;
        case ESynchroDescendanteRes.OK:
          props.onFinished();
          break;
      }
      break;
    }
  };

  // useEffect
  useEffect(() => {
    /**
     * ! ii18n.t renvoie un objet, mais le type dit que c'est un string
     */
    const steps: { [key: string]: string } = i18n.t("loadingScreen.steps", {
      returnObjects: true,
    }) as unknown as {
      // le `as unknown as` est nécessaire pour que le type soit accepté
      [key: string]: string;
    };

    setStepsArray(Object.values(steps).map(title => ({ title, isDone: false })));

    trySyncho(); // flemme de le await ou de `then` dans le useEffect
  }, []);

  useEffect(() => {
    if (stepsArray && step && step > 0) {
      setStepsArray(
        stepsArray.map((etape, index) =>
          index === step
            ? { ...etape, isDone: true } // étape actuelle, on la passe à terminée
            : etape,
        ),
      );
    }
  }, [step]);

  useEffect(() => {
    if (stepsArray && totalGPX && totalGPX > 0) {
      setStepsArray(
        stepsArray.map(
          (etape, index) =>
            // pas propre, mais on sait que c'est l'étape 3 -> GPX
            // peut-être qu'on devrait regex le titre mais flemme pour le moment
            index === 2
              ? { ...etape, goal: totalGPX, currentStep: dlGPX } // on met à jour l'objectif
              : etape, // sinon on ne fait rien
        ),
      );
    }
  }, [totalGPX, dlGPX]);

  // Render
  return (
    <View style={$screenStyle}>
      <Text preset="heading" style={{ textAlign: "center" }}>
        {synchroDescRes === ESynchroDescendanteRes.OK
          ? i18n.t("loadingScreen.titleFinished")
          : i18n.t("loadingScreen.title")}
      </Text>
      <Text tx="loadingScreen.paragraph" />

      {stepsArray && (
        <View style={$stepContainerStyle}>
          {stepsArray.map((etape, index) => (
            <Step key={index} {...etape} totalStep={step} totalGoal={index + 1} />
          ))}
        </View>
      )}

      {synchroDescRes === ESynchroDescendanteRes.KO && <Text tx="loadingScreen.error" />}

      {synchroDescRes === ESynchroDescendanteRes.NO_CONNEXION && (
        <Text tx="loadingScreen.noConnection" />
      )}
    </View>
  );
}

// Styles
const $screenStyle: ViewStyle = {
  height: "100%",
  width: "100%",

  display: "flex",
  flexDirection: "column",

  justifyContent: "center",
  alignItems: "center",

  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 20,
  paddingRight: 20,
};

const $stepContainerStyle: ViewStyle = {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
  gap: 10,

  marginTop: 50,

  width: "100%",
};

const $stepStyle: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",

  borderWidth: 1,
  borderColor: "black",
  borderRadius: 10,

  padding: 10,

  width: "100%",

  overflow: "hidden",
};

const $stepButtonStyle: ViewStyle = {
  height: "10%",
  alignSelf: "center",
};

// END COMPONENT =======================================================================================  END COMPONENT

export default LoadingScreen;

/**
 * End of file src/components/src/app/screens/LoadingScreen.tsx
 */
