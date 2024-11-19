package org.example.solarapi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TexturesDTO {
    private String surfaceTexture;
    private String additionalTexture; // dla dodatkowych tekstur np nocne oświetlenie ziemskie
    private String cloudTexture;
    private String additionalCloudTexture; // dla dodatkowych efektów atmosferycznych
    private String bumpMapTexture;
    private String normalMapTexture;
    private String ambientOcclusionMapTexture;
    private String specularMapTexture;
}
