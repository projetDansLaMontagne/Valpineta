# API VALPINETA

## Auteur
[Robin Alonzo](mailto:robin.alonzo03@gmail.com)

## Fonctionnement
Cette API est un plugin wordpress écrit en PHP qui permet de récupérer les données du site Valpineta pour pouvoir les utiliser dans l'application.
Elle contient aussi une page de modération des signalements

## Installation
Il suffit de l'ajouter dans les plugins de wordpress et de l'activer.

## Architecture
L'API est composée de plusieurs fichiers:
- `api-wp.php`: Fichier principal de l'API, il contient les routes et les fonctions pour récupérer les données
- `includes/functionUtils.php`: Fichier contenant les fonctions utilitaires pour l'API 
- `includes/gpxToJson.php`: Fichier contenant les fonctions pour convertir un fichier GPX en JSON
- `moderateSignalements/handleSlignalement`: Page pour la modération des signalements
- `moderateSignalements/signalementTable.php`: Classe pour la création de la table des signalements dans la page de modération

## Tests
Les tests ne sont pas encore fait pour cette API mais le but c'est de tester dans le futur les différentes fonctions.

## Routes publiques
Les routes disponibles publiquement sont les suivantes:

###  GET
- `excursions`:
    - Récupère toutes les excursions du site Valpineta

- `dl-file`: 
    - Télécharge un fichier depuis le site Valpineta, la route de base est uploadDirectory de wordpress
    - Paramètres:
        - `file`: Nom du fichier à télécharger
- `md5-file`: 
    - Télécharge le hash MD5 d'un fichier depuis le site Valpineta, la route de base est uploadDirectory de wordpress
    - Paramètres:
        - `file`: Nom du fichier pour lequel on veut le hash MD5


###  POST
- set-signalement:
    - Ajoute un signalement dans la base de données de Valpineta
    - Paramètres:
        - `signalement`: Objet signalement à ajouter


###  Routes de modération
Les routes disponibles en activant le mode debug sont les suivantes:

###  GET

- `get-signalements`:
    - Récupère tous les signalements du site Valpineta

- `drop-tables`: 
    - Supprime toutes les tables des signalements
  
- `create-tables`: 
    - Crée les tables des signalements

- `show-tables`: 
    - Affiche les tables de la base de données
