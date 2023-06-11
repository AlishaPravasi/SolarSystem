"use strict";

class Planet
{
    constructor(sc, day, year, orbitDist, axisT, orbitT, pS, numSec1, numSec2, tex, gl, shaderProgram) 
    {
        this.gl = gl;
        this.scale = sc; 
        this.dayPeriod = day;
        this.yearPeriod = year;
        this.orbitDistance = orbitDist;
        this.axisTilt = axisT;
        this.orbitTilt = orbitT; 
        this.planets = pS;
        this.defaultDay = 0;
        this.defaultYear = 0;
        this.texture = tex;
        this.numSections = numSec1;
        this.numSections2 = numSec2;
        
        this.initTexture(this.texture);
        
        this.vao = gl.createVertexArray();  
        gl.bindVertexArray(this.vao);

        //buffers:
        var floatBytes = 4;  

        var radius = 1.0 * this.scale;
        var verts = [];
        var normals = [];
        var texCoords = [];

        for (var j = 0; j <= this.numSections2; j++) 
        {
            var v = j / this.numSections2;
            var phi = v * Math.PI - Math.PI / 2.0;

            var topHeight = radius * Math.sin(phi);
            var topRadius = radius * Math.cos(phi);
            var botHeight = -radius * Math.sin(phi);
            var botRadius = radius * Math.cos(phi);

            for (var i = 0; i <= this.numSections; i++) {
                var u = i / this.numSections;
                var theta = u * 2 * Math.PI;

                var cosTheta = Math.cos(theta);
                var sinTheta = Math.sin(theta);

                var x = topRadius * cosTheta;
                var y = topHeight;
                var z = topRadius * sinTheta;

                verts.push(vec3(x, y, z));
                normals.push(normalize(vec3(x, y, z)));

                x = botRadius * cosTheta;
                y = botHeight;
                z = botRadius * sinTheta;

                verts.push(vec3(x, y, z));
                normals.push(normalize(vec3(x, y, z)));
                texCoords.push(vec2(u,v));
            }
        }

        // Create and load the vertex positions
        this.cylVertVB = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cylVertVB);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
        console.log("vPosition:" + this.vPosition);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vPosition);


        // Create and load the vertex normals
        this.cylNormalVB = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cylNormalVB);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
        console.log("vNormal:" + this.vNormal);
        gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 3 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vNormal);
        
        // Create and load the vertex texture coords
        this.textureVB = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVB);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
        this.vTexCoord = gl.getAttribLocation(shaderProgram, "vTexCoord");
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 2 * floatBytes, 0);
        gl.enableVertexAttribArray(this.vTexCoord);
        
        this.fTexSampler = gl.getUniformLocation(shaderProgram, "fTexSampler");
        this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
        this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
        this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");
        this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
        this.lightColor = gl.getUniformLocation(shaderProgram, "lightColor");
        this.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
        this.materialColor = gl.getUniformLocation(shaderProgram, "materialColor");
        
        gl.bindVertexArray(null);
    };
    
    update()
    {
        //thise are now instance varibales anymore, cause multiple planets
        //update just update thses variables, 
        //eveyrthing below that is building the model matrix do in the renderr matrix
        this.defaultDay+=(this.dayPeriod/500);
        this.defaultYear+=(this.yearPeriod/50);
        
        //update all the moons of the sun, also do this in render, then tell the moons to render themelves
        
       
        for(var j = 0; j < this.planets.length; j++)
        { 
            this.planets[j].update();             
        }
            
        
    };
    
    attachMoon(planet)//add another planet pararmeter here
    {
        this.planets.push(planet);
    };
      
    initTexture(textureURL) 
    {   
        var gl = this.gl;

        // First make a white texture for when we don't want to have a texture
        //   This prevents shader warnings even if we don't sample from it
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                      gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

        // Load the texture from url (with generated mipmaps)
        this.textureLoaded = false;

        var texture = this.texture = gl.createTexture();
        var textureImage = new Image();
        var t = this;

        // Set up function to run asynchronously after texture image loads
        textureImage.onload = function () 
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            
            gl.generateMipmap(gl.TEXTURE_2D);  // incase we need min mipmap

            t.textureLoaded = true;  // flag texture load complete
        };
    
        textureImage.src = textureURL;  // start load of texture image   
    };
    
    Render(projectionMat, viewMat, parentMat)
    {
        var gl = this.gl;  
        gl.bindVertexArray(this.vao); 
        
        
        var modelMat = mat4();
        //orbit tilt
        var tiltOrbit = rotateX(this.orbitTilt);
        modelMat = tiltOrbit;
        
        //orbit rotate
        var rotateOrbit = rotateY(this.defaultYear);
        modelMat = mult(modelMat, rotateOrbit);
        
         //translate
        var translateMat = translate(this.orbitDistance*.3, 0, 0);
        modelMat = mult(modelMat, translateMat);
        
        //axis tilt
        var tiltAxis = rotateZ(this.axisTilt);
        modelMat = mult(modelMat, tiltAxis);
        
        //self rotate 
        var rotateSelf = rotateY(this.defaultDay);
        modelMat = mult(modelMat, rotateSelf);
       
        
  
        modelMat = mult(parentMat, modelMat);
        
        
        var modelViewMat = mult(viewMat, modelMat);
        var modelViewProjectionMat = mult(projectionMat, modelViewMat);

        //gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewProjectionMat));
        gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
        gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
        gl.uniformMatrix4fv(this.modelMat, false, flatten(modelMat));
  
        var lColor = vec3(1.0, 1.0, 1.0);
        var ambientFactor = 0.3;  // 30% ambient on everything

        // Pass in the light info
        // No false for these as 2nd parameter
        gl.uniform3fv(this.lightPosition, flatten(vec3(0, 0, 0)));
        gl.uniform3fv(this.lightColor, flatten(lColor));
        gl.uniform1f(this.ambientFactor, ambientFactor);

        var mColor = vec3(0.2, 0.1, 0.5);
        var mShiny = 50.0;
        gl.uniform3fv(this.materialColor, flatten(mColor));
        gl.uniform1f(this.materialShiny, mShiny);

        gl.activeTexture(gl.TEXTURE0);  // which of the multiple texture units to use
        gl.uniform1i(this.fTexSampler, 0); // The texture unit to use
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
            
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, (this.numSections + 1) * (this.numSections2 + 1));

        for(var j = 0; j < this.planets.length; j++)
        { 
            this.planets[j].Render(projectionMat, viewMat, modelMat);             
        } 
            
        gl.bindVertexArray(null);  // un-bind our vao
    };
};
