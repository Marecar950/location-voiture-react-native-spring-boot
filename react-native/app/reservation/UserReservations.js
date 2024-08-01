import { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config/Config';

function UserReservations() {

    const [reservations, setReservations] = useState([]);
    const  [success, setSuccess] = useState('');
    const route = useRoute();
    const { userToken } = route.params;

    const formatDate = (isoDate) => {
        const dateObj = new Date(isoDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() +1;
        const year = dateObj.getFullYear();

        const formattedMonth = month < 10 ? `0${month}` : `${month}`;

        return `${day}/${formattedMonth}/${year}`;
    }

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get(`${API_URL}/reservations/user`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });
                console.log(response.data);
                setReservations(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des réservations', error);
            }
        };

        fetchReservations();
    }, []);

    const renderItem = ({ item }) => (
        <>
            <View>
                <Image source={{ uri: `${API_URL}/uploads/${item.car.image}` }} style={styles.image} />
            </View>
            <View style={styles.item}>
                <Text style={styles.text}>{item.car.marque}</Text>
                <Text>Lieu de départ : { item.lieuDepart}</Text>
                <Text>Date de départ : {formatDate(item.dateDepart)}</Text>
                <Text>Date de retour : {formatDate(item.dateRetour)}</Text>
                <Text>Prix total : {item.prixTotal} €</Text>
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes réservations</Text>
            {success && <Text style={styles.message}>{success}</Text>
            }
            <FlatList data={reservations} renderItem={renderItem} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        marginBottom: 20
    },
    item:{
        padding: 15,
        borderBottomWidth: 1,
    },
    text: {
        fontSize: 16,
        marginBottom: 5
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain'
    },
    statut: {
        color: 'green'
    },
    message: {
        backgroundColor: '#d1e7dd',
        color: 'green',
        textAlign: 'center',
        padding: 8
    }
})

export default UserReservations;