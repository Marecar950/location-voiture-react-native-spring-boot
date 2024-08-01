import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_URL } from '../config/Config';

function Login() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const { login, loginAdmin } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit =async () => {
        setLoading(true);           

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: formData.email,
                password: formData.password
            }, {    
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);

            if (response.data.token) {
                login(response.data.token);
            }  

            const decodedToken = jwtDecode(response.data.token);
            const role = decodedToken.role;
            
            if (role === 'ROLE_ADMIN') {
                loginAdmin(response.data.token);
                navigation.navigate('voitures/Dashboard');
            } else {
                navigation.navigate('Accueil');
            } 

        } catch (error) {
            if (error.response.data.error) {
                setError(error.response.data.error);
            }
        } finally {
            setLoading(false);
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Connectez-vous pour accéder à votre compte</Text>    
                    {error ? <Text style={styles.error}>{error}</Text> : null}    
                    <Text>Adresse email</Text>
                    <View style={styles.form}>
                        <TextInput style={styles.input} keyboardType="email-address" onChangeText={text => handleChange('email', text)} />
                    </View>

                    <Text>Mot de passe</Text>
                    <View styles={styles.form}>
                        <TextInput style={styles.input} secureTextEntry onChangeText={text => handleChange('password', text)} />
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('reset_password/Verify_mail')}>
                        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ): (
                            <Text style={styles.buttonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16
    },
    card: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        elevation: 3
    },
    title: {
        fontSize: 15,
        marginBottom: 20
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#0d6efd',
        borderRadius: 5,
        alignItems: 'center',
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff'
    },
    forgotPassword: {
        color: 'blue',
        textAlign: 'right',
        marginBottom: 20
    },
    form: {
        marginBottom: 10
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 11
    }
})

export default Login;