const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
    button: "Let's go!",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  mapScreen: {
    title: "Map",
    locate: {
      locate_btn: "Locate me !",
      dl_map_btn: "Download map",
      stop_locate_btn: "Stop locating",
      fetching: "Fetching location...",
      follow: "Follow me",
      stopFollowing: "Stop following",
      located: {
        title: "You are here !",
        latitude: "Latitude : ",
        longitude: "Longitude : ",
      },
      notLocated: {
          title: "impossible to locate you",
          message: "Please check your location settings",
      },
    }
  },
  excursions:{
    titre: "Excursions",
    erreurChargement: "No excursion found",
    erreurNom: "No excursion found",
  },
  detailsExcursion:{
    titres:{
      infos: "Infos",
      avis: "Reviews",
      description: "Description",
      signalements: "Reports",
    },
    boutons:{
      lireSuite: "Read more",
    },
    erreur:{
      titre: "Error",
      message : " An error has occured, please try again."
    }
  },parametres:{
    titre: "Settings",
    changerLangue: {
      titre: "Language",
      francais: "French",
      espagnol: "Spanish",
    }
  },
  pageFiltres:{
    tri:{
      titre: "Sort by",
      distance: "Distance",
      denivele: "Denivelation",
      difficulteTech: "Technical difficulty",
      difficulteOrientation: "Orientation difficulty",
    },
    filtres:{
      titre: "Filters",
      distance: 'Distance (en km)',
      duree: 'Duration (en hours)',
      denivele: 'Denivelation (en m)',
      parcours: 'Type of course',
      typeParcours: {
        aller: 'One way',
        allerRetour: 'Round trip',
        boucle: 'Loop',
      },
      vallees: 'Valleys',
      difficulteTech: 'Technical difficulty',
      difficulteOrientation: 'Orientation difficulty',
    },
    boutons:{
      valider: "Validate",
    }
  }
}

export default en
