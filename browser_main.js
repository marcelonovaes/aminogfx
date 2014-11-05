var amino_core = require('./src/amino.js');
var canvas = require('./src/canvasamino.js');
console.log("fully loaded browsers main");


exports.start = amino_core.start;
exports.Group = amino_core.Group;
exports.Circle = amino_core.Circle;
exports.Rect = amino_core.Rect;
exports.Text = amino_core.Text;
exports.input = amino_core.input;
exports.makeProps = amino_core.makeProps;
exports.getCore = amino_core.getCore;
exports.setCanvas = amino_core.setCanvas;
exports.native = amino_core.native;

exports.ParseRGBString = amino_core.primitives.ParseRGBString;