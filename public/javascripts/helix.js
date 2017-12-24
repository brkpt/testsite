goog.provide('Helix');
goog.require('Shape');

import {Shape} from './shape.js';

// ****************************************************************************
// ****************************************************************************
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
}

// ****************************************************************************
// ****************************************************************************
Helix.prototype.init = function() {
  // Load our render objects
  this.loadObjects(this.gl);

  // Trigger draw
  this.rendering=true;
  window.requestAnimationFrame(this.render.bind(this));
}

// ****************************************************************************
// Load objects to render
// ****************************************************************************
Helix.prototype.loadObjects = function() {
    // Note: This is a delayed load of the objects.  As they get loaded, they
    // get added to the shape list and rendered.
    var shape = new Shape();
    shape.load(this.gl, function(s) { 
      this.shapes.push(s);
    }.bind(this));
}

// ****************************************************************************
// ****************************************************************************
Helix.prototype.render = function(now) {
  // Render
  now *= 0.001;  // convert to seconds
  const deltaTime = now - this.lastFrameTime;
  this.lastFrameTime = now;
  this.drawScene(deltaTime);

  // Retrigger render callback
  window.requestAnimationFrame(this.render.bind(this));
}

// ****************************************************************************
// Draw the scene.
// ****************************************************************************
Helix.prototype.drawScene = function(deltaTime) {
  this.deltaTime = deltaTime;
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);       // Clear to black, fully opaque
  this.gl.clearDepth(1.0);                      // Clear depth
  this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
  this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  // note: glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(this.projectionMatrix,
    this.fieldOfView,
    this.aspect,
    this.zNear,
    this.zFar
  );

  // Go through shapes and render each one
  this.shapes.forEach( function(shape){
    shape.render(this.gl, this.projectionMatrix, this.deltaTime);    
  }.bind(this));
}

export {Helix};

