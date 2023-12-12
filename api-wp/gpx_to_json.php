<?php
/**
 * Fichier GPX des excursions --> Fichier JSON formaté
 * Amelioration par rapport au GPX initial :
 * - La distance de chaque point est calculee
 * - Les zones vides sont completees
 * - Retourne un JSON "purifié" et traité
 * 
 * @param string $gpxFile Fichier gpx à convertir
 * @return string JSON de chaque point de la forme [lat, long, alt, dist]
 */
function formatGPXExcursions($gpxFile)
{
    /* ------------------------------- Importation ------------------------------ */
    $excursion = simplexml_load_file($gpxFile);
    if (!$excursion) {
        throw new Exception("Erreur lors de l'ouverture du fichier gpx");
    }



    /* ------------------------- Mise en forme initiale ------------------------- */
    // Transformation de SimpleXMLElement  en Array
    $excursion = json_encode($excursion);
    $excursion = json_decode($excursion, true);

    // Verification formatage du GPX
    if (!isset($excursion["trk"]["trkseg"]["trkpt"])) {
        throw new Exception("GPX Mal formaté");
    }
    if (count($excursion["trk"]["trkseg"]["trkpt"]) < 2) {
        throw new Exception("Nombre de points insuffisants");
    }

    // Extraction des points
    $points = array_map(function ($point) {
        return [
            "lat" => floatval($point["@attributes"]["lat"]),
            "lon" => floatval($point["@attributes"]["lon"]),
            "alt" => floatval($point["ele"] ?? "0"),
        ];
    }, $excursion["trk"]["trkseg"]["trkpt"]);



    /* ------------------- Calcul distance entre chaque points ------------------ */
    $points[0]["dist"] = 0;
    for ($i = 1; $i < sizeof($points); $i++) {
        // Pour chaque points sauf le premier
        $point = $points[$i];
        $pointPrecedent = $points[$i - 1];

        // Calcul des distances
        $delta = get_meters_between_points($pointPrecedent["lat"], $pointPrecedent["lon"], $point["lat"], $point["lon"]); // Distance par rapport au point precedent
        $deltaDepart = $delta + $pointPrecedent["dist"];                                                                    // Distance par rapport au premier point

        $points[$i]["dist"] = $deltaDepart;
    }


    
    /* ------------------ Completion des zones vides d altitude ----------------- */
    // Recherche des intervalles d altitudes nulles
    $i = 0;
    $intervallesNulles = [];
    while (true) {
        if ($i == count($points))
            // Dernier point atteint
            break;
        else if ($points[$i]["alt"] != 0)
            // Point non nul
            $i += 1;
        else {
            // Point nul : on definit l intervalle
            $departIntervalle = $i;

            while (true) {
                // Tant que le point est nul, on agrandit l intervalle
                $i += 1;

                if ($i == count($points) || $points[$i]["alt"] != 0) {
                    break;
                }
            }
            array_push($intervallesNulles, ["min" => $departIntervalle, "max" => $i - 1]);
        }
    }

    // Remplissage des intervalles nulles
    foreach ($intervallesNulles as $intervalle) {
        $contientPremierPoint = $intervalle["min"] == 0;
        $contientDernierPoint = $intervalle["max"] == count($points) - 1;

        if (!$contientPremierPoint && !$contientDernierPoint) {
            // Seulement si les intervalles ne contiennent pas le premier ou dernier point
            // Car on ne peut pas tracer de droite avec un seul point
            $pointDepart = $points[$intervalle["min"] - 1];
            $pointArrivee = $points[$intervalle["max"] + 1];
            $deltaAltitude = $pointArrivee["alt"] - $pointDepart["alt"]; // Negatif si descente
            $deltaDistance = $pointArrivee["dist"] - $pointDepart["dist"]; // Forcement positif
            $pente = $deltaAltitude / $deltaDistance;            // Coeficient de proportionnalite de la distance dans l intervalle

            $nbPoints = $intervalle["max"] - $intervalle["min"] + 1;
            for ($i = 0; $i < $nbPoints; $i++) {
                // Calcul de l altitude de chaque point
                $point = $points[$intervalle["min"] + $i];
                $distance = $point["dist"] - $pointDepart["dist"];          // Distance du point par rapport au premier point
                $altitude = $pointDepart["alt"] + $pente * $distance;       // Fonction affine
                $points[$intervalle["min"] + $i]["alt"] = $altitude;
            }
        }
    }


    /* -------------------------- Arrondi des distances ------------------------- */
    foreach ($points as &$point) {
        $point["dist"] = round($point["dist"], 1);
    }



    /* --------------------------------- Retour --------------------------------- */
    return json_encode($points);
}

echo formatGPXExcursions("exemple.gpx");


/* ------------------------------- PRIMITIVES ------------------------------- */
function get_meters_between_points($latitude1, $longitude1, $latitude2, $longitude2)
{
    if (($latitude1 == $latitude2) && ($longitude1 == $longitude2)) {
        return 0;
    } // distance is zero because they're the same point
    $p1 = deg2rad($latitude1);
    $p2 = deg2rad($latitude2);
    $dp = deg2rad($latitude2 - $latitude1);
    $dl = deg2rad($longitude2 - $longitude1);
    $a = (sin($dp / 2) * sin($dp / 2)) + (cos($p1) * cos($p2) * sin($dl / 2) * sin($dl / 2));
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $r = 6371008; // Earth's average radius, in meters
    $d = $r * $c;
    return $d; // distance, in meters
}


?>