import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { format } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/Config';

function Profile() {

    const route = useRoute();
    const navigation = useNavigation();
    const [message, setMessage] = useState('');
    const [showDate, setShowDate] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { userData } = useAuth();

    const [formData, setFormData] = useState({
        civility: '',
        lastname: '',
        firstname: '',
        dateOfBirth: new Date(),
        email: ''
    });

    useEffect(() => {
        setFormData({
            civility: userData.civility,
            lastname: userData.lastname,
            firstname: userData.firstname,
            dateOfBirth: new Date(userData.dateOfBirth),
            email: userData.email
        })

    }, []);

    const handleChange= (name, value) => {
        setFormData(prevState => ({
            ...prevState, 
            [name]: value
        }));
    }

    const formatDate = (isoDate) => {
        const dateObj = new Date(isoDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() +1;
        const year = dateObj.getFullYear();

        const formattedMonth = month < 10 ? `0${month}` : `${month}`;

        return `${day}/${formattedMonth}/${year}`;
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const token = await AsyncStorage.getItem('userToken');
            console.log(token);

            const formDataToSend = new FormData();

            for (let key in formData) {
                if (key === 'dateOfBirth') {
                    formDataToSend.append(key, format(formData[key], 'yyyy-MM-dd'));
                } else {
                    formDataToSend.append(key, formData[key]);
                }    
            }

            const response = await axios.post(`${API_URL}/user/edit_profil`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }    
            });
            console.log(response.data);

            if (response.data.message) {
                setMessage(response.data.message);
                setSubmitted(true);
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Informations personnelles</Text>

            {!submitted ? (
                <>
                    <View style={styles.userInfo}>
                        <Text>Civilité</Text>
                        <View style={styles.pickerStyle}>
                            <Picker selectedValue={formData.civility} onValueChange={(itemValue => handleChange('civility', itemValue))}>
                                <Picker.Item label="Monsieur" value="Monsieur" />
                                <Picker.Item label="Madame" value="Madame" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <Text>Nom</Text>
                        <TextInput style={styles.input} onChangeText={(text) => handleChange('lastname', text)}>{formData.lastname}</TextInput>
                    </View>

                    <View style={styles.userInfo}>
                        <Text>Prénom</Text>
                        <TextInput style={styles.input} onChangeText={(text) => handleChange('firstname', text)}>{formData.firstname}</TextInput>
                    </View>

                    <View style={styles.userInfo}>
                        <Text>Date de naissance</Text>
                        <TouchableOpacity onPress={() => setShowDate(true)}>
                            <Text style={styles.input}>
                                {formData.dateOfBirth.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDate && (
                            <DateTimePicker
                            value={formData.dateOfBirth}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                const currentDate = selectedDate || formData.dateOfBirth;
                                setShowDate(false);
                                handleChange('dateOfBirth', currentDate);
                            }} 
                            />
                        )}
                    </View>

                    <View style={styles.userInfo}>
                        <Text>Adresse e-mail</Text>
                        <TextInput style={styles.input} handleChange={(text) => handleChange('email', text)}>{formData.email}</TextInput>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Modifier</Text>
                        )}    
                    </TouchableOpacity>
                </>
            ):(
                <>
                    <Text style={styles.message}>{message}</Text>
                    <Button title="Retour" onPress={() => navigation.navigate('account/Account', { userToken: userData.token })}></Button>
                </>
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 17,
        marginBottom: 30
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        height: 40,
        padding: 8
    },
    pickerStyle: {
        borderRadius: 5,
        backgroundColor: '#fff',
        elevation: 1
    },
    button: {
        backgroundColor: '#0d6efd',
        borderRadius: 5,
        alignItems: 'center',
        paddingVertical: 10
    },
    buttonText: {
        color: '#fff'
    },
    userInfo: {
        marginBottom: 10
    },
    message: {
        backgroundColor: '#d1e7dd',
        borderRadius: 5,
        textAlign: 'center',
        color: 'green',
        marginBottom: 10    
    }

});

export default Profile;