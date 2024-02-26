import { TPoint, T_Signalement } from "app/navigators";

/**@warning types a mettre dans appNavigator */
export interface Coordonnees {
  lat: number;
  lon: number;
  alt: number;
  dist: number;
}
export interface T_Point extends TPoint {
  title?: string;
}
type T_Language = "fr" | "es";
type T_TypeParcoursEs = "Ida" | "Ida y Vuelta" | "Circular";
type T_TypeParcoursFr = "Aller simple" | "Aller-retour" | "Boucle";
type T_LanguageContent<T extends T_Language> = {
  nom: string;
  description: string;
  typeParcours: T extends "fr" ? T_TypeParcoursFr : T_TypeParcoursEs;
};
export type TExcursion = {
  [key in T_Language]: T_LanguageContent<key>;
} & {
  denivele: string;
  difficulteOrientation: string;
  difficulteTechnique: string;
  distance: string;
  duree: string;
  vallee: string;
  postId: number;
  signalements: T_Signalement[];
  nomTrackGpx: string;
  track: T_Point[];
};
