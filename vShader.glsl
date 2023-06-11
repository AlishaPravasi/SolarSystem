#version 300 es

in vec3 vPosition;           // position of vertex (x, y, z) in world coords
in vec3 vNormal;
in vec2 vTexCoord;
in vec3 vColor;  
in vec3 sPosition;
in vec3 sColor;

uniform mat4 projectionMat;   // projection matrix
uniform mat4 viewMat;         // the view/camera location matrix
uniform mat4 modelMat;        // model matrix
//uniform mat4 transformMat;   // transform for vertex

// Light info
uniform vec3 lightPosition;   // light position in world coords
uniform vec3 lightColor;
uniform float ambientFactor;

// Material properties (K)
uniform vec3 materialColor;
uniform float shiny;

out vec3 fColor; 
//out vec3 fShipColor;
out vec2 fTexCoord;

void main() {

    vec4 posVC4 = viewMat * modelMat * vec4(vPosition.xyz, 1.0);
    vec4 normVC4 = viewMat * modelMat * vec4(vNormal.xyz, 0.0);
    vec4 lightVC4 = viewMat * vec4(lightPosition.xyz, 1.0); 
    gl_Position = projectionMat * posVC4;
    
    vec3 normVC3 = normalize(normVC4.xyz); 
    vec3 posVC3 = posVC4.xyz;
    vec3 lightVC3 = lightVC4.xyz;

    // Ambient calculation
    vec3 ambientComponent = ambientFactor * materialColor * lightColor;

    // Diffuse calculation
    vec3 lightDirection = normalize(lightVC3-posVC3);
    vec3 diffuseComponent = vec3(materialColor * lightColor * max(dot(lightDirection, normVC3), 0.0));;

    // Specular calculation
    vec3 viewDirection = normalize(-posVC3);
    vec3 halfwayVector = normalize(lightDirection + viewDirection);
    float specularIntensity = pow(max(dot(normVC3, halfwayVector), 0.0), shiny);
    vec3 specularComponent = specularIntensity * materialColor * lightColor;


    vec3 phong = vec3(0, 0, 0);
    phong += ambientComponent;
    phong += diffuseComponent;
    phong += specularComponent;
    fTexCoord = vTexCoord;
    //gl_Position = vec4(sPosition, 1.0); // set vertex position
    
    //fShipColor = sColor; 
    fColor = phong;
    //fShipColor = vColor;
}

