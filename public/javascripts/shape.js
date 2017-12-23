goog.provide('Shape');

// ****************************************************************************
// Represents a renderable object
// ****************************************************************************
function Shape() {
    this.modelViewMatrix = mat4.create();
    this.squareRotation = 0.0;
}

// ****************************************************************************
// ****************************************************************************
Shape.prototype.load = function(gl) {
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
}

// ****************************************************************************
// ****************************************************************************
Shape.prototype.render = function(gl, programInfo, projectionMatrix, deltaTime) {
    // Reset modelViewMatrix
    mat4.identity(this.modelViewMatrix);

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(this.modelViewMatrix,     // destination matrix
                    this.modelViewMatrix,     // matrix to translate
                    [-0.0, 0.0, -6.0]);  // amount to translate
    mat4.rotate(this.modelViewMatrix,      // destination matrix
                this.modelViewMatrix,      // matrix to rotate
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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
            gl.enableVertexAttribArray(
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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
            gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        this.modelViewMatrix);

    {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    // Update the rotation for the next draw
    this.squareRotation += deltaTime;
}

export {Shape};


