Configuration de l'application mobile (React Native)

1. Naviguer vers le répertoire React Native :

`cd react-native`

2. Installer les dépendances :

`npm install`

ou 

`yarn install`

3. Configurer Axios pour le backend dans react-native/app/config/Config.js :

export const API_URL = 'http://192.168.1.136:8080'

4. Ouvrez l'application Expo Go sur votre appareil mobile et démarrer l'application avec Expo :

`npx expo start`


Configuration Backend (Java Spring Boot)

1. Naviguer vers le répertoire Java Spring Boot :

`cd spring-boot`

2. Modifier les paramètres dans `application.properties` :

# Configuration de la base de données
spring.datasource.url=jdbc:mysql://localhost:3306/location-voiture
spring.datasource.username=root
spring.datasource.password=

# Configuration de l'email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=mouzammilm2000@gmail.com
spring.mail.password=mxplqafctfekqicu

# Configuration CORS
cors.allowed.origins=http://192.168.1.136:8081

3. Configurer la base de données :

Importer le fichier `V1__init.sql` depuis `db/migration` dans phpMyAdmin. 

4. Démarrer l'application Spring Boot :

`./mvnw spring-boot:run`

5. Utilisation de Postman pour inscrire un Administrateur

  1. Ouvrez Postman 
  
  2. Définir la méthode et l'URL : 

    Changez la méthode de la requête en `POST`.

    Entrez l'URL : `http://API_URL:8080/admin/register`

  3. Ajoutez le contenu JSON dans le corps de la requête :

    `{
        "email": "admin@admin.fr",
        "password": "password"
    }`