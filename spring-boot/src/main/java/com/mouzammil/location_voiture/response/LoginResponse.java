package com.mouzammil.location_voiture.response;

public class LoginResponse {
    private String token;
    private long expiresIn;
    private String error;

    public String getToken() {
        return token;
    }

    public LoginResponse setToken(String token) {
        this.token = token;
        return this;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponse setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }

    public String getError() {
        return error;
    }

    public LoginResponse setError(String error) {
        this.error = error;
        return this;
    }

    @Override
    public String toString() {
        return "LoginResponse{" +
                "token'" + token + '\'' +
                ", expiresIn=" + expiresIn +
                '}';
    }
}