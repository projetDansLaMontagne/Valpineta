import { CarteAvis } from "app/components";
import { observer } from "mobx-react-lite";
import { Dimensions, ScrollView, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

export interface AvisProps {}

export function Avis(props: AvisProps) {
  return (
    <ScrollView>
      <TouchableWithoutFeedback>
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
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const { height } = Dimensions.get("window");
const $containerAvis: ViewStyle = {
  paddingBottom: height / 3, //pour pouvoir afficher les avis
};
