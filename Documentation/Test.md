# Tester Valpineta

## Lancer les tests
La bibliothèque que nous utilisons pour effectuer des test est [Jest](Jest).

Pour pouvoir lancer les test sur l'application, faut ce placer dans le répertoire `/src` puis lancer la commande 
```
npm run test
```

Tous les fichiers ayant comme extension `.test.ts` seront executés et les autres seront ignorés. Nous avons rajouté dans le `package.json` `--coverage` sur cette ligne :
```
    "test": "jest --coverage",
```
Cette ajout permet de pouvoir voir le % de lignes de code couvertes par les tests.

# Écrire des tests
Pour pouvoir écrire des tests et de pouvoir correctement les éxécuter, il faut créer un nouveau fichier ayant le nom du fichier à tester et an ajoutant `.test.ts`en extention comme cité plus haut. Dans ce fichier nous avons une fonction `describe` englobant des tests à réaliser. Dans le describe nous retrouvons des fonctions `test` qui elle, réalise les test unitaires.
Ainsi voici un exemple  
```
import {describe, expect, test} from '@jest/globals';
import {sum} from './sum';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

## Ressources
* [Jest pour Réact Native](JestPourReactNative)
* [Tests avec ignite](TestsIgnite)


[Jest]: https://jestjs.io/fr/
[JestPourReactNative]: https://jestjs.io/docs/tutorial-react-native
[TestsIgnite]: https://github.com/infinitered/ignite/blob/master/docs/concept/Testing.md
