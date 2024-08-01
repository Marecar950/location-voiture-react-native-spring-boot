import { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config/Config';

function Reservation() {

    const route = useRoute();
    const { result, formData } = route.params || { result: {}, formData: { lieuDepart: '', dateDepart: '', dateRetour: ''}};
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); 
    const [message, setMessage] = useState('');

    const [formState, setFormState] = useState({
        licenceNumber: '',
        licenceExpirationDate: '',
        licenceCountry: '',
        ...formData
    });

    const formatDate = (isoDate) => {
        const dateObj = new Date(isoDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() +1;
        const year = dateObj.getFullYear();

        const formattedMonth = month < 10 ? `0${month}` : `${month}`;

        return `${day}/${formattedMonth}/${year}`;
    }

    const handleSubmit = async () => {

        const formDataToSend = new FormData();

            formDataToSend.append('voitureId', result.car.id);
            formDataToSend.append("prixTotal", result.prixTotal);
            formDataToSend.append('userId', userData.id);
            formDataToSend.append('email', userData.email);
            formDataToSend.append('lieuDepart', formData.lieuDepart);
            formDataToSend.append('dateDepart', format(formState.dateDepart, 'yyyy-MM-dd'));
            formDataToSend.append('dateRetour', format(formState.dateRetour, 'yyyy-MM-dd'));

        try {
            setLoading(true);

            const response = await axios.post(`${API_URL}/reservation/create`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data); 
            setMessage(response.data.message);
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Informations de votre réservation</Text>
                    <Text>Lieu de départ : {formData.lieuDepart}</Text>
                    <Text>Date de départ : {formatDate(formState.dateDepart)}</Text>
                    <Text>Date de retour : {formatDate(formState.dateRetour)}</Text>
                    <View style={styles.footer}>
                        <Text style={styles.bold}>Montant total pour {result.nombreDeJours} jours : {result.prixTotal} €</Text>
                    </View>
            </View>

            {!submitted ? (
                <>
                <View style={styles.card}>
                    <Text style={styles.title}>Informations personnelle</Text>
                    <View style={styles.inputContainer}>
                        <Text>Nom</Text>
                        <Text style={styles.input}>{userData.lastname}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Prénom</Text>
                        <Text style={styles.input}>{userData.firstname}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Date de naissance</Text>
                            <Text style={styles.input}>{formatDate(userData.dateOfBirth)}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Email</Text>
                        <Text style={styles.input}>{userData.email}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button color='#0d6efd' title='Confirmer la réservation' onPress={handleSubmit} disabled={loading} />
                    </View> 
                </View>
                </>
            ) : (
                <View style={styles.alert}>
                    <Text style={styles.successMessage}>{message}</Text>
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20
    },
    bold: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    inputContainer: {
        marginBottom: 15
    },
    input: {
        borderColor: '#ddd',
        borderRadius: 5,
        margnTop: 5  
    },
    footer: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',
        backgroundColor: '#d1e7dd',
        borderRadius: 5,
        paddingVertical: 10
    }
})

export default Reservation;