
var gl; //webgl context
var canvas; //canvas used to display graphics
var shaderProgram; //shaders used to draw and manipulate vertices
var vertexPositionBuffer; //buffer of vertex locations

// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create(); //matrix used to encode all affine transformations
var rotAngle = 0; //angle to rotate the vertex array by
var lastTime = 0; //time stamp of previous frame
var renderStart = 0; //position in the vertex buffer to start drawing from
var renderCount = 66; //number of veracities to draw
var doTransform = true; //flag indicating whether or not to perform affine transformations on vertex array
var switchAngle = 180; //angle which indicates we should stop drawing one vertex array and start drawing the other

/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
 /*
  * Your code goes here	
  * Edit the L shaped mesh definition below.
  * Make it into an I.
  * Don't forget to update the buffer parameters below,
  * if you change the number of elements.
  */
  var triangleVertices = [
          -0.90,  0.95, 0.0, //illini logo
          0.88, 0.95, 0.0,
          0.88, 0.64, 0.0,
          0.88, 0.64, 0.0,
		  -0.9, 0.64, 0.0,
          -0.90,  0.95, 0.0,
		  
          0.71, 0.64, 0.0,
          0.71, -0.29, 0.0,
          0.32, -0.29, 0.0,
          0.32, -0.29, 0.0,
          0.32, 0.65, 0.0,
		  0.71, 0.64, 0.0,
		  
          0.32, -0.04, 0.0,
		  0.18, -0.04, 0.0,
          0.18, 0.38, 0.0,
          0.18, 0.38, 0.0,
		  0.32, 0.38, 0.0,
          0.32, -0.04, 0.0,
		  
          -0.34, 0.65, 0.0,
		  -0.34, -0.29, 0.0,
		  -0.72, -0.29, 0.0,
		  -0.72, -0.29, 0.0,
		  -0.72, 0.64, 0.0,
          -0.34, 0.65, 0.0,
		  
		  -0.34, 0.38, 0.0,
		  -0.2, 0.38, 0.0,
		  -0.2, -0.04, 0.0,
		  -0.2, -0.04, 0.0,
		  -0.34, -0.04, 0.0,
		  -0.34, 0.38, 0.0,
		  
		  -0.72, -0.37, 0.0,
		  -0.72, -0.49, 0.0,
		  -0.6, -0.56, 0.0,
		  -0.6, -0.56, 0.0,
		  -0.6, -0.37, 0.0,
		  -0.72, -0.37, 0.0,
		  
		  -0.46, -0.37, 0.0,
		  -0.46, -0.66, 0.0,
		  -0.34, -0.72, 0.0,
		  -0.34, -0.72, 0.0,
		  -0.34, -0.37, 0.0,
		  -0.46, -0.37, 0.0,
		  
		  -0.2, -0.37, 0.0,
		  -0.2, -0.82, 0.0,
		  -0.08, -0.88, 0.0,
		  -0.08, -0.88, 0.0,
		  -0.08, -0.37, 0.0,
		  -0.2, -0.37, 0.0,
		  
		  0.07, -0.37, 0.0,
		  0.07, -0.88, 0.0,
		  0.18, -0.82, 0.0,
		  0.18, -0.82, 0.0,
		  0.18, -0.37, 0.0,
		  0.07, -0.37, 0.0,
		  
		  0.32, -0.37, 0.0,
		  0.32, -0.72, 0.0,
		  0.44, -0.66, 0.0,
		  0.44, -0.66, 0.0,
		  0.44, -0.37, 0.0,
		  0.32, -0.37, 0.0,
		  
		  0.58, -0.37, 0.0,
		  0.58, -0.57, 0.0,
		  0.71, -0.49, 0.0,
		  0.71, -0.49, 0.0,
		  0.71, -0.37, 0.0,
		  0.58, -0.37, 0.0,
		  
		  0.0, 1.0, 0.0, //A
		  1.0, -1.0, 0.0,
		  0.7, -1.0, 0.0,
		  0.7, -1.0, 0.0,
		  0.0, 0.7, 0.0,
		  0.0, 1.0, 0.0,
		  
		  0.0, 1.0, 0.0,
		  -1.0, -1.0, 0.0,
		  -0.7, -1.0, 0.0,
		  -0.7, -1.0, 0.0,
		  0.0, 0.7, 0.0,
		  0.0, 1.0, 0.0,
		  
		  -0.3, -0.029,0.0,
		  0.3, -0.029, 0.0,
		  -0.4, -0.27, 0.0,
		  -0.4, -0.27, 0.0,
		  0.4, -0.27, 0.0,
		  0.3, -0.029, 0.0
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 78;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
 /*
  * Your code goes here	
  * Change and edit the colors here.
  * Make sure to match the edits you made to the positions above.
  * Don't forget to update the buffer parameters below,
  * if you change the number of elements.
  */
  var colors = [
		0.0745, 0.1569, 0.294, 1.0, //"illini blue" parts
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		0.0745, 0.1569, 0.294, 1.0,
		
		0.9137, 0.2902, 0.215686, 1.0, //"illini orange" parts
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		0.9137, 0.2902, 0.215686, 1.0,
		
		1.0, 0.0, 0.0, 1.0, //red parts
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 78;  
}

/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  var scaleVec = vec3.create(); //used to calculate scale
  var transVec = vec3.create(); //used to calculate translation
  //var rotQuat = quat.create();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  mat4.identity(mvMatrix);
  if(doTransform){ //only do animation if we are drawing the illini logo this frame, otherwise skip this
	  vec3.set(scaleVec, 0.1 + 0.5*Math.abs(Math.cos(1.0/4000 * lastTime)), 0.1 + 0.5*Math.abs(Math.cos(1.0/4000 * lastTime)), 0.1 + 0.5*Math.abs(Math.cos(1.0/4000 * lastTime)));
	  mat4.scale(mvMatrix, mvMatrix, scaleVec); //scale
	  
	  mat4.rotateZ(mvMatrix, mvMatrix, degToRad(8*rotAngle)); //rotate
	  //quat.rotateZ(rotQuat, rotQuat, degToRad(8*rotAngle));
	  
	  vec3.set(transVec, -1 + Math.sin(1.0/4000 * lastTime), 1 - Math.sin(1.0/4000 * lastTime), 0.0);
	  mat4.translate(mvMatrix, mvMatrix, transVec); //translate
	  
	  //mat4.fromRotationTranslationScale(mvMatrix, rotQuat, transVec, scaleVec);
  }
  
 /*
  * Your code goes here
  * Affine transformations can be implemented as modifications to the model view matrix 
  */
  if(rotAngle%switchAngle == 0){ //switch start position and size if we are drawing the 'A'
	renderStart = (renderStart == 0)? 66 : 0; //switch vertex array indices
	renderCount = (renderCount == 66)? 18 : 66; //switch vertex count
	switchAngle = (switchAngle == 180)? 30: 180; //switch the angle so that the 'A' is displayed for a shorter amount of time than the Illini logo
	doTransform = !doTransform; //only do transforms on the Illini logo, leave the 'A' in the center of the frame
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, renderStart, renderCount);
}

/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+1.0) % 360;
    }
    lastTime = timeNow;
}

/**
 * Startup function called from html code to start program.
 */
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}
