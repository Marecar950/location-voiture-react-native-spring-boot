import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import moment from 'moment';
import { API_URL } from '../config/Config';

const ReservationCalendar = () => {
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get(`${API_URL}/reservations`);
                console.log("reservations : ", response.data);
                setReservations(response.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchReservations();
    }, []);

    const onDayPress = (day) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            setSelectedStartDate(day.dateString);
            setSelectedEndDate('');
        } else if (selectedStartDate && !selectedEndDate) {
            if (moment(day.dateString).isBefore(selectedStartDate)) {
                Alert.alert('Date invalide', 'La date de fin ne peut pas être antérieure à la date de début.');
            } else {
                setSelectedEndDate(day.dateString);
            }
        }
    };

    const renderReservationDetails = () => {
        if (selectedStartDate && selectedEndDate) {
            return (
                <View style={styles.reservationDetails}>
                    <Text>Réservation du {selectedStartDate} au {selectedEndDate}</Text>
                </View>
            );
        } else if (selectedStartDate) {
            return (
                <View style={styles.reservationDetails}>
                    <Text>Date de début sélectionnée : {selectedStartDate}</Text>
                </View>
            );
        }
        return null;
    };

    const formatReservationsForCalendar = () => {
        const formattedReservations = {};

        reservations.forEach((reservation) => {
            const startDate = moment(reservation.dateDepart).format('YYYY-MM-DD');
            const endDate = moment(reservation.dateRetour).format('YYYY-MM-DD');

            let currentDate = new Date(startDate);
            while (currentDate <= new Date(endDate)) {
                const dateString = moment(currentDate).format('YYYY-MM-DD');
                formattedReservations[dateString] = { marked: true, dotColor: 'red' };
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        return formattedReservations;
    };

    return (
        <View style={styles.container}>
            <Calendar
                onDayPress={onDayPress}
                markedDates={{
                    [selectedStartDate]: { selected: true, startingDay: true, color: 'blue' },
                    [selectedEndDate]: { selected: true, endingDay: true, color: 'blue' },
                    ...formatReservationsForCalendar()
                    
                      }}
                      markingType={'period'}
                    />
                    {renderReservationDetails()}  
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    reservationDetails: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5
    },
});

export default ReservationCalendar;