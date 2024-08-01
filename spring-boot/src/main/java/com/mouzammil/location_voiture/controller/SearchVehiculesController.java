package com.mouzammil.location_voiture.controller;

import com.mouzammil.location_voiture.response.CarResponseDTO;
import com.mouzammil.location_voiture.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
public class SearchVehiculesController {

    @Autowired
    private CarService carService;

    @PostMapping("/search")
    public ResponseEntity<?> getCars(
            @RequestParam("lieuDepart") String lieuDepart,
            @RequestParam("dateDepart") @DateTimeFormat(pattern = "yyyy-MM-dd") String dateDepart,
            @RequestParam("dateRetour") @DateTimeFormat(pattern = "yyyy-MM-dd") String dateRetour) {

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        try {
            Date parsedDateDepart = dateFormat.parse(dateDepart);
            Date parsedDateRetour = dateFormat.parse(dateRetour);

            List<CarResponseDTO> availableCars = carService.findAvailableCars(lieuDepart, parsedDateDepart,
                    parsedDateRetour);

            return ResponseEntity.ok(availableCars);
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
