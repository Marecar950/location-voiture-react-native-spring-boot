package com.mouzammil.location_voiture.service;

import com.mouzammil.location_voiture.response.CarResponseDTO;
import com.mouzammil.location_voiture.entity.Car;
import com.mouzammil.location_voiture.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    public List<CarResponseDTO> findAvailableCars(String lieuDepart, Date dateDebut, Date dateFin) {
        List<Car> availableCars = carRepository.findAvailableCars(lieuDepart, dateDebut, dateFin);

        long daysBetween = ChronoUnit.DAYS.between(dateDebut.toInstant(), dateFin.toInstant()) + 1;

        return availableCars.stream()
                .map(car -> new CarResponseDTO(car, daysBetween, car.getPrixLocation() * daysBetween))
                .collect(Collectors.toList());
    }

}
