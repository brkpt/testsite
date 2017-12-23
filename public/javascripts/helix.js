import {FileLoader} from './fileload.js';

goog.provide('Helix');
goog.require('FileLoader');

var helixCallbacks = {
}

function Helix(glContext) {
  this.gl = glContext;
  this.squareRotation = 0.0;

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
  const deltaTime = now - this.then;
  this.then = now;

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

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    this.buffers = this.initBuffers(this.gl);

    this.then = 0;

    // Trigger draw
    window.requestAnimationFrame(helixCallbacks.render.bind(helixCallbacks));
  });  

}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
Helix.prototype.initBuffers = function(gl) {

  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the vertices
  const colors = [
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  0.0,  0.0,  1.0,    // red
    0.0,  1.0,  0.0,  1.0,    // green
    0.0,  0.0,  1.0,  1.0,    // blue
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

//
// Draw the scene.
//
Helix.prototype.drawScene = function(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix,      // destination matrix
              modelViewMatrix,      // matrix to rotate
              this.squareRotation,  // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    this.gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    this.gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
        this.gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    this.gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    this.gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
        this.gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing
  this.gl.useProgram(programInfo.program);

  // Set the shader uniforms
  this.gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
      this.gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    this.gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  // Update the rotation for the next draw
  this.squareRotation += deltaTime;
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

