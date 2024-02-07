#AppNavigator
![Schéma du AppNavigator](appNavigator.svg)

AppNavigator est le fichier permetant de définir la navigation du projet. Globalement, nous avons TabNavigator est le container global de l'application, c'est ici que nous définissons les screens apparaissant dans le footer de l'application. Par défaut, l'application se place sur la carte.

Les composants du footer sont des piles de Screens. Une pile permet de naviguer plus facilement entre des Screens ayant une dépendance. 

Nous avons donc 3 piles 
* ExcursionStack
* CarteStack
* ParametresStack