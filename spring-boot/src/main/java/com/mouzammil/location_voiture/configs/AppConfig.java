package com.mouzammil.location_voiture.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    public String getAllowedOrigins() {
        return allowedOrigins;
    }

}
