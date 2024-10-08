import { useState } from 'react';
import axios from 'axios';
import { View, TextInput, Button, Text, Image, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; 
import googleMapsApiKey from '../googleMapsApiKey';
import { API_URL } from '../config/Config';

function AddCarForm() {

    const [formData, setFormData] = useState({
        immatriculation: '',
        marque: '',
        carburant: '',
        kilometrage: '',
        passagers: '',
        transmission: '',
        prixLocation: '',
        disponibilite: '',
        lieuDepart: '',
        dateDebut: new Date(),
        dateFin: new Date(),
        image: null,
        imagePreview: null
    });

    const navigation = useNavigation();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [dateDebutPicker, setDateDebutPicker] = useState(false); 
    const [dateFinPicker, setDateFinPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const Google_Maps_Api_Key = googleMapsApiKey(); 

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImagePick = async () => {
        let result = {};

        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            const base64Image = await fetch(result.assets[0].uri)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    return new Promise((resolve, reject) => {
                        reader.onerror = reject;
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                });

            setFormData(prevState => ({
                ...prevState,
                image: base64Image,
                imagePreview: result.assets[0].uri
            }));
        }
    }

    const handleSubmit = async () => {
        setLoading(true);

        const formDataToSend = new FormData();

        for (let key in formData) {
            if (key === 'image') {
                formDataToSend.append('image', formData[key]);
            } else if (key === 'dateDebut' || key === 'dateFin') {
                formDataToSend.append(key, format(formData[key], 'yyyy-MM-dd'));
            }  else {
                formDataToSend.append(key, formData[key]);
            }
        }

        try {
            const response = await axios.post(`${API_URL}/car/add`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
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
            setLoading(false);
        }
    }

    return (
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container}>
        <View style={styles.card}>
            {!submitted ? (
                <View>
                    
                    <Text>Immatriculation :</Text>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder="Entrez l'immatriculation" onChangeText={text => handleChange('immatriculation', text)} style={styles.input} />
                    </View>

                    <Text>Marque :</Text>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder="Entrez la marque" onChangeText={text => handleChange('marque', text)} style={styles.input} />
                    </View>

                    <View style={styles.inputGroup}>
                    <Text>Type de carburant :</Text>
                    <View style={styles.pickerStyle}>
                        <Picker mode='dropdown' placeholder="Carburant" selectedValue={formData.carburant} onValueChange={(itemValue) => handleChange('carburant', itemValue)}>
                            <Picker.Item label="Choisissez une option" value="" />
                            <Picker.Item label="Essence" value="essence" />
                            <Picker.Item label="Diesel" value="diesel" />
                            <Picker.Item label="Electrique" value="electrique" />
                        </Picker>
                    </View>
                    </View>

                    <Text>Kilométrage :</Text>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder="Entrez le kilométrage" keyboardType="numeric" onChangeText={text => handleChange('kilometrage', text)} style={styles.input} />
                    </View>

                    <Text>Nombre de passagers :</Text>
                    <View style={styles.inputGroup}>    
                        <TextInput placeholder="Entrez le nombre de passagers" keyboardType="numeric" onChangeText={text => handleChange('passagers', text)} style={styles.input} />
                    </View>    

                    <Text>Transmission :</Text>
                    <View style={styles.pickerStyle}>
                        <Picker placeholder="Transmission" selectedValue={formData.transmission} onValueChange={(itemValue) => handleChange('transmission', itemValue)}>
                            <Picker.Item label="Choisissez une option" value="" />
                            <Picker.Item label="Manuelle" value="manuelle" />
                            <Picker.Item label="Automatique" value="automatique" />
                        </Picker>
                    </View>

                    <Text>Prix de la location par jour :</Text>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder="Entrez le prix de la location par jour" keyboardType="numeric" onChangeText={text => handleChange('prixLocation', text)} style={styles.input} />
                    </View>

                    <Text>Disponibilité :</Text>
                    <View style={styles.pickerStyle}>
                        <Picker selectedValue={formData.disponibilite} onValueChange={itemValue => handleChange('disponibilite', itemValue)} style={styles.picker}>
                            <Picker.Item label="Choisissez une option" value="" />
                            <Picker.Item label="Disponible" value="disponible" />
                            <Picker.Item label="Non disponible" value="non disponible" />
                        </Picker>
                    </View>

                    <Text>Lieu de départ :</Text>
                    <View style={styles.GooglePlaces}>
                        <GooglePlacesAutocomplete placeholder="Saisissez une ville" onPress={(data, details = null) => {
                            handleChange('lieuDepart', data.description);
                        }}
                        query={{
                            key: Google_Maps_Api_Key
                        }}
                        disableScroll={true}
                        />
                    </View>    
                    
                    <Text>Date de début de location :</Text>    
                    <View style={styles.inputGroup}>
                        <TouchableOpacity onPress={() => setDateDebutPicker(true)}>
                            <Text style={styles.input}>{formData.dateDebut.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                            {dateDebutPicker && (
                                <DateTimePicker
                                    value={formData.dateDebut}
                                    mode="date"
                                    display="default" 
                                    onChange={(event, selectedDate) => {
                                        const currentDate = selectedDate || formData.dateDebut;
                                        setDateDebutPicker(false);
                                        handleChange('dateDebut', currentDate);
                                    }}
                                />
                            )}
                    </View>

                    <Text>Date de fin de location :</Text>
                    <View style={styles.inputGroup}>        
                        <TouchableOpacity onPress={() => setDateFinPicker(true)}>
                            <Text style={styles.input}>{formData.dateFin.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                            {dateFinPicker && (
                                <DateTimePicker
                                    value={formData.dateFin}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        const currentDate = selectedDate || formData.dateFin;
                                        setDateFinPicker(false);
                                        handleChange('dateFin', currentDate);
                                    }}
                                />    
                            )}
                    </View>    

                    <View style={styles.inputGroup}>
                        <TouchableOpacity style={styles.button} onPress={handleImagePick}>
                            <Text>Choisir une image</Text>
                        </TouchableOpacity>
                        { formData.imagePreview && <Image source={{ uri: formData.imagePreview }} style={styles.imagePreview} /> }
                    </View>            
                            
                    <View style={styles.buttonContainer}>
                        <Button color='#6c757d' title="Retour" onPress={() => navigation.goBack()} />         
                        <Button color='#0d6efd' title ='Ajouter' onPress={handleSubmit} />
                    </View>    
                </View>
            ) : (
            <>
                <Text style={styles.successMessage}>{message}</Text>
                <Button title="Retour" onPress={() => navigation.navigate('voitures/Dashboard')} />
            </>
            )}
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20, 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 5,
        padding: 10
    },
    inputGroup: {
        marginBottom: 10,
    },
    GooglePlaces: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    pickerStyle: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#C0C0C0',
        padding: 10
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateText: {
        color: '#333'
    },
    imagePreview: {
        width: '100%',
        height: 150
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',   
    },
})

export default AddCarForm;