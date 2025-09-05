import { StyleSheet } from 'react-native';
import { Colors, screenHeight, screenWidth } from '../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';

export const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: Colors.active,
        padding: 2,
        borderRadius: 50
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,

        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: RFValue(14),
        fontWeight: '400',
        color: '#222'
    },
    subTitle: {
        marginTop: 5,
        marginBottom: 18,
        color: "#777"
    },
    input: {
        height: 50,
        color: "#000",
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: RFValue(12),
    },
    textareainput: {
        height: 80,
        borderColor: '#ccc',
        color: "#000",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: RFValue(12),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF5A5F',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'OpenSans-Medium',
    },
});
