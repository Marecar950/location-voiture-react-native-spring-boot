package com.mouzammil.location_voiture.controller;

import com.mouzammil.location_voiture.entity.Admin;
import com.mouzammil.location_voiture.repository.AdminRepository;
import com.mouzammil.location_voiture.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/admin/register")
    public ResponseEntity<String> registerAdmin(@RequestBody AdminRequest adminRequest) {
        try {

            Admin admin = new Admin();
            admin.setEmail(adminRequest.getEmail());
            admin.setPassword(passwordEncoder.encode(adminRequest.getPassword()));
            admin.setRole("ROLE_ADMIN");
            adminRepository.save(admin);

            return ResponseEntity.ok("Admin enregistré avec succès.");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de l'enregistrement de l'admin : " + e.getMessage());
        }
    }

    @GetMapping("/admin/info")
    public ResponseEntity<?> getAdminInfo(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7);
        Map<String, Object> adminInfo = jwtService.extractAllAdminDetails(jwtToken);

        return ResponseEntity.ok(adminInfo);
    }

    public static class AdminRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

}
