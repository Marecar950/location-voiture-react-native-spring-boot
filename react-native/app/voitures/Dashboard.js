import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Button, Image, Alert, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/Config';

function Dashboard() {

    const [voitures, setVoitures] = useState([]);
    const [filteredVoitures, setFilteredVoitures] = useState([]);
    const [filterOption, setFilterOption] = useState('all');
    const [departureLocation, setDepartureLocation] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

        const fetchVoitures = useCallback(async () => {  

            setLoading(true);

            try {
                const response = await axios.get(`${API_URL}/cars`);
                console.log(response.data);
                setVoitures(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des voitures :', error);
            } finally {
                setLoading(false);
            }
        }, []);

        useFocusEffect(
            useCallback(() => {
                fetchVoitures();
        }, [])
       );

    const filterCars = useCallback(() => {
        if (Array.isArray(voitures)) {
            if (filterOption === 'available') {
                setFilteredVoitures(voitures.filter(voiture => voiture.disponibilite === 'disponible'));   
            } else if (filterOption === 'unavailable') {
                setFilteredVoitures(voitures.filter(voiture => voiture.disponibilite !== 'disponible'));
            } else {
                setFilteredVoitures(voitures);
            }
        }
    }, [voitures, filterOption]);  
    
    useEffect(() => {
        filterCars();           
    }, [filterOption, voitures, filterCars]);

    const handleChange = async (searchValue) => {
        setSearch(searchValue);
        console.log(searchValue);

        try {
            const response = await axios.get(`${API_URL}/search?marque=${searchValue}`);
            setVoitures(response.data);
        } catch (error) {
            console.error('Erreur lors de la recherche :', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const responseDelete = await axios.delete(`${API_URL}/car/delete/${id}`);
            setFilteredVoitures(prevVoitures => prevVoitures.filter(voiture => voiture.id !== id));
            Alert.alert('Success', responseDelete.data.message);  
        } catch (error) {
            console.error('Erreur lors de la suppression de la voiture.');
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmation',
            'êtes-vous sûr de vouloir supprimer cette voiture ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', onPress: () => handleDelete(id), style: 'destructive' },
            ]
        );
    };

    return (
        <View style={styles.container}>

            <View style={styles.inputGroup}>
                <Text>Marque :</Text>
                    <TextInput
                        value={search}
                        style={styles.input}
                        placeholder="Recherchez par marque"
                        onChangeText={handleChange}
                    />
            </View>

            <View style={styles.inputGroup}>
                <Text>Disponibilité des voiture :</Text>
                <View style={styles.pickerStyle}>
                    <Picker
                        selectedValue={filterOption} 
                        onValueChange={(itemValue) => setFilterOption(itemValue)}>
                        <Picker.Item label="Toutes les voitures" value="all" />
                        <Picker.Item label="Voitures disponibles" value="available" />
                        <Picker.Item label="Voitures non disponibles" value="unavailable" />
                    </Picker> 
                </View>                    
            </View>

            <View style={{ marginBottom: 20 }}>
                <Button color="#198754" title="Ajouter une voiture" onPress={() => navigation.navigate('voitures/AddCarForm')} />
            </View>    

            {filteredVoitures && filteredVoitures.length > 0 ? (
            <FlatList data={filteredVoitures} keyExtractor={(item, index) => index.toString()} 
                renderItem={({  item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: `${API_URL}/uploads/${item.image}` }} style={styles.image} />
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.marque}</Text>    
                        <View style={styles.cardText}>    
                            <Text style={styles.inputGroup}>Type de carburant : {item.carburant}</Text>
                            <Text style={styles.inputGroup}>Kilométrage : {item.kilometrage} km</Text>
                            <Text style={styles.inputGroup}>Transmission : {item.transmission}</Text>
                            <Text style={styles.inputGroup}>Nombre de passagers : {item.passagers}</Text>
                            <Text style={styles.inputGroup}>Prix de la location : {item.prixLocation} €/jour</Text>
                            <Text style={styles.inputGroup}>Départ depuis : {item.locations[0].lieuDepart}</Text>
                            <Text style={styles.inputGroup}>Date de début : {new Date(item.locations[0].dateDebut).toLocaleDateString()}</Text>
                            <Text style={styles.inputGroup}>Date de fin : {new Date(item.locations[0].dateFin).toLocaleDateString()}</Text>
                        </View>    
                        </View>
                        <View style={styles.cardFooter}>
                            <Button color="#0d6efd" title="Modifier" onPress={() => navigation.navigate('voitures/EditCarForm', { id: item.id })} />
                            <Button title="Supprimer" color="red" onPress={() => confirmDelete(item.id)} />
                        </View>    
                    </View>
                )}
            />
            ) : (
                <View>
                    <Text>Aucune voiture</Text>
                </View>
            )} 
        </View>
    )

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 10,
    },
    input: {
        borderRadius: 5,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        marginBottom: 5,
        elevation: 1,
        padding: 10
    },
    picker: {
        height: 50,
    },
    pickerStyle: {
        borderRadius: 5,
        backgroundColor: '#fff',
        elevation: 1
    },

    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 0.2,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover'
    },

    cardContent: {
        marginTop: 10,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardText: {
        marginTop: 20
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    }
})

export default Dashboard;