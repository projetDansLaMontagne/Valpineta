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

  carteComposant: {
    titre: "Título de la tarjeta",
    localisation: "Ubicación",
    parcours: "Ida y vuelta",
  },
  excursion:{
    erreur: "Ninguna excursión encontrada",
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
  },

  parametres:{
    titre: "Ajustes",
    changerLangue: {
      titre: "Cambiar el idioma",
      francais: "Francés",
      espagnol: "Español",
    }
  },
}

export default es