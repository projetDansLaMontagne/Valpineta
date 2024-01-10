import { SynchroMontanteStore } from "app/models";

export async function synchroMontante(
    titreSignalement,
    descriptionSignalement,
    photoSignalement,
    synchroMontanteStore,
) {
    let status = "attente";

    // Convertir le chemin de l'image en blob
    const blob = await fetch(photoSignalement).then(response => response.blob());

    // Convertir le blob en base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = function () {
        const base64data = reader.result;

        const unSignalement = {
            titre: titreSignalement,
            description: descriptionSignalement,
            photo: base64data,
        };

        if (
            !rechercheMemeSignalement(
                titreSignalement,
                descriptionSignalement,
                photoSignalement,
                synchroMontanteStore,
            )
        ) {
            synchroMontanteStore.addSignalement(unSignalement);
            status = "ajoute";
        } else {
            status = "existe";
        }

        console.log(synchroMontanteStore.signalements);
    };

    return status;
}

function rechercheMemeSignalement(
    titreSignalement: string,
    descriptionSignalement: string,
    photoSignalement: string,
    synchroMontanteStore: SynchroMontanteStore,
): boolean {
    let memeSignalement = false;

    synchroMontanteStore.signalements.forEach(signalement => {
        if (
            signalement.titre === titreSignalement &&
            signalement.description === descriptionSignalement &&
            signalement.photo === photoSignalement
        ) {
            memeSignalement = true;
        }
    });

    return memeSignalement;
}
