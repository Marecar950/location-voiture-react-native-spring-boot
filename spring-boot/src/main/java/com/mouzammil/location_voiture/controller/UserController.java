package com.mouzammil.location_voiture.controller;

import com.mouzammil.location_voiture.entity.User;
import com.mouzammil.location_voiture.repository.UserRepository;
import com.mouzammil.location_voiture.response.JsonResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import com.mouzammil.location_voiture.service.JwtUserDetailsService;
import com.mouzammil.location_voiture.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    private final JwtService jwtService;

    public UserController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUserDetailsService userDetailsService;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam("civility") String civility,
            @RequestParam("lastname") String lastname,
            @RequestParam("firstname") String firstname,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("email") String email,
            @RequestParam("password") String password) {

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.ok(new JsonResponse(null, "Cet adresse email existe déjà."));
        }

        try {

            User user = new User();
            user.setCivility(civility);
            user.setLastname(lastname);
            user.setFirstname(firstname);

            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedBirthDate = formatter.parse(dateOfBirth);
            user.setDateOfBirth(parsedBirthDate);

            user.setEmail(email);

            String hashedPassword = passwordEncoder.encode(password);
            user.setPassword(hashedPassword);

            user.setRole("ROLE_USER");
            user.setConfirmed(false);
            userRepository.save(user);

            try {

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                String token = jwtService.generateToken(userDetails);
                user.setToken(token);
                userRepository.save(user);

                String confirmationLink = allowedOrigins + "/registration/ConfirmRegistration?token=" + token;

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("mouzammilm2000@gmail.com");
                message.setTo(email);
                message.setSubject("Confirmation de votre inscription");
                message.setText("Cliquez sur le lien pour confirmer votre inscription : " + confirmationLink);
                mailSender.send(message);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'envoie de l'email : " + e.getMessage());
        }

        return ResponseEntity
                .ok(new JsonResponse("Veuillez vérifier votre adresse email pour confirmer votre inscription.",
                        null));
    }

    @GetMapping("/confirm_registration")
    public ResponseEntity<?> confirmRegistration(@RequestParam("token") String token) {

        try {
            String email = jwtService.extractUsername(token);
            Optional<User> optionalUser = userRepository.findByEmail(email);

            if (!optionalUser.isPresent()) {
                return ResponseEntity.ok().body(new JsonResponse(null, "Token invalide"));
            }

            User user = optionalUser.get();

            if (!token.equals(user.getToken())) {
                return ResponseEntity.ok().body(new JsonResponse(null, "Token invalide"));
            }

            user.setConfirmed(true);
            user.setToken(null);
            userRepository.save(user);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error confirming registration: " + e.getMessage());
        }

        return ResponseEntity.ok(new JsonResponse("Confirmation d'inscription réussie", null));
    }

    @PostMapping("/edit_profil")
    public ResponseEntity<?> editProfil(
            @RequestHeader(value = "Authorization") String token,
            @RequestParam(value = "civility") String civility,
            @RequestParam(value = "lastname") String lastname,
            @RequestParam(value = "firstname") String firstname,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam(value = "email") String email) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String jwtToken = token.substring(7);
        String userId;
        try {
            userId = String.valueOf(jwtService.extractUserId(jwtToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }

        try {

            User user = userRepository.findById(Long.parseLong(userId)).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDateOfBirth = dateFormat.parse(dateOfBirth);

            user.setCivility(civility);
            user.setLastname(lastname);
            user.setFirstname(firstname);
            user.setDateOfBirth(parsedDateOfBirth);
            user.setEmail(email);
            userRepository.save(user);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        return ResponseEntity.ok(new JsonResponse("Vos informations ont été modifiées", null));
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7);

        try {
            Long userId = jwtService.extractUserId(jwtToken);
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Map<String, Object> userInfo = Map.of(
                    "id", user.getId(),
                    "civility", user.getCivility(),
                    "lastname", user.getLastname(),
                    "firstname", user.getFirstname(),
                    "dateOfBirth", user.getDateOfBirth(),
                    "email", user.getEmail(),
                    "role", user.getRole());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    @GetMapping("/verify_mail")
    public ResponseEntity<?> verifyMail(@RequestParam("email") String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new JsonResponse(null, "Nous n'avons pas trouvé cet adresse email."));
        }

        User user = userOptional.get();

        try {

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);

            user.setPasswordResetToken(token);
            userRepository.save(user);

            String confirmationLink = allowedOrigins + "/reset_password/ResetPassword?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("mouzammilm2000@gmail.com");
            message.setTo(email);
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText("Cliquez sur le lien pour réinitialiser votre mot de passe : " + confirmationLink);
            mailSender.send(message);

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        return ResponseEntity
                .ok(new JsonResponse(
                        "Nous avons envoyé un lien de réinitialisation de mot de passe à cette adresse email.", null));
    }

    @PutMapping("/reset_password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("token") String token,
            @RequestParam("password") String password) {

        try {
            String email = jwtService.extractUsername(token);
            Optional<User> optionalUser = userRepository.findByEmail(email);

            User user = optionalUser.get();

            if (!token.equals(user.getPasswordResetToken())) {
                return ResponseEntity.ok().body(new JsonResponse(null, "Token invalide"));
            }

            String encodedPassword = passwordEncoder.encode(password);

            user.setPassword(encodedPassword);
            user.setPasswordResetToken(null);
            userRepository.save(user);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }

        return ResponseEntity.ok(new JsonResponse("Votre mot de passe a été modifiée", null));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return ResponseEntity.status(404).body(new JsonResponse(null, "Aucun utilisateur trouvé."));
            }

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs.");
        }
    }

}