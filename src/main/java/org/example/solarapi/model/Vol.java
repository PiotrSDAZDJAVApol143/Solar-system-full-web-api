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
class Vol {
    //Wartość objętości.
    //Wyjaśnienie: Liczba reprezentująca wartość objętości.
    @Column(name = "vol_value")
    private Double volValue;
    //Wykładnik objętości.
    //Wyjaśnienie: Wykładnik potęgi 10, do której należy przemnożyć volValue, aby uzyskać objętość w jednostkach podstawowych.
    @Column(name = "vol_exponent")
    private Integer volExponent;
}
