#Styles de l'application

Pour pouvoir ajouter du style à un composant il suffit de créer une variable de style. 
```
const $containerBouton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  width: width,
};
```
Il faut ensuite spéficier cette variable à un composant React Native.
```
<View style={$containerBouton}>
```

Nous avons définit certaines variables comme les couleurs, les fonts, les spacing ou bien les timing dans `src/app/theme` 
