package com.mouzammil.location_voiture.controller;

import com.mouzammil.location_voiture.dto.LoginUserDto;
import com.mouzammil.location_voiture.response.LoginResponse;
import com.mouzammil.location_voiture.service.AuthenticationService;
import org.springframework.security.core.AuthenticationException;
import com.mouzammil.location_voiture.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;

@RestController
public class SecurityController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginUserDto loginUserDto) {
        LoginResponse loginResponse = new LoginResponse();

        try {
            UserDetails authenticatedUser = authenticationService.authenticate(loginUserDto);
            String jwtToken = jwtService.generateToken(authenticatedUser);

            loginResponse.setToken(jwtToken)
                    .setExpiresIn(jwtService.getExpirationTime());

            return ResponseEntity.ok(loginResponse);
        } catch (AuthenticationException e) {
            loginResponse.setError("Adresse email ou mot de passe incorrect.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(loginResponse);
        }
    }
}
