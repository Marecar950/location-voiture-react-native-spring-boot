package com.mouzammil.location_voiture.service;

import com.mouzammil.location_voiture.entity.User;
import com.mouzammil.location_voiture.entity.Admin;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import io.jsonwebtoken.io.Decoders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-time}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("id", Long.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Map<String, Object> extractAllUserDetails(String token) {
        Claims claims = extractAllClaims(token);
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", claims.get("id"));
        userDetails.put("civility", claims.get("civility"));
        userDetails.put("lastname", claims.get("lastname"));
        userDetails.put("firstname", claims.get("firstname"));
        userDetails.put("dateOfBirth", new Date((Long) claims.get("dateOfBirth")));
        userDetails.put("email", claims.get("email"));
        userDetails.put("role", claims.get("role"));

        return userDetails;
    }

    public Map<String, Object> extractAllAdminDetails(String token) {
        Claims claims = extractAllClaims(token);
        Map<String, Object> adminDetails = new HashMap<>();
        adminDetails.put("email", claims.get("email"));
        adminDetails.put("role", claims.get("role"));

        return adminDetails;
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            claims.put("id", user.getId());
            claims.put("civility", user.getCivility());
            claims.put("lastname", user.getLastname());
            claims.put("firstname", user.getFirstname());
            claims.put("dateOfBirth", user.getDateOfBirth());
            claims.put("email", user.getEmail());
            claims.put("role", user.getRole());
        } else if (userDetails instanceof Admin) {
            Admin admin = (Admin) userDetails;
            claims.put("email", admin.getEmail());
            claims.put("role", admin.getRole());
        }
        return createToken(claims, userDetails);
    }

    private String createToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
