#Arborescence des dossiers ne notre application 

Schéma de l'arborescence de l'application

```
+--- .expo
+--- app 
|   +--- components/
|   +--- config/
|   +--- devtools/
|   +--- i18n/
|   +--- models/
|   |   \--- helpers/
|   +--- navigators
|   +--- screens
|   |   +--- DetailsExcursionScreen/
|   |   +--- ErrorScreen/
|   |   +--- ExcursionsScreen/
|   |   \--- MapScreen/
|   +--- services
|   |   +--- api/
|   |   +--- SynchroMontante/
|   |   +--- SynchroDescendante/
|   |   \--- importAssets/
|   +--- theme/
|   \--- utils/
|       \--- storage/
+--- assets/
|   +--- gpx/
|   +--- icons/
|   +--- images/
|   +--- JSON/
|   +--- Tiles/
+--- bin
+--- ignite/
+--- node_modules/
\--- test/

```

Pour notre arborescence, nous avons choisi d’utiliser celle d’un boilerplate, Ignite pour notre projet, ce qui nous permet d’avoir une base de dossier et de sous dossier et permettant de garder une cohérence à ce niveau.  

Nous allons nous focaliser sur `/src` car c’est dans ce dossier que nous trouvons les fichiers de nécessaire à l’application mobile. Dans ce dossier, trois sous dossier sont importants à comprendre app, assets et test. Assets contient les ressources nécessaires à l’application, test contient les fichiers de configuration des tests et app contient les fichiers d’exécution de l’application.  

Nous allons développer ce sous dossier. 

* Components contient des morceaux code qui sont réutilisés plusieurs fois dans notre application, ce qui nous permet de factoriser les fonctions, les éléments graphiques et des conteneurs. 

* Config contient des variables globales à l’application 

* Devtools est un sous dossier contenant des fonctions utiles pour les développeurs 

* I18n nous permet de gérer les langues avec la bibliothèque i18n. Cette bibliothèque nous permet de gérer dynamiquement le changement de langue. Dans ce dossier nous retrouvons des fonctions permettant de traduire ainsi que les fichiers contenant tous les textes pouvant être impactés par la traduction. 

* Models, dans ce dossier nous retrouvons des stores, qui sont des fichiers contenant des classes accessibles par tous les fichiers de l’application. Nous retrouvons dans ces classes des attributs et des méthodes qui peuvent être appelés lorsque qu’un attribut est modifié. 

* Navigator, contient les fichiers permettant la navigation entre les différentes vues de l’application. AppNavigator est le fichier permettant de définir la navigation du projet.  

* Screens, regroupe toutes les vues de l’application, tout ce que voit l’utilisateur est dans ces fichiers. 

* Services, est un sous dossier regroupant toutes les fonctions permettant de communiquer avec des services externes au fichiers de l’application, comme un serveur ou bien des fichiers interne au téléphone. 

* Theme, regroupe toutes les constantes de styles, comme les polices, les couleurs, les minutages ou les espacements. 

* Utils, regroupe des fonctions utiles à l’ensemble de l’application mais ces fonctions ne sont pas indispensables au bon fonctionnement de l’application