package com.mouzammil.location_voiture.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.mouzammil.location_voiture.entity.Car;
import com.mouzammil.location_voiture.entity.Location;
import com.mouzammil.location_voiture.repository.CarRepository;
import com.mouzammil.location_voiture.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.mouzammil.location_voiture.response.JsonResponse;

import java.util.List;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.io.IOException;

@RestController
public class CarController {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping("/cars")
    public ResponseEntity<List<Car>> getCars() {
        List<Car> cars = carRepository.findAll();
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/car/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        Car car = carRepository.findById(id).orElse(null);
        System.out.println(id);

        if (car == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(car);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Car>> serchCarsByMarque(@RequestParam String marque) {
        List<Car> cars = carRepository.findByMarqueContainingIgnoreCase(marque);

        return ResponseEntity.ok(cars);
    }

    @PostMapping("/car/add")
    public ResponseEntity<?> addCar(
            @RequestParam("immatriculation") String immatriculation,
            @RequestParam("marque") String marque,
            @RequestParam("carburant") String carburant,
            @RequestParam("kilometrage") int kilometrage,
            @RequestParam("passagers") int passagers,
            @RequestParam("transmission") String transmission,
            @RequestParam("prixLocation") float prixLocation,
            @RequestParam("disponibilite") String disponibilite,
            @RequestParam("lieuDepart") String lieuDepart,
            @RequestParam("dateDebut") String dateDebut,
            @RequestParam("dateFin") String dateFin,
            @RequestParam("image") String image) {

        try {

            Car car = new Car();
            car.setImmatriculation(immatriculation);
            car.setMarque(marque);
            car.setCarburant(carburant);
            car.setKilometrage(kilometrage);
            car.setPassagers(passagers);
            car.setTransmission(transmission);
            car.setPrixLocation(prixLocation);
            car.setDisponibilite(disponibilite);

            byte[] decodedBytes = Base64.getDecoder().decode(image.split(",")[1]);
            String fileUploadpath = System.getProperty("user.dir") + "/uploads";
            Path uploadDir = Paths.get(fileUploadpath);
            String fileName = System.currentTimeMillis() + ".jpg";
            Path filePath = uploadDir.resolve(fileName);

            try {
                Files.write(filePath, decodedBytes);
            } catch (IOException e) {
                return ResponseEntity.badRequest().body("Failed to save image: " + e.getMessage());
            }

            car.setImage(fileName);
            carRepository.save(car);

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDateDebut = dateFormat.parse(dateDebut);
            Date parsedDateFin = dateFormat.parse(dateFin);

            Location location = new Location();
            location.setLieuDepart(lieuDepart);
            location.setDateDebut(parsedDateDebut);
            location.setDateFin(parsedDateFin);
            location.setCar(car);

            locationRepository.save(location);

            return ResponseEntity.ok(new JsonResponse("La voiture a été enregistrée avec succès", null));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to register car : " + e.getMessage());
        }

    }

    @PostMapping("/car/edit/{id}")
    public ResponseEntity<?> editCar(
            @PathVariable Long id,
            @RequestParam("immatriculation") String immatriculation,
            @RequestParam("marque") String marque,
            @RequestParam("carburant") String carburant,
            @RequestParam("kilometrage") int kilometrage,
            @RequestParam("passagers") int passagers,
            @RequestParam("transmission") String transmission,
            @RequestParam("prixLocation") float prixLocation,
            @RequestParam("disponibilite") String disponibilite,
            @RequestParam("lieuDepart") String lieuDepart,
            @RequestParam("dateDebut") String dateDebut,
            @RequestParam("dateFin") String dateFin,
            @RequestParam(value = "image", required = false) String image) {

        Car car = carRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car not found"));

        try {

            car.setImmatriculation(immatriculation);
            car.setMarque(marque);
            car.setCarburant(carburant);
            car.setKilometrage(kilometrage);
            car.setPassagers(passagers);
            car.setTransmission(transmission);
            car.setPrixLocation(prixLocation);
            car.setDisponibilite(disponibilite);

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDateDebut = dateFormat.parse(dateDebut);
            Date parsedDateFin = dateFormat.parse(dateFin);

            System.out.println(image);

            if (image != null && !image.isEmpty()) {
                byte[] decodedBytes = Base64.getDecoder().decode(image.split(",")[1]);
                String fileUploadpath = System.getProperty("user.dir") + "/uploads";
                Path uploadDir = Paths.get(fileUploadpath);
                String fileName = System.currentTimeMillis() + ".jpg";
                Path filePath = uploadDir.resolve(fileName);

                try {
                    Files.write(filePath, decodedBytes);
                    car.setImage(fileName);
                } catch (IOException e) {
                    return ResponseEntity.badRequest().body("Failed to save image : " + e.getMessage());
                }
            }

            carRepository.save(car);

            Location location = locationRepository.findByCarId(id).orElse(new Location());
            location.setLieuDepart(lieuDepart);
            location.setDateDebut(parsedDateDebut);
            location.setDateFin(parsedDateFin);
            location.setCar(car);

            locationRepository.save(location);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update car :" + e.getMessage());
        }

        return ResponseEntity.ok(new JsonResponse("La voiture a été modifiée", null));
    }

    @DeleteMapping("/car/delete/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        carRepository.deleteById(id);
        return ResponseEntity.ok(new JsonResponse("La voiture a été supprimée.", null));
    }

}