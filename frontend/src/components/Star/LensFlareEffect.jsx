import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { easing } from 'maath';
import { BlendFunction, Effect } from 'postprocessing';
import { useRef, useMemo, useEffect, forwardRef, useLayoutEffect } from 'react';
import { Uniform, Color, Vector3 } from 'three';

const LensFlareShader = {
    fragmentShader: /* glsl */ `
  uniform float iTime;
  uniform vec2 lensPosition;
  uniform vec2 iResolution;
  uniform vec3 colorGain;
  uniform float glareSize;
  uniform float flareSize;
  uniform float flareSpeed;
  uniform float flareShape;
  uniform float haloScale;
  uniform float opacity;
  uniform bool animated;
  uniform bool anamorphic;
  uniform bool enabled;
  uniform bool secondaryGhosts;
  uniform bool starBurst;
  uniform float ghostScale;
  uniform bool aditionalStreaks;
  uniform sampler2D lensDirtTexture;

  void mainImage(vec4 v, vec2 r, out vec4 i) {
    vec2 uv = r - 0.5;
    uv.y *= iResolution.y / iResolution.x;
    vec3 color = vec3(0.0);
    float dist = length(uv - lensPosition);
    float strength = 1.0 / (dist * 10.0 + 1.0);
    color += strength * colorGain;
    i = vec4(color, opacity);
  }
  `
};

export class LensFlareEffect extends Effect {
    constructor({
                    blendFunction = BlendFunction.NORMAL,
                    enabled = true,
                    glareSize = 0.2,
                    lensPosition = [0.01, 0.01],
                    iResolution = [0, 0],
                    animated = true,
                    colorGain = new Color(70, 70, 70),
                    opacity = 1.0,
                } = {}) {
        super('LensFlareEffect', LensFlareShader.fragmentShader, {
            blendFunction,
            uniforms: new Map([
                ['enabled', new Uniform(enabled)],
                ['glareSize', new Uniform(glareSize)],
                ['lensPosition', new Uniform(lensPosition)],
                ['iTime', new Uniform(0)],
                ['iResolution', new Uniform(iResolution)],
                ['animated', new Uniform(animated)],
                ['colorGain', new Uniform(colorGain)],
                ['opacity', new Uniform(opacity)]
            ])
        });
    }

    update(renderer, inputBuffer, deltaTime) {
        this.uniforms.get('iTime').value += deltaTime;
    }
}

const wrapEffect = (effectImpl) =>
    forwardRef(({ blendFunction, opacity, ...props }, ref) => {
        const invalidate = useThree((state) => state.invalidate);
        const effect = useMemo(() => new effectImpl(props), [props]);

        useLayoutEffect(() => {
            effect.blendMode.blendFunction = blendFunction ?? BlendFunction.NORMAL;
            if (opacity !== undefined) effect.blendMode.opacity.value = opacity;
            invalidate();
        }, [blendFunction, effect.blendMode, opacity]);

        return <primitive object={effect} ref={ref} dispose={null} />;
    });

export default function LensFlare({
                                      position = { x: 0, y: 0, z: 0 },
                                      blendFunction,
                                      opacity = 1.0,
                                      colorGain = new Color(70, 70, 70),
                                  }) {
    const lensRef = useRef();
    const { viewport, camera } = useThree();
    const screenPosition = new Vector3(position.x, position.y, position.z);

    useFrame(() => {
        screenPosition.project(camera);
        lensRef.current.uniforms.get('lensPosition').value.set(screenPosition.x, screenPosition.y);
    });

    useEffect(() => {
        lensRef.current.uniforms.get('iResolution').value.set(viewport.width, viewport.height);
    }, [viewport]);

    const LensFlareWrapped = wrapEffect(LensFlareEffect);
    return (
        <LensFlareWrapped
            ref={lensRef}
            blendFunction={blendFunction}
            opacity={opacity}
            colorGain={colorGain}
        />
    );
}