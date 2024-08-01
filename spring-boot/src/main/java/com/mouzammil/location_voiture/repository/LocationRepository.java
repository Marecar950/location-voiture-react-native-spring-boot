package com.mouzammil.location_voiture.repository;

import com.mouzammil.location_voiture.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCarId(Long carId);
}
