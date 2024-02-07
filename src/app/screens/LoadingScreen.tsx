/**
 * @file src/app/screens/LoadingScreen.tsx
 * @description LoadingScreen component.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import { AppStackScreenProps } from "../navigators";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";
import { Button, Icon, Screen, Text } from "../components";
import { View, ViewStyle } from "react-native";
import {
  getNumberOfExcursions,
  synchroDescendante,
  TDebugMode,
} from "../services/synchroDescendante/synchroDesc";
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

// autres
const etapes: TEtape[] = [
  {
    title: "Chargement du fichier des excursions.",
    description: "blablalba",
  },
  {
    title: "Mise à jour des excursions. Blablabla titre long",
    description: "blablalba 2",
  },
  {
    title: "Mise à jour des fichiers GPX.",
    description: "blablalba 3",
    goal: 2,
  },
];
// END VARIABLES ======================================================================================= END VARIABLES

// COMPONENENT  ============================================================================================= COMPONENT
/**
 * Step component
 *
 * @param title
 * @param description
 * @param error
 * @param isLoading
 * @param isDone
 * @param currentStep
 * @param goal
 */
const Step: FC<TEtape> = ({
  title,
  description,
  error,
  currentStep,
  goal,
  totalStep,
  totalGoal,
}) => {
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
  const [stepsArray, setStepsArray] = useState(etapes);

  const [dlGPX, setDlGPX] = useState(0);
  const [totalGPX, setTotalGPX] = useState(0);

  const [allOK, setAllOK] = useState(false);

  // Fonctions
  const goToMapScreen = () => {
    // const { navigation } = _props;
    // navigation.navigate("CarteStack");

    setStep(step + 1);
  };

  // useEffect
  useEffect(() => {
    const blabla = async () => {
      const nbExcursions = await getNumberOfExcursions();
      setTotalGPX(nbExcursions);

      const synchoOK = await synchroDescendante(
        (step, totalSteps) => {
          console.log(`[LoadingScreen] step: ${step}/${totalSteps}`);
          setStep(step);
        },
        (filesDownloaded, filesToDl) => {
          filesDownloaded > dlGPX && setDlGPX(filesDownloaded);
          filesToDl > totalGPX && setTotalGPX(filesToDl);
        },
        TDebugMode.HIGH,
      );

      if (!synchoOK) {
        setStep(-1);
      } else {
        setAllOK(true);
      }
    };

    blabla();
  }, []);

  useEffect(() => {
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

  // Render
  return (
    <Screen>
      <View style={$screenStyle}>
        <Text preset="heading" style={{ textAlign: "center" }}>
          {allOK ? "Chargement terminé" : "Chargement en cours..."}
        </Text>
        <Text tx="loadingScreen.paragraph" />

        <View style={$stepContainerStyle}>
          {stepsArray.map((etape, index) => (
            <Step key={index} {...etape} totalStep={step} totalGoal={index + 1} />
          ))}
        </View>

        {allOK && <Button onPress={goToMapScreen} tx="loadingScreen.texteBouton" />}
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
