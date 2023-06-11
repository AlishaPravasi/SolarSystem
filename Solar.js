"use strict";

var viewingMode = 3;

function Solar(canvasID) 
{
  var t = this;  // save reference to this object for callbacks
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  if (!canvas) {
      alert("Canvas ID '" + canvasID + "' not found.");
      return;
  }
  
  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
      alert("WebGL isn't available in this browser");
      return;
  }
  
  // Make the entire canvas be the viewport and set a grey background
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1.0);
  
  // Enable hidden-surface removal (draw pixel closest to viewer)
  gl.enable(gl.DEPTH_TEST);


  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);

  var render = function () 
  {
    t.Render();
  };
  
  this.sun = new Planet(4, 0, 0, 0, 0, 14, [], 256, 128, "sun.bmp", this.gl, this.shaderProgram);
  this.mercury = new Planet(.5, 10, 100, 15, 0, 7, [], 256, 128, "mercury.bmp", this.gl, this.shaderProgram);
  this.venus = new Planet(1, 1, 50, 20, 2, 7, [], 256, 128, "venus.bmp", this.gl, this.shaderProgram);
  this.earth = new Planet(1, 200, 15, 30, 24, 7, [], 256, 128, "earth.bmp", this.gl, this.shaderProgram);
  this.earthMoon = new Planet(0.25, 100, 100, 6, 7, 80, [], 256, 128, "moon.bmp", this.gl, this.shaderProgram);
  this.mars = new Planet(1, 210, 50, 40, 25, 7, [], 256, 128, "mars.bmp", this.gl, this.shaderProgram);
  this.jupiter = new Planet(2, 500, 5, 55, 3, 7, [], 256, 128, "jupiter.bmp", this.gl, this.shaderProgram);
  this.jupiterEuropa = new Planet(0.25, 100, 100, 10, 0, 10, [], 256, 128, "moon.bmp", this.gl, this.shaderProgram);
  this.jupiterLo = new Planet(0.175, 100, 75, 10, 0, 40, [], 256, 128, "moon.bmp", this.gl, this.shaderProgram);
  this.jupiterGanymede = new Planet(0.375, 100, 125, 10, 0, 90, [], 256, 128, "moon.bmp", this.gl, this.shaderProgram);
  this.saturn = new Planet(2, 110, 6, 68, 27, 7, [], 256, 128, "saturn.bmp", this.gl, this.shaderProgram);
  this.uranus = new Planet(1.5, 250, 2, 80, 82, 7, [], 256, 128, "uranus.bmp", this.gl, this.shaderProgram);
  this.neptune = new Planet(1.5, 260, 1, 90, 28, 7, [], 256, 128, "neptune.bmp", this.gl, this.shaderProgram);

  this.mercuryRings = new Ring(.5, .5, [], this.mercury, this.gl, this.shaderProgram);
  this.venusRings = new Ring(1, .5, [], this.venus, this.gl, this.shaderProgram);
  this.earthRings = new Ring(1, .5, [], this.earth, this.gl, this.shaderProgram);
  this.earthMoonRings = new Ring(.25, .5, [], this.earthMoon, this.gl, this.shaderProgram);
  this.jupiterRings = new Ring(2, .5, [], this.mars, this.gl, this.shaderProgram);
  this.jupiterEuropaRings = new Ring(.25, .5, [], this.mars, this.gl, this.shaderProgram);
  this.jupiterLoRings = new Ring(.175, .5, [], this.mars, this.gl, this.shaderProgram);
  this.jupiterGanymedeRings = new Ring(.375, .5, [], this.mars, this.gl, this.shaderProgram);
  this.saturnRings = new Ring(2, .5, [], this.mars, this.gl, this.shaderProgram);
  this.uranusRings = new Ring(1.5, .5, [], this.mars, this.gl, this.shaderProgram);
  this.neptuneRings = new Ring(1.5, .5, [], this.mars, this.gl, this.shaderProgram);

  
  this.secondViewPort = new Ship(this.canvas.width, this.canvas.height, 1, this.gl, this.shaderProgram);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  t.assemble();
  
  var butn1 = document.getElementById("btn");
  var butn2 = document.getElementById("switchMap");
  var butn3 = document.getElementById("switchShip");
  var butn4 = document.getElementById("switchSplit");
  var isPlaying = false;
  butn1.addEventListener("click", function()
  {
        isPlaying = !isPlaying;
        if(isPlaying === true)
        {
            animate();
        }
  });
  butn2.addEventListener("click", function()
  {
        viewingMode = 1;
  });
  butn3.addEventListener("click", function()
  {
        viewingMode = 2;
  });
  butn4.addEventListener("click", function()
  {
        viewingMode = 3;
  });
  var animate = function()
  {
    if(isPlaying === false)
    {
        return;
    }
    render();
    
    requestAnimationFrame(animate);
  };
  //keypresses 
  document.addEventListener('keydown', function(event)
   {
    if(event.keyCode === 90)
    {
        t.secondViewPort.moveForward(1);
    }
    if(event.keyCode === 88)
    {
        t.secondViewPort.moveForward(-1);
    }
    if(event.keyCode === 65)
    {
        t.secondViewPort.moveSideways(-1);
    }
    if(event.keyCode === 68)
    {
        t.secondViewPort.moveSideways(1);
    }
    if(event.keyCode === 87)
    {
        t.secondViewPort.moveUp(1);
    }
    if(event.keyCode === 83)
    {
        t.secondViewPort.moveUp(-1);
    }
    if(event.keyCode === 81)
    {
        t.secondViewPort.rotate(5);
    }
    if(event.keyCode === 69)
    {
        t.secondViewPort.rotate(-5);
    }
  });
};

Solar.prototype.assemble = function()
{
    this.sun.attachMoon(this.mercury);
    this.sun.attachMoon(this.venus);
    this.sun.attachMoon(this.earth);
    this.earth.attachMoon(this.earthMoon);
    this.sun.attachMoon(this.mars);
    this.sun.attachMoon(this.jupiter);
    this.jupiter.attachMoon(this.jupiterEuropa);
    this.jupiter.attachMoon(this.jupiterLo);
    this.jupiter.attachMoon(this.jupiterGanymede);
    this.sun.attachMoon(this.saturn);
    this.sun.attachMoon(this.uranus);
    this.sun.attachMoon(this.neptune);
        
    this.mercuryRings.attachRings(this.mercury);
    this.venusRings.attachRings(this.venus);
    this.earthRings.attachRings(this.earth);
    this.earthMoonRings.attachRings(this.earthMoon);
    this.jupiterRings.attachRings(this.jupiter);
    this.jupiterEuropaRings.attachRings(this.jupiterEuropa);
    this.jupiterLoRings.attachRings(this.jupiterLo);
    this.jupiterGanymedeRings.attachRings(this.jupiterGanymede);
    this.saturnRings.attachRings(this.saturn);
    this.uranusRings.attachRings(this.uranus);
    this.neptuneRings.attachRings(this.neptune);
};

Solar.prototype.Render = function() 
{   
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var modelMat = mat4();
  var secondViewMat = lookAt(vec3(0,30,0), vec3(0,0,1), vec3(1,0,0));
  var secondProjMat = ortho(-50, 50, -50, 50, -200, 200);
  
  //map view
  if(viewingMode === 1)
  {
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    var aspectRatio = this.canvas.width / this.canvas.height;
    var projectionMat = perspective(100, aspectRatio, 0.1, 200);
    var viewMat = this.secondViewPort.returnViewMatrix();
    
    this.sun.update();
    this.sun.Render(projectionMat, viewMat, modelMat);
  }
  
  //ship view
  if(viewingMode === 2)
  {
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    var aspectRatio = this.canvas.width / this.canvas.height;
    this.sun.update();
    this.sun.Render(secondProjMat, secondViewMat, modelMat); 
  }
  
  //split view
  if(viewingMode === 3)
  {
    gl.viewport(0, 0, this.canvas.width/2 , this.canvas.height);
    var aspectRatio = this.canvas.width/2 / this.canvas.height;
    var projectionMat = perspective(100, aspectRatio, 0.1, 200);
  
    var viewMat = this.secondViewPort.returnViewMatrix();

    var modelMat = mat4();

    this.sun.update();
    this.sun.Render(projectionMat, viewMat, modelMat);
    gl.viewport(this.canvas.width/4, 0, this.canvas.width, this.canvas.height);
  
    var secondViewMat = lookAt(vec3(0,30,0), vec3(0,0,1), vec3(1,0,0));
    var secondProjMat = ortho(-50, 50, -50, 50, -200, 200);
      
    this.secondViewPort.Render(secondProjMat, secondViewMat, modelMat);   
   
    this.sun.update();
    this.sun.Render(secondProjMat, secondViewMat, modelMat); 
  }
};
