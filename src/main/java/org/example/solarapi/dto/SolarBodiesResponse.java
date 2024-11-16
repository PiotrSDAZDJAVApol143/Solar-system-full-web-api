package org.example.solarapi.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.solarapi.model.SolarBodies;

import java.util.List;

@Setter
@Getter
public class SolarBodiesResponse {
    private List<SolarBodies> bodies;

}
