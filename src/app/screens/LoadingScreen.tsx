/**
 * @file src/app/screens/LoadingScreen.tsx
 * @description Écran de chargement des fichiers GPX et du fichier `excursions.json`.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import { AppStackScreenProps } from "../navigators";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";
import { Button, Icon, Screen, Text } from "../components";
import { View, ViewStyle } from "react-native";
import {
  EDebugMode,
  ESynchroDescendanteRes,
  getNumberOfExcursions,
  synchroDescendante,
} from "../services/synchroDescendante/synchroDesc";
import i18n from "i18n-js";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
// types & interfaces
interface LoadingScreenProps extends AppStackScreenProps<"Loading"> {}
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
 * Step component
 *
 *
 * @return {JSX.Element}
 */
const Step: FC<TEtape> = ({
  title, // titre de l'étape
  description, // description de l'étape
  error, // erreur de l'étape
  currentStep, // étape actuelle
  goal, // objectif
  totalStep, // étape totale
  totalGoal, // objectif total
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

        {totalStep >= totalGoal && (
          <Icon
            icon={"check"}
            style={{
              alignSelf: "center",
            }}
          />
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
export const LoadingScreen: FC<LoadingScreenProps> = observer(function LoadingScreen(_props) {
  // States
  const [step, setStep] = useState(0);
  const [stepsArray, setStepsArray] = useState<TEtape[]>();

  const [dlGPX, setDlGPX] = useState(0);
  const [totalGPX, setTotalGPX] = useState(0);

  const [synchroDescRes, setSynchroDescRes] = useState<ESynchroDescendanteRes>();
  const [synchoTries, setSynchoTries] = useState(0);

  // Fonctions
  const goToMapScreen = () => {
    _props.navigation.goBack();
    _props.navigation.navigate("CarteStack");
  };

  const retrySynchro = () => {
    setStep(0);
    trySyncho();
  };

  const trySyncho = async () => {
    const nbExcursions = await getNumberOfExcursions();
    setTotalGPX(nbExcursions);
    setSynchoTries(synchoTries => synchoTries + 1);

    setSynchroDescRes(
      await synchroDescendante(
        (step, totalSteps) => {
          console.log(`[LoadingScreen] step: ${step}/${totalSteps}`);
          setStep(step);
        },
        (filesDownloaded, filesToDl) => {
          filesDownloaded > dlGPX && setDlGPX(filesDownloaded);
          filesToDl > totalGPX && setTotalGPX(filesToDl);
        },
        EDebugMode.LOW,
      ),
    );
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
    const stepsArray: TEtape[] = Object.values(steps).map(title => ({ title }));

    setStepsArray(stepsArray);

    trySyncho();
  }, []);

  useEffect(() => {
    if (!stepsArray) {
      return;
    }

    if (step > 0) {
      setStepsArray(
        stepsArray.map((etape, index) => {
          if (index === step) {
            return { ...etape, isDone: true };
          }
          return etape;
        }),
      );
    } else {
      setStepsArray(
        stepsArray.map(etape => {
          return { ...etape, isDone: false };
        }),
      );
    }

    console.log(`[LoadingScreen -----] step: ${step}`);
  }, [step]);

  useEffect(() => {
    if (!stepsArray) {
      return;
    }
    if (totalGPX > 0) {
      setStepsArray(
        stepsArray.map((etape, index) => {
          if (index === 2) {
            return { ...etape, goal: totalGPX };
          }
          return etape;
        }),
      );
    }
  }, [totalGPX]);

  useEffect(() => {
    if (dlGPX > 0) {
      setStepsArray(
        stepsArray.map((etape, index) => {
          if (index === 2) {
            return { ...etape, isLoading: true, currentStep: dlGPX };
          }
          return etape;
        }),
      );
    }
  }, [dlGPX]);

  useEffect(() => {
    switch (synchroDescRes) {
      case ESynchroDescendanteRes.KO:
        if (synchoTries < 3) {
          setTimeout(() => {
            retrySynchro();
          }, 3000);
        } else {
          setSynchroDescRes(ESynchroDescendanteRes.KO);
        }

        break;
    }
  }, [synchroDescRes]);

  // Render
  return (
    <Screen>
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

        {synchroDescRes === ESynchroDescendanteRes.OK && (
          <Button onPress={goToMapScreen} tx="loadingScreen.buttonText" />
        )}

        {synchroDescRes === ESynchroDescendanteRes.KO && <Text tx="loadingScreen.error" />}

        {synchroDescRes === ESynchroDescendanteRes.NO_CONNEXION && (
          <Text tx="loadingScreen.noConnection" />
        )}
      </View>
    </Screen>
  );
});

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
