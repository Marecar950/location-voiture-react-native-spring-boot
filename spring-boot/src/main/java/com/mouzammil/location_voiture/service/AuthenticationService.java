package com.mouzammil.location_voiture.service;

import com.mouzammil.location_voiture.dto.LoginUserDto;
import com.mouzammil.location_voiture.entity.User;
import com.mouzammil.location_voiture.entity.Admin;
import com.mouzammil.location_voiture.repository.UserRepository;
import com.mouzammil.location_voiture.repository.AdminRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AdminRepository adminRepository,
            AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    public UserDetails authenticate(LoginUserDto loginUserDto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginUserDto.getEmail(),
                        loginUserDto.getPassword()));

        User user = userRepository.findByEmail(loginUserDto.getEmail()).orElse(null);
        if (user != null) {
            return user;
        }

        Admin admin = adminRepository.findByEmail(loginUserDto.getEmail()).orElse(null);
        if (admin != null) {
            return admin;
        }

        throw new UsernameNotFoundException("User not found : " + loginUserDto.getEmail());

    }
}
