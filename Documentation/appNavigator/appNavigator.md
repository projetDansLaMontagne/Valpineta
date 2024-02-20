#AppNavigator
![Schéma du AppNavigator](appNavigator.svg)

AppNavigator est le fichier permetant de définir la navigation du projet. TabNavigator est le container global de l'application, c'est ici que nous définissons les screens apparaissant dans le footer de l'application.
Par défaut, l'application se place sur la carte.

Les composants du footer sont des piles de Screens. Une pile permet de naviguer plus facilement entre des Screens ayant une dépendance. 

Chaque pile a un Screen par défaut qui est celui qui sera appelé lorsque que l'on appuie sur les boutons du footer.

Nous avons donc 3 piles 
* ExcursionStack
* CarteStack
* ParametresStack

La pile excrusion permet de pouvoir naviguer facilement entre le screen des excursion et celui des filtres et de pouvoir transmettre les valeurs de filtres facilement.

La pile carte regroupe tous les screens ayant besoin de la carte ou bien détaillant un excursion. 

La pile carte permet de naviguer facilement sur des pages contenant des informations ou bien des permetant de changer un paramètre. Pour l'instant aucun autre screen n'est dans cette pile mais à l'avenir il a vocation a avoir plusieurs screen de paramétrage ou d'informations.

##Ressources

https://reactnavigation.org/docs/tab-based-navigation/
https://reactnavigation.org/docs/nesting-navigators/