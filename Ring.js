"use strict";

class Ring
{
    constructor(innerRad, outerRad, ringArray, Plan, gl, shaderProgram)
    {
        this.innerRadius = innerRad;
        this.outerRadius = outerRad;
        this.gl = gl;
        this.rings = ringArray;
        this.planet = Plan;
        
        this.vao = gl.createVertexArray();  
        gl.bindVertexArray(this.vao);
        
        var numSegments = 360; // Number of segments in the ring
        var angleIncrement = (2 * Math.PI) / numSegments; // Angle increment between each segment
        this.verts = [];
        var colors = [];
        for (let i = 0; i < numSegments; i++) 
        {
          var angle = i * angleIncrement;
          var x = Math.cos(angle);
          var y = 0; // Set y-coordinate to 0 for a flat ring
          var z = Math.sin(angle);

          // Add vertex position and color information to the array
          this.verts.push(x, y, z); // Example using white color
          colors.push(1,1,1);
        }
        
        var floatBytes = 4;
        
        this.vertVB = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertVB);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
        console.log("vPosition:" + this.vPosition);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vPosition);

        this.colorVB = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVB );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
        this.vColor = gl.getAttribLocation(shaderProgram, "vColor");
        gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vColor);
        
        // Unbind the VAO
        gl.bindVertexArray(null);

    };
    attachRings(planet)
    {
        this.rings.push(planet);
    };
    Render(projectionMat, modelMat, viewMat)
    {
        var gl = this.gl;
        gl.bindVertexArray(this.vao);
        
        var modelMat = mat4();

        var modelView = mult(viewMat, modelMat);
            
        // Render the ring
        for(var j = 0; j < this.verts.length; j++)
        { 
            gl.drawArrays(gl.LINE_LOOP, 0, this.verts.length / 6);
        } 
        // Unbind the VAO
        gl.bindVertexArray(null);
    };
};

