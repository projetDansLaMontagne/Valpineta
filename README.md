# Valpineta
> Projet tutoré de troisième année de BUT Informatique.

## L'équipe
Nous sommes une équipe de cinqs étudiants à l'[IUT de Bayonne](https://www.iutbayonne.univ-pau.fr/presentation.html) en troisième (et dernière) année de [BUT informatique](https://www.iutbayonne.univ-pau.fr/but/informatique).

## Le projet
Le [refuge de Pineta](https://www.valpineta.eu/fr/el-refugio/) et ses randonneurs ont besoin d'une application mobile afin d'avoir accès au tracés et aux cartes et d'y placer des points d'intérêts (belle vue, arbre blocant le chemin, ...) lors d'une balade. N'ayant pas souvent de connexion, l'application doit pouvoir fonctionner hors-ligne.

## Structure des dossiers
- Documentation : regroupe toute la documentation utile à se projet 
- src : regroupe tout le code de l'application
- public : regroupe les fichiers statiques et les fichers accessibles par tous de l'application
- tests : regroupe les tests unitaires et les tests d'intégration de l'application

## Fichiers 
- README.md : contient l’organisation des dossiers et sous-dossiers du dépôt 
- .gitignore : ignore fichiers ou dossiers qui ne seront pas à pousser sur github 

## Pour installer les tuiles
- Mettre le dossier `Tiles` dans `src/assets/` avec le fichier `tiles_struct.json` à l'intérieur.

## Orga fichiers de l'application
/
├── cartes/
│   └── OSM/
│       └── Dossier contenant les tuiles OSM
├── fichiers/
│   └── `excursions.json`
└── GPX/
    └── Dossier contenant les tracés GPX
