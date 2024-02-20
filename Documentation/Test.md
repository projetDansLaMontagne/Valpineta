#Tester Valpineta

La bibliothèque que nous utilisons pour effectuer des test est [Jest](https://jestjs.io/fr/)

Pour pouvoir lancer les test sur l'application, faut ce placer dans le répertoire `/src` puis lancer la commande 
```
npm run test
```

Tous les fichiers ayant comme extension `.test.ts` seront executés et les autres seront ignorés. Nous avons rajouté dans le `package.json` `--coverage` sur cette ligne :
```
    "test": "jest --coverage",
```
Cette ajout permet de pouvoir voir le % de lignes de code couvertes par les tests.

##Ressources
* https://jestjs.io/docs/tutorial-react-native
* https://github.com/infinitered/ignite/blob/master/docs/concept/Testing.md
