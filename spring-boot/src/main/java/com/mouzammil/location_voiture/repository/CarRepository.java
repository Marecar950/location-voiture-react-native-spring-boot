package com.mouzammil.location_voiture.repository;

import com.mouzammil.location_voiture.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {
        List<Car> findByMarqueContainingIgnoreCase(String marque);

        @Query("SELECT c FROM Car c " +
                        "LEFT JOIN Location l ON c.id = l.car.id " +
                        "AND (l.lieuDepart = :lieuDepart OR :lieuDepart IS NULL) " +
                        "AND (l.dateFin >= :dateDebut OR :dateDebut IS NULL) " +
                        "AND (l.dateDebut <= :dateFin OR :dateFin IS NULL) ")
        List<Car> findAvailableCars(@Param("lieuDepart") String lieuDepart, @Param("dateDebut") Date dateDebut,
                        @Param("dateFin") Date dateFin);
}
