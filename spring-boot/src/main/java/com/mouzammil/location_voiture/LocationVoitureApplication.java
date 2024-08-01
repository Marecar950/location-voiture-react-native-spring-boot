package com.mouzammil.location_voiture;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class LocationVoitureApplication {

	public static void main(String[] args) {
		SpringApplication.run(LocationVoitureApplication.class, args);
	}

}
