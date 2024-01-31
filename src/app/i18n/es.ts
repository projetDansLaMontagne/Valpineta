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
    },
  },

  excursions: {
    titre: "Excursiones",
    absenceResultats: "Ninguna excursión encontrada",
  },
  detailsExcursion: {
    titres: {
      infos: "Infos",
      avis: "Aviso",
      description: "Descripción",
      signalements: "Informes",
      denivele: "Desnivel",
    },
    boutons: {
      lireSuite: "Leer más",
      voirDetails: "Ver detalles",
      retourInformations: "Volver a la información",
    },
    erreur: {
      titre: "Error",
      message: "Se produjo un error. Por favor, inténtalo de nuevo.",
    },
    popup: {
      signalement: {
        present: "Siempre presente",
        absent: "Ausente",
        voirPlus: "Ver más",
        voirMoins: "Ver menos",
      },
      excursionTerminee: {
        felicitations: "¡Felicidades!",
        message: "Has completado esta excursión",
        acceuil: "Página de inicio",
        fermer: "Cerrar",
      },
    },
  },
  suiviTrack: {
    titres: {
      signalements: "Informes",
      description: "Descripción",
    },
    description: {
      typeParcours: "Tipo de recorrido : ",
      duree: "Duración :",
      distance: "Distancia :",
      difficulteTech: "Dificultad técnica :",
      difficulteOrientation: "Dificultad de orientación :",
      denivele: "Desnivel",
      altitudeActuelle: "Altitud actual : ",
      altitudeMax: "Altitud máxima : ",
      altitudeMin: "Altitud mínima : ",
    },
    barreAvancement: {
      parcouru: "Viajó :",
      total: "Total :",
    },
  },
  parametres: {
    titre: "Ajustes",
    changerLangue: {
      titre: "Idioma",
      francais: "Francés",
      espagnol: "Español",
    },
  },
  pageFiltres: {
    tri: {
      titre: "Ordenar por",
      distance: "Distancia",
      denivele: "Desnivel",
      difficulteTech: "Dificultad técnica",
      difficulteOrientation: "Dificultad de orientación",
    },
    filtres: {
      titre: "Filtrar por",
      distance: "Distancia (en km)",
      duree: "Duración (en horas)",
      denivele: "Desnivel (en m)",
      parcours: "Tipo de recorrido",
      typeParcours: {
        aller: "Ida simple",
        allerRetour: "Ida y vuelta",
        boucle: "Bucle",
      },
      vallees: "Valles",
      difficulteTech: "Dificultad técnica",
      difficulteOrientation: "Dificultad de orientación",
    },
    boutons: {
      valider: "Validar",
    },
  },
};

export default es;
