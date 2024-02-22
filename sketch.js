// to do: 1. github 2. because i'm only using arry of 2d rather than matrix of 4d, idk if the calcs and rotation will work well
/// tried to rework it, but hit major roadblocks

let anchorPosition;
let circlePosition;
let restLength;
let velocity;
let springForceConst;
let gravityDirection;
let mass;
let angle; 
let size;
let vertices;

function setup() {
  createCanvas(600, 400)
  circlePosition = [350, 150]
  anchorPosition = [300, 100]
  velocity = [0, 0]
  springForceConst = 0.0001
  restLength = 150 //circlePosition[1] + 50
  gravityDirection = [0, 0.2]
  mass = [0.2, 0.2]
  size = 50
  vertices = calculateSquareVertices(circlePosition, size)
}

function draw() {
  background(112, 150, 126);
  drawLineToTopCenter(anchorPosition[0], anchorPosition[1], vertices);
  drawVertices(vertices)
  drawCircle(anchorPosition, 20, 20);
  physicsEngine(springForceConst, anchorPosition, circlePosition);
  
  // noLoop();
}


/////////////////////////
/////////////////////////
//      DRAW FUNC      //
/////////////////////////
/////////////////////////

function drawCircle(coordsColl, w, h) {
  let x = coordsColl[0];
  let y = coordsColl[1];
  fill(100, 0, 255);
  ellipse(x, y, w, h);
}

function drawSquare(coordsColl, size) {
  rectMode(CENTER);
  let x = coordsColl[0];
  let y = coordsColl[1];
  square(x, y, size);
}

function drawLineToTopCenter(anchorX, anchorY, vertices) {
  strokeWeight(4)
  let topCenterX = (vertices[0][0] + vertices[1][0]) / 2
  let topCenterY = vertices[0][1]
  line(anchorX, anchorY, topCenterX, topCenterY);
}

function drawVertices(vertices) {
  rectMode(CENTER);
  stroke(0);
  fill(175);
  beginShape();
  for (let v of vertices) {
    vertex(v[0], v[1]);
  }
  endShape(CLOSE);
}

function drawLine(anchorPosition, coordsColl) {
  strokeWeight(4);
  let x1 = anchorPosition[0];
  let y1 = anchorPosition[1];
  let x2 = coordsColl[0];
  let y2 = coordsColl[1];
  line(x1, y1, x2, y2);
}

/////////////////////////
/////////////////////////
//    PHYSICS FUNC     //
/////////////////////////
/////////////////////////

function physicsEngine(springForceConst, anchorPosition, coordColl) {
  let accelerationForce = springForce(springForceConst, anchorPosition,coordColl)
  let gravitationalforce = force(accelerationForce, mass, gravityDirection);
  updatePosition(gravitationalforce);
}

function force(acceleration, mass, gravityDirection) {
  return vectorAddition(vectorMulti(acceleration, mass), gravityDirection);
}

function springForce(springForceConst, anchorPosition, coordColl) {
  let displacement = vectorSubtraction(coordColl, anchorPosition);
  let length = distance(anchorPosition, coordColl) - restLength;
  let accelerationForce = vectorScalarMulti(-springForceConst * length,displacement);
  return accelerationForce;
}

// function updatePosition(force) {

//   velocity = vectorAddition(velocity, force);
//   circlePosition = vectorAddition(circlePosition, velocity);
//   velocity = vectorScalarMulti(0.99, velocity)
  
//   let relativePosition = vectorSubtraction(circlePosition, anchorPosition);
//   let angle = Math.atan2(relativePosition[1], relativePosition[0])
//   vertices = calculateSquareVertices(relativePosition, size);
//   vertices = rotateObject(vertices,angle)

// }

function updatePosition(force) {
  // Update velocity based on force
  velocity = vectorAddition(velocity, force);
  
  // Update position of the rectangle based on velocity
  circlePosition = vectorAddition(circlePosition, velocity);
  
  // Calculate the angle of rotation based on angle to anchor point
  let angle = Math.atan2(anchorPosition[1], anchorPosition[0]); // EXPLORE THIS: try diff positions

  // Update vertices of the rectangle based on the new position and rotation
  vertices = calculateSquareVertices(circlePosition, size);
  vertices = rotateObject(vertices, angle);
  velocity = vectorScalarMulti(0.99, velocity)
}




/////////////////////////
/////////////////////////
//  GEO ALGEBRA FUNC   //
/////////////////////////
/////////////////////////

function dotProduct(vec1, vec2) {
  return vectorReduceSum(vectorMulti(vec1, vec2));
}

function vectorReverse(vec) {
  return vec.slice().reverse()
}

function wedgeProduct2D(vec1, vec2) {
  let vec2Reversed = vectorReverse(vec2);
  return vectorReduceSubtract(vectorMulti(vec1, vec2Reversed))
}

function wedgeProductHigherDim(vec1, vec2) {
  let a = vec1;
  let b = vec2;
  let storage = [];
  a.push(vec1[0]);
  b.push(vec2[0]);

  for (let i = 0; i < vec1.length; i++) {
    storage.push(a[0] * b[1] - a[1] * b[0]);
  }

  storage.push(storage[0]);
  return storage.slice(1, storage.length);
}

function wedgeProduct(vec1, vec2) {
  // MAKE INTO TRY 
  let v1Length = vec1.length;
  let v2Length = vec2.length;
  
  if (v1Length < 2 || v2Length < 2) {
    return console.log("one vector is less than 2 dimensions");
  } else if (v1Length === 2 && v2Length === 2) {
    return wedgeProduct2D(vec1, vec2);
  } else if (v1Length > 2 && v2Length > 2) {
    return wedgeProductHigherDim(vec1, vec2);
  } else {
    console.log("error");
  }
}

function geometricProduct(vec1, vec2) {
  let dotP = dotProduct(vec1, vec2);
  let wedgeP = wedgeProduct(vec1, vec2);
  return vec1.length == 2 && vec2.length == 2 ? [dotP, wedgeP] : [dotP, ...wedgeP];
}


function rotateObject(verticesMatrix,angle) {
  // Define the rotation bivector using the angle
  const rotationBivector = [Math.cos(angle / 2), Math.sin(angle / 2)]
  let storage = []
  
  for (let v of vertices) {
    storage.push(geometricProduct(rotationBivector, v))
  }
  
  return storage
}

/////////////////////////
/////////////////////////
//     VECTOR FUNC     //
/////////////////////////
/////////////////////////

function calculateSquareVertices(coordsColl, size) {
  let x = coordsColl[0];
  let y = coordsColl[1];
  let vertices = [];
  let halfSize = size / 2;
  vertices.push([x - halfSize, y - halfSize]) // Top-left
  vertices.push([x + halfSize, y - halfSize]) // Top-right
  vertices.push([x + halfSize, y + halfSize]) // Bottom-right
  vertices.push([x - halfSize, y + halfSize]) // Bottom-left
  return vertices;
}

function vectorAddition(vec1, vec2) {
  return vec1.map((ele, index) => { return ele + vec2[index] })
}

function vectorSubtraction(vec1, vec2) {
  return vec1.map((ele, index) => { return ele - vec2[index] })
}

function vectorMulti(vec1, vec2) {
  return vec1.map((ele, index) => { return ele * vec2[index] })
}

function vectorScalarMulti(s, vec) {
  return vec.map((ele) => { return s * ele })
}

function vectorScalarDiv(s, vec) {
  return vec.map((ele) => { return ele / s })}

function vectorSquared(vec) {
  return vectorMulti(vec, vec);
}

function vectorReduceSum(vec) {
  return vec.reduce((acc, ele) => {return acc + ele});
}

function vectorReduceSubtract(vec) {
  return vec.reduce((acc, ele) => { return acc - ele });
}

function vectorLength(vec) {
  return Math.sqrt(vectorReduceSum(vectorSquared(vec)));
}

function distance(vec1, vec2) {
  return Math.sqrt(
    vectorReduceSum(vectorSquared(vectorSubtraction(vec1, vec2)))
  );
}