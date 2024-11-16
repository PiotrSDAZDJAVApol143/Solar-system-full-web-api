package org.example.solarapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class SolarApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolarApiApplication.class, args);
    }

}
