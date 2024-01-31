import { Text } from "app/components";
import { colors, spacing } from "app/theme";
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';


export interface ExcursionTermineeProps {
    navigation: any;
    modalExcursionTermineeVisible: boolean;
    setModalExcursionTermineeVisible: (modalExcursionTermineeVisible: boolean) => void;
}

export function ExcursionTerminee(props: ExcursionTermineeProps) {
    const { navigation, modalExcursionTermineeVisible, setModalExcursionTermineeVisible } = props;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalExcursionTermineeVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle} tx="detailsExcursion.popup.excursionTerminee.felicitations" size="xl" weight="bold" />
                    <Text style={styles.modalText} tx="detailsExcursion.popup.excursionTerminee.message" size="lg" />
                    <View style={styles.containerBouton}>
                        <TouchableOpacity
                            style={[styles.button, { opacity: 0.7 }]}
                            onPress={() => setModalExcursionTermineeVisible(!modalExcursionTermineeVisible)}>
                            <Text style={styles.textStyle} tx="detailsExcursion.popup.excursionTerminee.fermer" size="sm" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => { setModalExcursionTermineeVisible(!modalExcursionTermineeVisible); navigation.navigate("Carte") }}>
                            <Text style={styles.textStyle} tx="detailsExcursion.popup.excursionTerminee.accueil" size="sm" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    modalView: {
        margin: spacing.xl,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: spacing.xs,
        paddingHorizontal: spacing.lg,
        elevation: 2,
        lineHeight: 20,
        backgroundColor: colors.palette.vert,
        shadowColor: colors.palette.noir,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.32,
        shadowRadius: 2.22,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 20,
    },
    modalTitle: {
        marginBottom: 0,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        lineHeight: 24,
    },
    containerBouton: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    }
});
