const fr = {
  common: {
    ok: "OK !",
    cancel: "Annuler",
    back: "Retour",
    accueil: "Accueil",
  },
  welcomeScreen: {
    postscript:
      "psst  — Ce n'est probablement pas à quoi ressemble votre application. (À moins que votre designer ne vous ait donné ces écrans, dans ce cas, mettez la en prod !)",
    readyForLaunch: "Votre application, presque prête pour le lancement !",
    exciting: "(ohh, c'est excitant !)",
    button: "Allons-y !",
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
    title: "Carte",
    locate: {
      locate_btn: "Localisez moi !",
      dl_map_btn: "Télécharger la carte",
      stop_locate_btn: "Stopper la localisation",
      fetching: "Localisation en cours...",
      follow: "Me suivre",
      stopFollowing: "Arrêter de me suivre",
      located: {
        title: "Vous êtes ici !",
        latitude: "Latitude : ",
        longitude: "Longitude : ",
      },
      notLocated: {
        title: "Impossible de vous localiser",
        message: "Veuillez vérifier vos paramètres de localisation",
      },
    },
  },

  excursions: {
    titre: "Excursions",
    absenceResultats: "Aucune excursion trouvée",
  },
  detailsExcursion: {
    titres: {
      infos: "Infos",
      avis: "Avis",
      description: "Description",
      signalements: "Signalements",
      denivele: "Denivelé",
    },
    boutons: {
      lireSuite: "Lire la suite",
      voirDetails: "Voir détails",
      retourInformations: "Revenir aux informations",
    },
    erreur: {
      titre: "Erreur",
      message: "Une erreur est survenue, veuillez réessayer",
    },
  },
  parametres: {
    titre: "Paramètres",
    changerLangue: {
      titre: "Langue",
      francais: "Français",
      espagnol: "Espagnol",
    },
    choisirSynchro: {
      titre: "Fréquence de synchronisation",
    },
  },
  pageFiltres: {
    tri: {
      titre: "Trier par",
      distance: "Distance",
      denivele: "Dénivelé",
      difficulteTech: "Difficulté technique",
      difficulteOrientation: "Difficulté d'orientation",
    },
    filtres: {
      titre: "Filtrer par",
      distance: "Distance (en km)",
      duree: "Durée (en heures)",
      denivele: "Dénivelé (en m)",
      parcours: "Type de parcours",
      typeParcours: {
        aller: "Aller simple",
        allerRetour: "Aller/Retour",
        boucle: "Boucle",
      },
      vallees: "Vallées",
      difficulteTech: "Difficulté technique",
      difficulteOrientation: "Difficulté d'orientation",
    },
    boutons: {
      valider: "Valider",
    },
  },
  pageNouveauSignalement: {
    titreAvertissement: "Nouvel avertissement",
    titrePointInteret: "Nouveau point d'intérêt",
    placeholderTitre: "Insérez un titre",
    placeholderDescription: "Insérez une description",
    boutons: {
      photo: "Ajouter une photo",
      valider: "Valider",
    },
    actionSheet: {
      prendrePhoto: "Prendre une photo",
      choisirPhoto: "Choisir une photo",
      annuler: "Annuler",
    },
    alerte: {
      permissions:{
        titre : "Permissions",
        message: "Veuillez autoriser l'accès à la caméra et à la galerie pour ajouter une photo",
      },
      ajouteEnLocal: {
        titre: "Ajout réussi",
        message:
          "Votre signalement a bien été ajouté en mémoire, il sera envoyé lorsque vous serez connecté à internet",
        boutons: {
          ajoute: "Ajouter un autre",
          retour: "Retour à la carte",
        },
      },
      dejaExistant: {
        titre: "Signalement déjà existant",
        message: "Un signalement similaire existe déjà à cet endroit",
      },
      mauvaisFormat: {
        titre: "Mauvais format",
        message: "Veuillez vérifier que les champs sont correctement remplis",
      },
      envoyeEnBdd: {
        titre: "Signalement envoyé",
        message: "Votre signalement a bien été envoyé",
        boutons: {
          ajoute: "Ajouter un autre",
          retour: "Retour à la carte",
        },
      },
      synchroEffectuee: {
        titre: "Synchronisation effectuée",
        message:
          "La synchronisation montante a bien été effectuée et vos signalements ont bien été envoyés",
      },
      erreur: {
        titre: "Erreur",
        message: "Une erreur est survenue, veuillez réessayer",
      },
    },
    erreur: {
      titre:
        "Le titre doit contenir entre 3 et 50 caractères et ne doit pas contenir de caractères spéciaux",
      description:
        "La description doit contenir entre 10 et 1000 caractères et ne doit pas contenir de caractères spéciaux",
      photo: "Veuillez ajouter une photo",
    },
  },
};

export default fr;
export type Translations = typeof fr;
