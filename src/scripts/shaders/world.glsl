precision highp float;

#define PI 3.1415926535897932384626433832795

// STRUCTURES

struct Camera
{
  float near;
  float far;
  float fov;
  mat4 modelViewMatrix;
};

struct Voxel
{
  float dist;
  vec4 color;
};

// UNIFORMS

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform Camera uCamera;

// PRIMITIVES

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

// UTILS

Voxel smin( Voxel voxel1, Voxel voxel2, float blendRatio )
{
  float ratio = clamp(.5 + .5 * (voxel2.dist - voxel1.dist) / blendRatio, 0., 1.);

  float dist = mix(voxel2.dist, voxel1.dist, ratio) - blendRatio * ratio * (1. - ratio);
  vec4 color = mix(voxel2.color, voxel1.color, ratio);

  return Voxel(dist, color);
}

Voxel min( Voxel voxel1, Voxel voxel2 )
{
  if(voxel1.dist - voxel2.dist < 0.) {
    return voxel1;
  }
  else {
    return voxel2;
  }
}

// MAIN

Voxel ground( vec3 p) {

  vec2 uv = fract(p.xz / 1024.0 + .5);
  vec4 texture = texture2D(uTexture, uv);

  float displacement = pow(texture.r, 1.);

  float scale = 40.;

  p.xz = mod(p.xz, 1.) - 0.5 * 1.;
  p.y += displacement * .5 * scale;
  float dist = udBox(p, vec3(.5, displacement * scale, .5));


  vec4 color = vec4(vec3(p.y / scale), 1.0);

  return Voxel(dist, color);
}

Voxel map( vec3 p) {

  Voxel voxel = Voxel(uCamera.far, vec4(1.));

  voxel = min(voxel, ground(p));


  return voxel;
}

vec3 calcNormal ( vec3 p ) {
  vec2 e = vec2(.0001, 0.0);
  return normalize(vec3(
    map(p + e.xyy).dist - map(p - e.xyy).dist,
    map(p + e.yxy).dist - map(p - e.yxy).dist,
    map(p + e.yyx).dist - map(p - e.yyx).dist
  ));
}

Voxel rayMarch( vec3 rayOrigin, vec3 rayDirection)
{
  Voxel voxel = Voxel(uCamera.far, vec4(0.0));

  float rayMarchingStep = 0.0001;
  float dist = uCamera.near;

  for(int i = 0; i < 16; i++) {
    if (rayMarchingStep < 0.0001 || rayMarchingStep > uCamera.far) break;
    voxel = map( rayOrigin + rayDirection * dist );
    rayMarchingStep = voxel.dist;
    dist += rayMarchingStep;
    voxel.dist = dist;
  }

  vec3 normal = calcNormal(rayOrigin + rayDirection * dist);
  // voxel.color *= 1. + dot(normal, normalize(vec3(cos(uTime * 100.), cos(uTime * 100.), sin(uTime * 100.))));

  return voxel;
}

void main()
{
  float fovScaleY = tan((uCamera.fov / 180.0) * PI * .5);
  float aspect = uResolution.x / uResolution.y;

  vec2 position = ( gl_FragCoord.xy / uResolution.xy ) * 2. - 1.;

  vec3 vCameraForward = vec3( 0.0, 0.0, -1.0) * mat3( uCamera.modelViewMatrix );

  vec3 rayOrigin = -( uCamera.modelViewMatrix[3].xyz ) * mat3( uCamera.modelViewMatrix );
  vec3 rayDirection = normalize(vec3(position.x * fovScaleY * aspect, position.y * fovScaleY, -1.0) * mat3( uCamera.modelViewMatrix ));

  Voxel voxel = rayMarch(rayOrigin, rayDirection);

  gl_FragColor = vec4(voxel.color.rgb, 1.);
  // gl_FragColor = texture2D(uTexture, position);
}
