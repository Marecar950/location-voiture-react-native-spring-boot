package com.mouzammil.location_voiture.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mouzammil.location_voiture.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAll();

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}