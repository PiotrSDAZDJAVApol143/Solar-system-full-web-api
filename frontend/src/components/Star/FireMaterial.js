// FireMaterial.js
import * as THREE from 'three';

/**
 * Poniższa implementacja:
 * - Używa niestandardowego shadera (ShaderMaterial),
 * - Zawiera wbudowany (Ashima) szum simplex 3D,
 * - W samplerFire() ogranicza promień do [rMin, rMax], by płomienie były
 *   tylko w zewnętrznej warstwie sfery.
 */
const simplexNoise3D = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  // x0 = x0 - 0. + 0.0 * C.xxx;
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  float n_ = 0.142857142857; // 1/7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod7
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.y;
  vec4 y = y_ *ns.x + ns.y;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xzyw ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.xzyw ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(
      dot(p0,p0), dot(p1,p1), 
      dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(
      dot(x0,x0), dot(x1,x1),
      dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(
      dot(p0,x0), dot(p1,x1),
      dot(p2,x2), dot(p3,x3)));
}
`;

const vertexShader = `
  varying vec3 vWorldPos;
  void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  #define ITERATIONS 16
  #define OCTAVES 4

  uniform sampler2D fireTex;
  uniform float time;
  uniform float seed;
  uniform float emissionStrength;
  uniform mat4 invModelMatrix;
  uniform vec3 scale;
  uniform vec4 noiseScale;
  uniform float magnitude;
  uniform float lacunarity;
  uniform float gain;

  varying vec3 vWorldPos;

  ${simplexNoise3D}

  float turbulence(vec3 p) {
    float sum = 0.0;
    float freq = 1.0;
    float amp = 1.0;
    for(int i = 0; i < OCTAVES; i++) {
      sum += abs(snoise(p * freq + time * 0.5)) * amp;
      freq *= lacunarity;
      amp *= gain;
    }
    return sum;
  }

  vec4 samplerFire(vec3 p) {
    float r = length(p);
    float rMin = 100.0;
    float rMax = 110.0;

    if(r < rMin || r > rMax) {
      return vec4(0.0);
    }

    float radialFactor = (r - rMin) / (rMax - rMin); 
    float yFactor = (p.y + 100.0) / 200.0;

    vec2 st = vec2(radialFactor, yFactor);

    vec3 pMod = p;
    pMod.y -= (seed + time * 0.1) * noiseScale.w;
    pMod *= noiseScale.xyz;

    float turb = turbulence(pMod);
    st.y += sqrt(radialFactor) * magnitude * turb;

    vec4 texColor = texture2D(fireTex, st);
    texColor.a = texColor.r * emissionStrength; 

    return texColor;
  }

  void main() {
    vec3 rayPos = vWorldPos;
    vec3 rayDir = normalize(vWorldPos - cameraPosition);

    float stepLen = 0.5;

    vec4 col = vec4(0.0);
    for(int i = 0; i < ITERATIONS; i++) {
      rayPos += rayDir * stepLen;
      vec3 lp = (invModelMatrix * vec4(rayPos, 1.0)).xyz;
      col += samplerFire(lp);
    }

    col.rgb *= emissionStrength;
    gl_FragColor = col;
  }
`;

export class FireMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                fireTex:    { value: null },
                time:       { value: 0.0 },
                seed:       { value: Math.random() * 10.0 },
                emissionStrength: { value: 1.5 },
                invModelMatrix: { value: new THREE.Matrix4() },
                scale:      { value: new THREE.Vector3(1,1,1) },
                noiseScale: { value: new THREE.Vector4(1.0, 1.0, 1.0, 0.3) },
                magnitude:  { value: 3.0 },
                lacunarity: { value: 2.5 },
                gain:       { value: 0.6 },
            },
            transparent: true,
            depthWrite: false,
            depthTest: false,
        });
    }
}
