// TODO: write documentation for colors and palette in own markdown file and add links from here

const palette = {
  marron : "#333300",
  vert : "#007C27",
  vertAttenue : "#009944",
  gris : "#D9D9D9",
  blanc : "#FFFFFF",
  rouge : "#FF0000",
  jaune : "#FFEE00",
  noir : "#000000",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * Couleur par défault du texte.
   */
  text: palette.marron,
  /**
   * Texte attenué.
   */
  textAttenue: palette.vertAttenue,
  /**
   * The default color of the screen background.
   */
  fond: palette.blanc,
  /**
   * Couleur par défault des bordures.
   */
  bordure: palette.vert,
  /**
   * Couleur pour souligner les textes.
   */
  souligne: palette.vert,
  /**
   * Couleur pour les boutons.
   */
  bouton: palette.vert,
  /**
   * Messages d'erreurs.
   */
  erreur: palette.rouge,

}
