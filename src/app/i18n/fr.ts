const fr = {
  common: {
    ok: "OK !",
    cancel: "Annuler",
    back: "Retour",
    accueil: "Accueil"
  },
  welcomeScreen: {
    postscript:
      "psst  — Ce n'est probablement pas à quoi ressemble votre application. (À moins que votre designer ne vous ait donné ces écrans, dans ce cas, mettez la en prod !)",
    readyForLaunch: "Votre application, presque prête pour le lancement !",
    exciting: "(ohh, c'est excitant !)",
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
    titre: "Le col de la marmotte",
    zone: "Pineta",
    parcours: "Allez/Retour",
    temps: "7h30",
    distance: "13,5 km",
    denivelePositif: "1350 m",
    difficulteParcours: "2",
    difficulteOrientation: "1",
  },
  excursion:{
    erreur: "Aucune excursion trouvée",
  },
  detailsExcursion:{
    titres:{
      infos: "Infos",
      avis: "Avis",
      description: "Description",
      signalement: "Signalement",
      denivele: "Denivelé",
    },
    boutons:{
      lireSuite: "Lire la suite",
    }

  },
  parametres:{
    titre: "Paramètres",
    changerLangue: {
      titre: "Changer la langue",
      francais: "Français",
      espagnol: "Espagnol",
    }
  }
}

export default fr
export type Translations = typeof fr