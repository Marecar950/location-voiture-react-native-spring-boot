package com.mouzammil.location_voiture.response;

import com.mouzammil.location_voiture.entity.Car;

public class CarResponseDTO {
    private Car car;
    private long nombreDeJours;
    private float prixTotal;

    public CarResponseDTO(Car car, long nombreDeJours, float prixTotal) {
        this.car = car;
        this.nombreDeJours = nombreDeJours;
        this.prixTotal = prixTotal;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public long getNombreDeJours() {
        return nombreDeJours;
    }

    public void setNombreDeJours(long nombreDeJours) {
        this.nombreDeJours = nombreDeJours;
    }

    public float getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(float prixTotal) {
        this.prixTotal = prixTotal;
    }
}
