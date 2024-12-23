package org.example.solarapi.service;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import org.example.solarapi.dto.SolarBodiesResponse;
import org.example.solarapi.model.SolarBodies;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.logging.Logger;
@Service
public class HttpClientService<T> {
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Logger logger = Logger.getLogger(HttpClientService.class.getName());

    public T getPlanetDetails(String url, Class<T> responseClass) {
        try {
            String currentUrl = url;
            HttpResponse<String> response;
            int retryCount = 0;
            while (retryCount < 5) {
                var request = HttpRequest
                        .newBuilder()
                        .uri(new URI(currentUrl))
                        .GET()
                        .header("Accept", "application/json")
                        .build();

                response = client.send(request, HttpResponse.BodyHandlers.ofString());
                var bodyAsString = response.body();
                logger.info("API Response: " + bodyAsString);

                if (response.statusCode() == 301 || response.statusCode() == 302) {
                    // ...
                } else if (response.statusCode() == 200) {

                    // **DORZUĆ** logowanie:
                    logger.info(
                            "getPlanetDetails(): code=200, length(body)="
                                    + (bodyAsString != null ? bodyAsString.length() : "null")
                    );

                    // **SPRAWDŹ**, czy ciało nie jest puste:
                    if (bodyAsString == null || bodyAsString.isBlank()) {
                        logger.warning("Body is null/blank from " + currentUrl + ", returning null...");
                        return null;
                    }

                    final Gson gson = new GsonBuilder().registerTypeAdapter(
                            LocalDateTime.class,
                            (JsonDeserializer<LocalDateTime>) (json, type, context) -> {
                                var dateTimeJson = json.getAsJsonPrimitive().getAsLong();
                                return LocalDateTime.ofInstant(Instant.ofEpochMilli(dateTimeJson), ZoneId.systemDefault());
                            }
                    ).create();

                    return gson.fromJson(bodyAsString, responseClass);

                } else if (response.statusCode() == 404) {
                    logger.warning("Resource not found: " + currentUrl);
                    return null;
                } else {
                    logger.warning("Unexpected response code: " + response.statusCode());
                    retryCount++;
                    Thread.sleep(1000);
                }
            }
        } catch (IOException | InterruptedException | URISyntaxException e) {
            logger.severe("Error fetching data: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    public List<SolarBodies> getAllSolarBodies(String url) {
        try {
            var request = HttpRequest
                    .newBuilder()
                    .uri(new URI(url))
                    .GET()
                    .header("Accept", "application/json")
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            var bodyAsString = response.body();
            logger.info("API Response: " + bodyAsString);

            if (response.statusCode() == 200) {
                final Gson gson = new GsonBuilder().registerTypeAdapter(
                        LocalDateTime.class,
                        new JsonDeserializer<LocalDateTime>() {
                            @Override
                            public LocalDateTime deserialize(JsonElement json, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
                                var dateTimeJson = json.getAsJsonPrimitive().getAsLong();
                                return LocalDateTime.ofInstant(Instant.ofEpochMilli(dateTimeJson), ZoneId.systemDefault());
                            }
                        }
                ).create();
                SolarBodiesResponse solarBodiesResponse = gson.fromJson(bodyAsString, SolarBodiesResponse.class);
                return solarBodiesResponse.getBodies();
            } else {
                logger.warning("Unexpected response code: " + response.statusCode());
                return null;
            }
        } catch (IOException | InterruptedException | URISyntaxException e) {
            logger.severe("Error fetching data: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static String encodeValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

