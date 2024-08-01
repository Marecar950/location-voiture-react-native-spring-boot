import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config/Config';

function ConfirmRegistration() {
    const route = useRoute();
    const { token } = route.params;
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const navigation = useNavigation();
    const [error, setError] = useState('');

    useEffect(() => {
        console.log(token);
        const confirmRegistration = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/confirm_registration?token=${token}`);
                console.log(response.data);
                if (response.data.message) {
                    setConfirmationMessage(response.data.message);
                    navigation.navigate('login/Login');
                } else {
                    setError(response.data.error);
                }
            } catch (error) {
                console.error(error);
            }
        };

        confirmRegistration();
    }, [token]);

    return (
        <View>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Confirmation d'inscription</Text>
            {confirmationMessage !== '' && <Text style={{ margin: 20, color: 'green' }}>{confirmationMessage}</Text>}
            {error !== '' && <Text style={{ margin: 20, color: 'red' }}>{error}</Text>}
        </View>
    )
}

export default ConfirmRegistration;