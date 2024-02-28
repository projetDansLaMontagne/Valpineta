import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { observer } from "mobx-react-lite";
import { colors, spacing } from "app/theme";
import { Text } from "app/components/Text";
import { T_TypeSignalement } from "app/navigators";

type CarteSignalementProps = {
  type: T_TypeSignalement;
  nomSignalement: string;
  distanceDuDepartEnM: number;

  onPress?: () => void;
} & (
  | {
      details: false;
    }
  | {
      details: true;
      description: string;
      imageSignalement?: Image;
    }
);

export const CarteSignalement = observer(function CarteSignalement(props: CarteSignalementProps) {
  const { details, type, nomSignalement, distanceDuDepartEnM, onPress } = props;

  const check = (paramName, paramValue) => {
    // Vérification de la présence des paramètres
    if (paramValue === undefined) {
      console.error(
        `CarteSignalement : ${paramName} non défini pour le signalement: ${nomSignalement}`,
      );
    }
  };

  // Verification de la conformite de type des parametres
  check("type", type);
  check("nomSignalement", nomSignalement);
  check("distanceDuDepart", distanceDuDepartEnM);
  if (details === true) {
    // Si on veut les détails, on vérifie la présence de toutes les données
    check("imageSignalement", props.imageSignalement);
    check("description", props.description);
  }

  return (
    <TouchableOpacity
      style={styles.carteGlobale}
      onPress={onPress}
      disabled={onPress === undefined}
    >
      <View style={styles.entete}>
        {type === "PointInteret" ? (
          <Image source={require("../../assets/icons/pin.png")} style={styles.iconeVert} />
        ) : (
          <Image source={require("../../assets/icons/pin.png")} style={styles.iconeRouge} />
        )}
        <Text style={styles.heading}>{nomSignalement}</Text>
        <Text>{Math.round(distanceDuDepartEnM / 100) / 10} km</Text>
      </View>

      {details && (
        <View style={styles.contenu}>
          <View style={styles.container}>
            {props.imageSignalement && (
              <Image
                source={{ uri: `data:image/jpeg;base64,${props.imageSignalement}` }} // On récupère l'image en base64
                style={styles.image}
              />
            )}
            <Text style={styles.texte}>{props.description}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  carteGlobale: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingStart: spacing.xs,
    paddingEnd: spacing.xs,
    margin: spacing.sm,
    shadowColor: colors.palette.noir,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderRadius: 10,
    backgroundColor: colors.palette.blanc,
  },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contenu: {
    fontSize: 14,
    maxWidth: "100%",
  },
  icone: {
    color: colors.palette.vert,
  },
  heading: {
    fontSize: spacing.md,
    paddingEnd: spacing.xs,
    paddingStart: spacing.xs,
  },
  imageSignalement: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  texte: {
    fontSize: 14,
    flex: 0.5,
  },
  iconeRouge: {
    width: 25,
    height: 25,
    tintColor: "red",
  },
  iconeVert: {
    width: 25,
    height: 25,
    tintColor: "green",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  image: {
    flex: 0.5,
    width: 100, // ajustez la largeur selon vos besoins
    height: 100, // ajustez la hauteur selon vos besoins
  },
});
