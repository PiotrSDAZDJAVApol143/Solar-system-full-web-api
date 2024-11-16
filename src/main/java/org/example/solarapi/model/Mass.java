package org.example.solarapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Embeddable
@Getter
@Setter
@ToString
public class Mass {
    //Wartość masy.
    //Wyjaśnienie: Liczba reprezentująca wartość masy.
    @Column(name = "mass_value")
    private Double massValue;
    //Wykładnik masy.
    //Wyjaśnienie: Wykładnik potęgi 10, do której należy przemnożyć massValue, aby uzyskać masę w jednostkach podstawowych.
    @Column(name = "mass_exponent")
    private Integer massExponent;
}
