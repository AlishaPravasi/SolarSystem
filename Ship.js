"use strict";

var numVerticies = 3;
var faceVerticies = 3;
var eyeX = 0;
var eyeZ = 10;
var eyeY = 0;
var atX = 0;
var atY = 0;
var atZ = 0;
class Ship
{
    constructor(cWidth, cHeight, rotatingVar, gl, shaderProgram) 
    {
        this.canvasWidth = cWidth;
        this.canvasHeight = cHeight;
        this.gl = gl;
        this.vao = gl.createVertexArray();  
        this.rot = rotatingVar;
        
        gl.bindVertexArray(this.vao);
        
        //buffers:
        var floatBytes = 4;  

        var coordArray = Float32Array.of
        (
            //keep ys the same
           -0.5, 0.0, +0.7,
            +0.5, 0.0, +0.7,
            0.0, 0.0, -0.7, 
        );
        
        var colorArray = Float32Array.of
        (
             0.5, 1.0, 1.0,
            0.5, 1.0, 1.0,
            1.0, 1.0, 1.0, 
        );
        
        this.colorVB = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVB );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );
        this.vColor = gl.getAttribLocation(shaderProgram, "sColor");
        gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vColor);

        // Create and load the vertex normals
        this.postionVB = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, this.postionVB );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(coordArray), gl.STATIC_DRAW );
        this.vPosition = gl.getAttribLocation(shaderProgram, "sPosition");
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vPosition);
        
        this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
        this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
        this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");

        gl.bindVertexArray(null);
    };
    moveForward(delta)
    {
        var forward = vec4(0, 0, delta, 1);

        // Apply the rotation to it to find the current z axis
        forward = mult(rotateY(this.rot), forward);

        // Since we can only rotate horizontally, it can only change the x and z posititon
        eyeX = eyeX + forward[0];
        eyeZ = eyeZ + forward[2];
        
    };
    moveSideways(delta)
    {

        var sideways = vec4(0, 0, delta, 1);

        // Apply the rotation to it to find the current z axis
        sideways = mult(rotateY(this.rot), sideways);

        
        eyeX = eyeX + sideways[2];
        eyeZ = eyeZ + sideways[0];
        atX = atX + sideways[2];
        atZ = atZ + sideways[0];
        
    };
    moveUp(delta)
    {   
        var up = vec4(0, 0, delta, 1);

        // Apply the rotation to it to find the current z axis
        up = mult(rotateY(this.rot), up);
      
        eyeY = eyeY + up[2];
        eyeZ = eyeZ + up[0];
        atY = atY + up[2];
        atZ = atZ + up[0];
    };
    rotate(delta)
    {
        //var rotating = vec4(0, 0, delta, 1);
        //rotating = mult(rotateZ(this.rot), rotating);
       this.rot += delta; // Update the rotation angle

        // Update the eye position based on the new rotation
        var eye = vec4(eyeX, eyeY, eyeZ, 1);
        eye = mult(rotateY(delta), eye);
        eyeX = eye[0];
        eyeY = eye[1];
        eyeZ = eye[2];

        // Update the at position based on the new rotation
        var at = vec4(atX, atY, atZ, 1);
        at = mult(rotateY(delta), at);
        atX = at[0];
        atY = at[1];
        atZ = at[2];
 
    };
    returnViewMatrix()
    {
        //do the lookAt based on position here
        var up = vec3(0, 1, 0);
        var eye = vec3(eyeX, eyeY, eyeZ); 
        var at = vec3(atX, atY, atZ);
        var viewMat = lookAt(eye, at, up);
        //viewMat = mult(viewMat, rotateY(this.rot));
        return viewMat;
    };
    Render = function(projectionMat, viewMat, modelMat)
    {
        
      //Make a triangle that represents a ship and moves around the solar system.       
      var gl = this.gl;
      gl.bindVertexArray(this.vao);

      this.translateMat = translate(eyeX, eyeY, eyeZ);
      
      modelMat = mult(modelMat, this.translateMat);
      
      var modelViewMatrix = mult(viewMat, modelMat);
      modelViewMatrix = mult(projectionMat, modelViewMatrix);
      
      gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewMatrix));
      
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindVertexArray(null);
   
    };

};

