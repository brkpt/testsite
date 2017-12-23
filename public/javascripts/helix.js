goog.provide('Helix');
goog.require('FileLoader');
goog.require('Shape');

import {FileLoader} from './fileload.js';
import {Shape} from './shape.js';

var helixCallbacks = {
}

function Helix(glContext) {
  this.gl = glContext;
  this.fieldOfView = 45 * Math.PI / 180;   // in radians
  this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
  this.zNear = 0.1;
  this.zFar = 100.0;
  this.projectionMatrix = mat4.create();
  this.viewMatrix = mat4.create();
  this.lastFrameTime = 0;
  this.shapes = [];


  // If we don't have a GL context, give up now
  if (!this.gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  this.vspromise = new FileLoader(this).load('assets/datafiles/vsource.dat');
  this.fspromise = new FileLoader(this).load('assets/datafiles/fsource.dat');
  this.shadersPromise = Promise.all([this.vspromise, this.fspromise]);
}

Helix.prototype.render = function(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - this.lastFrameTime;
  this.lastFrameTime = now;

  this.drawScene(this.gl, this.programInfo, this.buffers, deltaTime);

  window.requestAnimationFrame(helixCallbacks.render.bind(helixCallbacks));
}

Helix.prototype.init = function() {
  // Save instance
  helixCallbacks.instance = this;

  // Configure render callback
  helixCallbacks.render = function(now) {
    this.instance.render(now);
  };
  

  this.shadersPromise.then((values) => {
    this.vsSource = values[0];
    this.fsSource = values[1];

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = this.initShaderProgram(this.gl, this.vsSource, this.fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };

    // Load our render objects
    this.loadObjects(this.gl);

    // Trigger draw
    window.requestAnimationFrame(helixCallbacks.render.bind(helixCallbacks));
  });  

}

// Load objects to render
Helix.prototype.loadObjects = function() {
    var shape = new Shape();
    shape.load(this.gl);
    this.shapes.push(shape);
}


//
// Draw the scene.
//
Helix.prototype.drawScene = function(gl, programInfo, buffers, deltaTime) {
  this.deltaTime = deltaTime;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(this.projectionMatrix,
                   this.fieldOfView,
                   this.aspect,
                   this.zNear,
                   this.zFar);

  this.shapes.forEach( function(shape){
    shape.render(gl, programInfo, this.projectionMatrix, this.deltaTime);    
  }.bind(this));
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
Helix.prototype.initShaderProgram = function(gl, vsSource, fsSource) {
  const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
Helix.prototype.loadShader = function(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export {Helix};

