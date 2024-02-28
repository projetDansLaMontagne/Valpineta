import { CarteAvis } from "./CarteAvis";
import { Dimensions, View, ViewStyle } from "react-native";

export interface AvisProps {}

export function Avis(props: AvisProps) {
  return (
    <View style={$containerAvis}>
      <CarteAvis
        nombreEtoiles={3}
        texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
      />
      <CarteAvis
        nombreEtoiles={3}
        texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
      />
      <CarteAvis
        nombreEtoiles={3}
        texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
      />
      <CarteAvis
        nombreEtoiles={3}
        texteAvis="Ma randonnée a été gâchée par une marmotte agressive. J'ai dû renoncer à cause de cette petite terreur. Les montagnes ne sont plus ce qu'elles étaient. 😡🏔️"
      />
    </View>
  );
}

const { height } = Dimensions.get("window");
const $containerAvis: ViewStyle = {
  paddingBottom: height / 3, //pour pouvoir afficher les avis
};
