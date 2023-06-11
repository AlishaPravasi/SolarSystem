#version 300 es
// Fragment shader for Assignment 2 - COMP3801 Spring 2021

precision highp float;     

uniform sampler2D fTexSampler;

in vec2 fTexCoord;
in vec3 fColor;
//in vec3 fShipColor;

out vec4 final_color1;

void main()
{
    final_color1 = texture(fTexSampler, fTexCoord); //* vec4(fShipColor,1);
    //combine fColor and texture together to make a texture and lighting work at the same time
}
