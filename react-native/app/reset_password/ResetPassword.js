import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from'@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config/Config';

function ResetPassword() {
    const route = useRoute();
    const { token } = route.params;
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handlechange= (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = async () => {

        if (formData.password !== formData.confirmPassword) {
            setPasswordError(true);
            return;
        }

        setPasswordError(false);

        try {
            setLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append("token", token);
            formDataToSend.append("password", formData.password);

            const response = await axios.put(`${API_URL}/user/reset_password`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.message) {
                setMessage(response.data.message);
                setSubmitted(true);
            }
            setError(response.data.error);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>

            <Text>Réinitialisation de votre mot de passe</Text>

            {error && <Text style={styles.error}>{error}</Text>}
            {passwordError && <Text style={styles.error}>Les mots de passe ne correspondent pas</Text>}

                    {!submitted ? (
                        <>
                        <View style={styles.form}>
                            <Text>Nouveau mot de passe</Text>
                            <TextInput style={styles.input} secureTextEntry onChangeText={(text) => handlechange('password', text)} />
                        </View>
        
                        <View style={styles.form}>
                            <Text>Confirmation de votre mot de passe</Text>
                            <TextInput style={styles.input} secureTextEntry onChangeText={(text) => handlechange('confirmPassword', text)} />
                        </View>
        
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            {loading ? (
                                <ActivityIndicator color='#fff' size='large' />
                            ): (
                                <Text style={styles.buttonText}>Confirmer</Text>
                            )}
                        </TouchableOpacity>
                        </>
                    ): (
                        <View style={styles.alert}>
                            <Text style={styles.message}>{message}</Text>
                        </View>    
                    )}
                
        </View>
    )
}

const styles= StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    form: {
        marginBottom: 10
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5   
    },
    button: {
        backgroundColor: '#0d6efd',
        borderRadius: 5,
        paddingVertical: 10
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center'
    },
    error: {
        color: 'red',
    },
    alert: {
        marginTop: 10,
    },
    message: {
        backgroundColor: '#d1e7dd',
        borderRadius: 5,
        textAlign: 'center',
        paddingVertical: 10
    }
})

export default ResetPassword;