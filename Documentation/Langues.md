#Gestion des langues dans l'application

Afin de gérer au mieux les langues de l'application, nous utilisons i18n afin de pouvoir changer dynamiquement la langue de l'application. 
La langue de l'application est paramétrable dans parametreScreen et ce paramètre est stocké dasn le store paramètre. Lorsque le paramètre est modifié, alors la langue locale de i18n est modifié en conséquence.
```
afterCreate() {
      reaction(
        () => self.langues,
        langues => {
          I18n.locale = langues;
        }
    );
}
``` 

Pour ajouter ou modifier les messages en Français ou en Espagnol de l'application, il faut ce rendre dans `src/app/i18n/fr.ts` pour le français, `src/app/i18n/es.ts` pour l'espagnol. ces fichiers sont structurés comme des json et le messages sont regroupés par Screens et par fonctions.

Dans les composants, disponibles dans `src/app/component`, nous pouvons ajouter directement la référence des fichiers i18n afin de chercher le message, comme ceci :

```
<Text style={$texteErreur} size="sm" tx="detailsExcursion.erreur.message" />
```

Nénamoins, dans certains cas les références ne sont pas reconnues, il faut alors importer `import { translate } from "i18n-js"` et ajouter la fonction translate à la référence.

Voici un exemple avec une gestion de la langue pour une alerte.
```
import { translate } from "i18n-js";

export const alertSynchroEffectuee = () => {
  Alert.alert(
    translate("pageNouveauSignalement.alerte.envoyeEnBdd.titre"),
    translate("pageNouveauSignalement.alerte.envoyeEnBdd.message"),
    [{ text: "OK" }],
  );
};
```