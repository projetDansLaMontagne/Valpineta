import * as jsonBrut from './exemple.json';
import { getDistance } from 'geolib';

/**
 * Retourne une liste de points geographiques d'un parcours
 * Amelioration par rapport au GPX initial :
 * - Les zones vides sont completees
 * - La distance de chaque point est calculee
 * - Le nombre de points est parametrable et espacés à distance égale
 * 
 * @param gpx Fichier gpx à convertir
 * @param nbFragments Nombre de points à retourner
 * @return liste de nbFragments points de la forme [lat, long, alt, dist]
 */
export function conversionGPX(gpx: string, nbFragments: number): Array<Record<string, number>> {
    // -- CONVERSION GPX TO JSON --
    var points = jsonBrut.features[0].geometry.coordinates[0];


    // -- VERIFICATIONS DE LA VALIDITE DU GPX --
    /**@todo */


    // -- Calcul distance entre chaque points --
    // points = [
    //     [0, 0, 1],
    //     [1, 0, 0], // Point intermediaire nul inconnu
    //     [2, 0, 3],
    //     [3, 0, 0], // Point intermediaire nul inconnu
    //     [4, 0, 1],
    //     [5, 0, 0], // Point intermediaire nul inconnu
    //     [6, 0, 0], // Point intermediaire nul inconnu
    //     [7, 0, 2],
    //     [8, 0, 3],
    //     [9, 0, 0], // Point intermediaire nul inconnu
    //     [10, 0, 1],
    // ];
    points[0] = [...points[0], 0];                          // Initialisation du premier a 0
    for (let i = 1; i < points.length; i++) {
        // Pour chaque point avec son precedent 
        const point = points[i];
        const pointPrecedent = points[i - 1];

        // Formatage des points
        const pointFormate = { longitude: point[0], latitude: point[1] };
        const pointPrecedentFormate = { longitude: pointPrecedent[0], latitude: pointPrecedent[1] };

        // Calcul des distances
        const delta = getDistance(pointFormate, pointPrecedentFormate, 0.001); // Precision au cm
        const deltaDepart = delta + pointPrecedent[3];      // Distance par rapport au premier point

        points[i] = [...points[i], deltaDepart];

        // console.log("P1 : " + point[0] + " " + point[1] + " + P2 : " + pointPrecedent[0] + " " + pointPrecedent[1] + " = " + delta + "m. Total : " + distance)
    }


    // -- Completion des zones vides d altitude --
    // Recherche des intervalles d altitudes nulles
    var i = 0;
    var intervallesNulles = [];
    while (true) {
        if (i == points.length)
            // Dernier point atteint
            break;
        else if (points[i][2] != 0)
            // Point non nul
            i += 1;
        else {
            // Point nul : on definit l intervalle
            var departIntervalle = i;

            while (true) {
                // Tant que le point est nul, on agrandit l intervalle
                i += 1;

                if (i == points.length || points[i][2] != 0) {
                    break;
                }
            }

            intervallesNulles.push([departIntervalle, i - 1]);
        }
    }

    // Remplissage des intervalles nulles
    intervallesNulles.forEach((intervalle) => {
        const contientPremierPoint = intervalle[0] == 0;
        const contientDernierPoint = intervalle[1] == points.length - 1;

        if (!contientPremierPoint && !contientDernierPoint) {
            // Seulement si les intervalles ne contiennent pas le premier ou dernier point
            // Car on ne peut pas tracer de droite avec un seul point
            const pointDepart = points[intervalle[0] - 1];
            const pointArrivee = points[intervalle[1] + 1];
            const deltaAltitude = pointArrivee[2] - pointDepart[2]; // Negatif si descente
            const deltaDistance = pointArrivee[3] - pointDepart[3]; // Forcement positif
            const pente = deltaAltitude / deltaDistance;            // Coeficient de proportionnalite de la distance dans l intervalle

            const nbPoints = intervalle[1] - intervalle[0] + 1;
            for (let i = 0; i < nbPoints; i++) {
                // Calcul de l altitude de chaque point
                const point = points[intervalle[0] + i];
                const distance = point[3] - pointDepart[3];             // Distance du point par rapport au premier point
                const altitude = pointDepart[2] + pente * distance;     // Fonction affine
                points[intervalle[0] + i][2] = altitude;
            }
        }
    });


    // -- Selection des points -- (c est cette etape qui va assurer une distance plus ou moins egale entre les points)
    // Verifications des parametres
    // points = [
    //     // [0, 0, 0, 0],
    //     // [0, 0, 0, 1],
    //     // [0, 0, 0, 2],
    //     // [0, 0, 0, 3],
    //     // [0, 0, 0, 4],
    //     // [0, 0, 0, 5],
    //     // [0, 0, 0, 6],
    //     // [0, 0, 0, 7],
    //     // [0, 0, 0, 8],
    //     // [0, 0, 0, 9],
    // ]
    var mauvaisParams = false;
    if (points.length < nbFragments) {
        mauvaisParams = true;
        console.error("Le nombre de fragments demandés doit être inferieur au nombre de points du fichier GPX");
    }
    if (nbFragments < 2) {
        mauvaisParams = true;
        console.error("Le nombre de points doit être au minimum de 2");
    }

    // Pioche nbFragments points
    var pointsSelectionnes = [];
    if (!mauvaisParams) {
        const nbPoints = points.length;
        const distanceTotale = points[nbPoints - 1][3];
        const nbDivisions = nbFragments - 1;                        // -1 car on retire le premier point
        const incrementFragments = distanceTotale / nbDivisions;    // C est l increment (en m) entre chaque fragments

        var distanceIdeale = 0;
        var indexPoint = 0;
        var ecartPointPrecedent = Infinity;

        // Pour chaque fragment, on recherche le point le plus proche de sa distance ideale
        // Le but est d encadrer la distance ideale entre deux points et de prendre le plus proche
        while (true) {
            // console.log("Point n°" + indexPoint + " à " + points[indexPoint][3] + "m")
            // console.log("Distance ideale : " + distanceIdeale + "m")

            if (distanceIdeale > distanceTotale) {
                // Dernier point atteint
                break;
            }
            else {
                const distancePoint = points[indexPoint][3];
                if (distancePoint < distanceIdeale) {
                    // Le point est avant la distance ideale
                    // On passe au points suivant
                    ecartPointPrecedent = distanceIdeale - distancePoint;
                    indexPoint += 1;
                    // console.log("Ecart : " + ecartPointPrecedent + "m")
                }
                else {
                    // Le point est (à || apres) la distance ideale
                    var pointLePlusProche;
                    if (ecartPointPrecedent < distancePoint - distanceIdeale) {
                        // Le point precedent est plus proche 
                        pointLePlusProche = points[indexPoint - 1];
                    }
                    else {
                        // Le point est plus proche que le precedent
                        pointLePlusProche = points[indexPoint];
                    }

                    // Sauvegarde du point le plus proche
                    pointsSelectionnes.push(pointLePlusProche);
                    // console.log("Ajout du point n°" + indexPoint + " à " + distancePoint + "m, le plus proche de la distance ideale de " + distanceIdeale + "m");

                    // On passe a la prochaine distance ideale
                    distanceIdeale += incrementFragments;
                    ecartPointPrecedent = Infinity;
                }
            }
        }
    }
    else {
        pointsSelectionnes = points;
    }


    // -- Formatage du resultat final --
    // Passage de [lat, long, alt, dist] à {lat:val, long:val, alt:val, dist:val} 
    // pour une meilleure lisibilite et utilisabilité
    pointsSelectionnes = pointsSelectionnes.map(point => ({
        long: point[0],
        lat: point[1],
        alt: point[2],
        dist: point[3]
    }));

    // Arrondi de l altitude et de la distance au metre
    pointsSelectionnes = pointsSelectionnes.map(point => ({
        ...point,
        alt: Math.round(point.alt),
        dist: Math.round(point.dist)
    }));


    return pointsSelectionnes;
}

// conversionGPX("", 4);
console.log(conversionGPX("", 15));