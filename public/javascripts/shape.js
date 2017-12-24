goog.provide('Shape');
goog.require('FileLoader');

import {FileLoader} from './fileload.js';

// ****************************************************************************
// Represents a renderable object
// ****************************************************************************
function Shape() {
    this.modelViewMatrix = mat4.create();
    this.squareRotation = 0.0;
}

// ****************************************************************************
// Loads shader files from remote server and creates the shader program 
// from them.
// ****************************************************************************
Shape.prototype.load = function(gl, completedFunc) {
    this.vspromise = new FileLoader(this).load('assets/datafiles/vsource.dat');
    this.fspromise = new FileLoader(this).load('assets/datafiles/fsource.dat');
    this.shadersPromise = Promise.all([this.vspromise, this.fspromise]);
    this.shadersPromise.then((values) => {
        this.vsSource = values[0];
        this.fsSource = values[1];

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = this.createProgram(gl, this.vsSource, this.fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVevrtexColor and also
        // look up uniform locations.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            }
        };

        // Create a buffer for the square's positions.
        this.positionBuffer = gl.createBuffer();
    
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    
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
    
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        completedFunc(this);
    });
}

// ****************************************************************************
// ****************************************************************************
Shape.prototype.render = function(gl, projectionMatrix, deltaTime) {
    // Reset modelViewMatrix
    mat4.identity(this.modelViewMatrix);

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(this.modelViewMatrix,    // destination matrix
        this.modelViewMatrix,               // matrix to translate
        [-0.0, 0.0, -6.0]                   // amount to translate
    );
    mat4.rotate(this.modelViewMatrix,       // destination matrix
        this.modelViewMatrix,               // matrix to rotate
        this.squareRotation,                // amount to rotate in radians
        [0, 0, 1]                           // axis to rotate around
    );

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(this.programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        this.modelViewMatrix
    );

    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);

    // Update the rotation for the next draw
    this.squareRotation += deltaTime;
}

// ****************************************************************************
// Initialize a shader program, so WebGL knows how to draw our data
// ****************************************************************************
Shape.prototype.createProgram = function(gl, vsSource, fsSource) {
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
  
  // ****************************************************************************
  // creates a shader of the given type, uploads the source and
  // compiles it.
  // ****************************************************************************
  Shape.prototype.loadShader = function(gl, type, source) {
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
  
export {Shape};


