const es = {
  common: {
    ok: "OK !",
    cancel: "Annuler",
    back: "Retour",
  },
  welcomeScreen: {
    postscript:
      "psst  — Ce n'est probablement pas à quoi ressemble votre application. (À moins que votre designer ne vous ait donné ces écrans, dans ce cas, mettez la en prod !)",
    readyForLaunch: "Votre application, presque prête pour le lancement !",
    exciting: "(ESPAGNOLLLL !)",
  },
  errorScreen: {
    title: "Quelque chose s'est mal passé !",
    friendlySubtitle:
      "C'est l'écran que vos utilisateurs verront en production lorsqu'une erreur sera lancée. Vous voudrez personnaliser ce message (situé dans `app/i18n/fr.ts`) et probablement aussi la mise en page (`app/screens/ErrorScreen`). Si vous voulez le supprimer complètement, vérifiez `app/app.tsx` pour le composant <ErrorBoundary>.",
    reset: "RÉINITIALISER L'APPLICATION",
  },
  emptyStateComponent: {
    generic: {
      heading: "Si vide... si triste",
      content:
        "Aucune donnée trouvée pour le moment. Essayez de cliquer sur le bouton pour rafraîchir ou recharger l'application.",
      button: "Essayons à nouveau",
    },
  },

  mapScreen: {
    title: "Mapa",
    locate: {
      locate_btn: "¡Localízame!",
      dl_map_btn: "Descargar el mapa",
      stop_locate_btn: "Detener la localización",
      fetching: "Localización en curso...",
      follow: "Seguirme",
      stopFollowing: "Dejar de seguirme",
      located: {
        title: "¡Estás aquí!",
        latitude: "Latitud: ",
        longitude: "Longitud: ",
      },
      notLocated: {
        title: "No es posible localizarte",
        message: "Por favor, verifica tu configuración de ubicación",
      },
    }
  },
  
  excursions:{
    titre: "Excursiones",
    erreurChargement: "Ninguna excursión encontrada",
    erreurNom: "Nombre de excursión no encontrado",
  },
  detailsExcursion:{
    titres:{
      infos: "Infos",
      avis: "Aviso",
      description: "Descripción",
      signalement: "Informes",
      denivele: "Desnivel",
    },
    boutons:{
      lireSuite: "Leer más",
    },
    erreur: {
      titre: "Error",
      message: "Se produjo un error. Por favor, inténtalo de nuevo.",
    }
    
  },

  parametres:{
    titre: "Ajustes",
    changerLangue: {
      titre: "Cambiar el idioma",
      francais: "Francés",
      espagnol: "Español",
    }
  },
  pageFiltres:{
    tri: {
      titre: "Ordenar por",
      distance: "Distancia",
      denivele: "Desnivel",
      difficulteTech: "Dificultad técnica",
      difficulteOrientation: "Dificultad de orientación",
    },
    filtres: {
      titre: "Filtrar por",
      distance: 'Distancia (en km)',
      duree: 'Duración (en horas)',
      denivele: 'Desnivel (en m)',
      parcours: 'Tipo de recorrido',
      typeParcours: {
        aller: 'Ida simple',
        allerRetour: 'Ida y vuelta',
        boucle: 'Bucle',
      },
      vallees: 'Valles',
      difficulteTech: 'Dificultad técnica',
      difficulteOrientation: 'Dificultad de orientación',
    },
    boutons: {
      valider: "Validar",
    }
  }
}

export default es