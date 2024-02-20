# Synchronisation Descendante

## Auteur
[Tom Planche](mailto:tomplanche@icloud.com)

## Schéma
<img src="assets/SynchroDesceandante.svg"/>

## Fonctionnement
Ce service est un service de synchronisation descendante. Il permet de
synchroniser les données de l'API vers les fichiers locaux de l'application.
Cette synchronisation nécessite une connexion internet.

Toutes ses fonctions et son fonctionnement détaillé sont expliqués dans le [script](synchroDesc.ts).


## Tests
> Une batterie de tests sont disponibles dans le fichier [synchroDesc.test.ts](synchroDesc.test.ts).
> Ils permettent d'assurer le bon fonctionnement des fonctions de ce service et par extension de cette fonctionnalité.

Si vous ne savez quelles technologies nous utilisons pour les tests ou comment les lancer, vous pouvez consulter notre [documentation](documentation-des-tests) sur les tests.

### Fonctions couvertes

- `API_FILE_DL_URL()`:

    Fonction nous donnant l'URL de téléchargement d'un fichier depuis le nom de ce fichier.
- `API_FILE_MD5_URL()`:

    Fonction nous donnant l'URL de téléchargement du hash MD5 d'un fichier depuis le nom de ce fichier.
- `areObjectsEquals()`:

    Fonction nous permettant de comparer deux objets JS/TS de manière profonde.
- `excursionsJsonExists()`:

    Fonction nous permettant de savoir si le fichier `excursions.json` existe.
- `updateExcursionsJson()`:

    Fonction nous permettant de mettre à jour le fichier `excursions.json` avec les données de l'API.

#### `API_FILE_DL_URL()`

| Nom de la fonction testée | Objectif du test                                      | Conditions préalables | Paramètres passés | Résultat attendu                                           |
|---------------------------|-------------------------------------------------------|-----------------------|-------------------|------------------------------------------------------------|
| API_FILE_DL_URL           | Vérifier que l'URL retournée est celle attendue.      | BASE_URL défini       | "track1.gpx"      | Retourne l'URL complète pour télécharger track1.gpx        |
| API_FILE_DL_URL           | Vérifier que l'URL retournée n'est pas celle attendue | BASE_URL défini       | "track2.gpx"      | Ne retourne pas l'URL complète pour télécharger track1.gpx |


#### `API_FILE_MD5_URL()`

| Nom de la fonction testée | Objectif du test                                | Conditions préalables | Paramètres passés | Résultat attendu                                           |
|---------------------------|-------------------------------------------------|-----------------------|-------------------|------------------------------------------------------------|
| API_FILE_MD5_URL          | Vérifier que l'URL retournée est celle attendue | BASE_URL défini       | "track1.gpx"      | Retourne l'URL complète pour obtenir le MD5 de track1.gpx  |
| API_FILE_MD5_URL          | URL incorrecte                                  | BASE_URL défini       | "track2.gpx"      | Ne retourne pas l'URL complète pour télécharger track1.gpx |


#### `areObjectsEquals()`
| Nom de la fonction testée | Objectif du test                       | Conditions préalables | Paramètres passés                | Résultat attendu                                            |
|---------------------------|----------------------------------------|-----------------------|----------------------------------|-------------------------------------------------------------|
| areObjectsEquals          | Signalements différents                |                       | signalement1, signalement1Change | Retourne false si les signalements sont différents          |
| areObjectsEquals          | Objets avec des propriétés différentes |                       | excursion1, excursion4           | Retourne false si les objets ont des propriétés différentes |
| areObjectsEquals          | Signalements égaux                     |                       | signalement1, signalement1       | Retourne true si les signalements sont identiques           |
| areObjectsEquals          | Objets complexes                       |                       | excursion1, excursion1Identique  | Retourne true si les objets complexes sont identiques       |


#### `excursionsJsonExists()`
| Nom de la fonction testée | Objectif du test    | Conditions préalables | Paramètres passés | Résultat attendu                        |
|---------------------------|---------------------|-----------------------|-------------------|-----------------------------------------|
| excursionsJsonExists      | Fichier JSON existe |                       |                   | Retourne true si le fichier JSON existe |


#### `updateExcursionsJson()`
Ici, le paramètre `modeDebug` est un paramètre qui permet de savoir si on doit afficher des logs ou non. Il n'est pas utilisé dans le code mais est utilisé dans les tests pour vérifier que les logs sont bien affichés.

| Nom de la fonction testée | Objectif du test                   | Conditions préalables | Paramètres passés                                                         | Résultat attendu                                                                            |
|---------------------------|------------------------------------|-----------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| updateExcursionsJson      | Tableaux vides                     |                       | [], [], modeDebug                                                         | Ne devrait pas y avoir de changement et un tableau vide devrait être retourné               |
| updateExcursionsJson      | Excursion pas changée              |                       | [excursion1], [excursion1Identique], modeDebug                            | Ne devrait pas y avoir de changement et le tableau devrait contenir une excursion identique |
| updateExcursionsJson      | Excursion changée                  |                       | [excursion1Change], [excursion1], modeDebug                               | Devrait indiquer un changement et le tableau devrait contenir l'excursion modifiée          |
| updateExcursionsJson      | Excursion supprimée                |                       | [], [excursion1Identique], modeDebug                                      | Devrait indiquer un changement et le tableau devrait être vide                              |
| updateExcursionsJson      | Excursion ajoutée                  |                       | [excursion1Identique, excursion2], [excursion1Identique], modeDebug       | Devrait indiquer un changement et le tableau devrait contenir deux excursions               |
| updateExcursionsJson      | Excursion ajoutée et supprimée     |                       | [excursion2, excursion3], [excursion1, excursion2], modeDebug             | Devrait indiquer un changement et le tableau devrait contenir deux excursions               |
| updateExcursionsJson      | Excursion modifiée sur le serveur  |                       | [excursion1Identique, excursion1Change], [excursion1Identique], modeDebug | Devrait indiquer un changement et le tableau devrait contenir l'excursion modifiée          |
| updateExcursionsJson      | Plus d'excursions sur le serveur   |                       | [], [excursion1Identique], modeDebug                                      | Devrait indiquer un changement et le tableau devrait être vide                              |
| updateExcursionsJson      | Plus d'excursions sur le téléphone |                       | [excursion1, excursion2, excursion3], [], modeDebug                       | Devrait indiquer un changement et le tableau devrait contenir trois excursions              |

[documentation-des-tests]: ../Test.md
[synchroDesc.ts]: ../src/app/services/synchroDescendante/synchroDesc.ts
[synchroDesc.test.ts]: ../src/app/services/synchroDescendante/synchroDesc.test.ts
