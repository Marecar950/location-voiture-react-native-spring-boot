import { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config/Config';

function Account() {

    const route = useRoute();
    const navigation = useNavigation();
    const { userToken } = route.params;
    const [data, setData] = useState({
        civility: '',
        lastname: '',
        firstname: '',
        dateOfBirth: new Date(),
        email: ''
    });

    const formatDate = (isoDate) => {
        const dateObj = new Date(isoDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() +1;
        const year = dateObj.getFullYear();

        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        
        return `${day}/${formattedMonth}/${year}`;
    }

        const fetchData = useCallback(async () => {
            try {
                const response = await axios.get(`${API_URL}/user/info`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });
                setData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);   
           }
        }, [userToken]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [userToken])        
       );

    return (
        <View style={styles.container}>

            <View style={styles.userInfo}>
                <Text>Civilité</Text>
                <Text style={styles.text}>{data.civility}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text>Nom</Text>
                <Text style={styles.text}>{data.lastname}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text>Prénom</Text>
                <Text style={styles.text}>{data.firstname}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text>Date de naissance</Text>
                <Text>{data.dateOfBirth ? formatDate(data.dateOfBirth) : '-'}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text>Adresse e-mail</Text>
                <Text style={styles.text}>{data.email}</Text>
            </View>
            <Button title="Modifier mon profil" color="#0d6efd" onPress={() => navigation.navigate('account/Profil')} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16
    },
    userInfo: {
        marginBottom: 10
    }
})

export default Account;