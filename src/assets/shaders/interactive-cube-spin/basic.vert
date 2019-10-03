#version 300 es

uniform float u_aspectRatio;

layout (location = 0) in vec3 pos;
layout (location = 1) in vec3 color;

uniform mat4 u_model;

out vec3 vert_color;

void main()
{
    vec4 position = vec4(pos, 1.0);
    position = u_model * position;
    
    vert_color = color;    
    gl_Position = vec4(position.x / u_aspectRatio, position.y, position.z, 1.0);
}