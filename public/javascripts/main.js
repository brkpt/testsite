import {Helix} from './helix.js';

goog.require('goog.dom')
goog.require('Helix');


//
// Start here
//
function main() {
  helix.init();
}

const canvas = document.querySelector('#glcanvas');
const glContext = canvas.getContext('webgl');
var helix = new Helix(glContext);

$.ajax({
  url: "assets/datafiles/data.txt"
}).done(function(data) {
  console.log('data: ' + data.slice(0,5));
});

$(document).ready(main);
