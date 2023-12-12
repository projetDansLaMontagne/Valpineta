import { Translations } from "./en"

const fr: Translations = {
  common: {
    ok: "OK !",
    cancel: "Annuler",
    back: "Retour",
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
  testScreen: {
    title: "Ecran de test",
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
    }
  }
}

export default fr
