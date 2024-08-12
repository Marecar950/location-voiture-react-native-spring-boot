package com.mouzammil.location_voiture.controller;

import com.mouzammil.location_voiture.entity.Reservation;
import com.mouzammil.location_voiture.entity.User;
import com.mouzammil.location_voiture.entity.Car;
import com.mouzammil.location_voiture.response.JsonResponse;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import com.mouzammil.location_voiture.repository.ReservationRepository;
import com.mouzammil.location_voiture.repository.UserRepository;
import com.mouzammil.location_voiture.repository.CarRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.mouzammil.location_voiture.service.JwtService;

import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;

@RestController
public class ReservationController {

    private final JwtService jwtService;

    public ReservationController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/reservation/create")
    public ResponseEntity<?> reservationCreate(
            @RequestParam("userId") Long userId,
            @RequestParam("voitureId") Long carId,
            @RequestParam("prixTotal") float prixTotal,
            @RequestParam("email") String email,
            @RequestParam("lieuDepart") String lieuDepart,
            @RequestParam("dateDepart") String dateDepart,
            @RequestParam("dateRetour") String dateRetour) {

        try {

            User user = userRepository.findById(userId).orElse(null);

            Car car = carRepository.findById(carId).orElse(null);

            Reservation reservation = new Reservation();
            reservation.setUser(user);
            reservation.setCar(car);
            reservation.setLieuDepart(lieuDepart);

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDateDepart = dateFormat.parse(dateDepart);
            Date parsedDateRetour = dateFormat.parse(dateRetour);
            reservation.setDateDepart(parsedDateDepart);
            reservation.setDateRetour(parsedDateRetour);
            reservation.setPrixTotal(prixTotal);

            reservationRepository.save(reservation);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("mouzammilm2000@gmail.com");
            message.setTo(email);
            message.setSubject("Confirmation de votre réservation");
            message.setText("Bonjour,\n\n" +
                    "Votre réservation a été confirmée.\n\n" +
                    "Voici les détails de votre réservation :\n\n" +
                    "Lieu de départ : " + lieuDepart + "\n" +
                    "Date de départ : " + dateFormat.format(parsedDateDepart) + "\n" +
                    "Date de retour : " + dateFormat.format(parsedDateRetour) + "\n" +
                    "Prix total : " + prixTotal + " €" + "\n\n" +
                    "L'équipe de location de voitures");
            mailSender.send(message);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        return ResponseEntity.ok(new JsonResponse("Votre réservation a été confirmée.", null));
    }

    @GetMapping("/reservations/user")
    public ResponseEntity<?> getUserReservations(@RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String userId;
            try {
                userId = String.valueOf(jwtService.extractUserId(jwtToken));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            List<Reservation> reservations = reservationRepository.findByUserId(Long.parseLong(userId));
            if (reservations.isEmpty()) {
                return ResponseEntity.status(404).body("Aucune réservation");
            }
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des réservations.");

        }
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getReservations() {
        try {
            List<Reservation> reservations = reservationRepository.findAll();

            if (reservations.isEmpty()) {
                return ResponseEntity.status(404).body(new JsonResponse(null, "Aucune réservation"));
            }
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur lors de la récupération des réservations : " + e.getMessage());
        }
    }

}
