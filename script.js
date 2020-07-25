		

var WIDTH = 1280,
	HEIGHT = 720;
 
var FOV = 75,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 2000;
 
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;


var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const RADIUS = 0.03;
const SEGMENTS = 16;
const RINGS = 16;

//var geometry = new THREE.BoxGeometry(1, 1, 1);
var sphere_geometry = new THREE.SphereGeometry(RADIUS,
    SEGMENTS,
    RINGS);
    
var cylinder_geometry = new THREE.CylinderGeometry( RADIUS, RADIUS, 1, SEGMENTS );

var normal_material = new THREE.MeshNormalMaterial( );

/**
var sphere1 = new THREE.Mesh(geometry, normal_material);
scene.add( sphere1 );

var sphere2 = new THREE.Mesh(geometry, normal_material);
scene.add( sphere2 );

sphere2.position.x = 10;
**/

function addCylinder(){
  var cylinder = new THREE.Mesh( cylinder_geometry, normal_material );
  //scene.add( cylinder );
  return cylinder; 
}     

function addSphere(){ 
  var sphere = new THREE.Mesh(sphere_geometry, normal_material);
  //scene.add( sphere );
  return sphere; 
}


//hide everything in the scene
function hide() { 
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
}

/*******************************************************************************************
MPoly
********************************************************************************************/

function MPoly(O, A, B) { 
  
  if(typeof O != 'undefined'){ 
    this.create(O, A, B); 
    //this.snubPoly = this.snub(); 
  }  
} 

MPoly.prototype.create = function(O, A, B){

  this.Vertex = [];  
  this.MVertex = []; 
  this.Edge = [];
  
  O.normalize();   
  A.normalize();   
  B.normalize();   

  this.addVertex(O.v[0], O.v[1], O.v[2]); 
  this.addVertex(A.v[0], A.v[1], A.v[2]); 
  this.addVertex(B.v[0], B.v[1], B.v[2]); 

  this.addMVertex(0, 1, 2);
  
  //create q of indices of MVertices
  var q = []; 
  q.unshift(0); //add the index of the first MVertex
  
  var map = {0:'o', 1:'a', 2:'b'}; 
  
  while(q.length > 0){ 
    if(q.length > 100)
      break; 
  
    //console.log('q length = ' + q.length ) ; 
    var index = q.pop(); 
    //console.log('index = ' + index ) ; 
    //console.log('Vertex length = ' + this.Vertex.length ) ; 
     
    //loop through three possibilities:  
    for(i = 0; i < 3; i++){ 
      var R = map[i]; 
      var P = map[(i+1)%3]
      var Q = map[(i+2)%3]
      
      var verR = this.Vertex[ this.MVertex[index][R] ]; 
      var verP = this.Vertex[ this.MVertex[index][P] ]; 
      var verQ = this.Vertex[ this.MVertex[index][Q] ];
      
      var vR = new Vector(verR.x, verR.y, verR.z);  
      var vP = new Vector(verP.x, verP.y, verP.z);  
      var vQ = new Vector(verQ.x, verQ.y, verQ.z);  
      
      vR.reflect(vP, vQ); 
      
      //check if vR exists within this.Vertex:
      var vertex = null ;  
      for(var j = 0; j < this.Vertex.length; j++){ 
        var temp = new Vector(this.Vertex[j].x, this.Vertex[j].y, this.Vertex[j].z); 
        if(vR.equals(temp)){ 
          //console.log('found ...');  
          vertex = j; 
          break; 
        }
      }
      
      if(vertex == null)
      { 
        this.Vertex.push({x:vR.v[0], y:vR.v[1], z:vR.v[2]}); 
        vertex = this.Vertex.length - 1; 
        //vR.dump(); 
      }
      
      var newMVertex = {
        o : this.MVertex[index].o,  
        a : this.MVertex[index].a, 
        b : this.MVertex[index].b  
      }      
      
      newMVertex[R] = vertex; 
      
      var newMVertexIndex = null ;  
      for(var j = 0; j < this.MVertex.length; j++){ 
        if( this.MVertex[j].o == newMVertex.o 
            && this.MVertex[j].a == newMVertex.a 
            && this.MVertex[j].b == newMVertex.b 
          ){ 
            newMVertexIndex = j ; 
        }
      } 

      if( newMVertexIndex == null){ 
        this.MVertex.push(newMVertex); 
        newMVertexIndex = this.MVertex.length - 1 ; 
        
        q.unshift(newMVertexIndex); 
      }
      
      //check if there is an edge between index and newMvertexIndex
      
      var edge = null; 
      for(var j = 0; j < this.Edge.length; j++){ 
        if( (this.Edge[j].p == index && this.Edge[j].q == newMVertexIndex)
          || (this.Edge[j].p == newMVertexIndex && this.Edge[j].q == index) ) { 
          
          edge = j; 
          break ;   
        }
      }
      
      if(edge == null){ 
        this.Edge.push( {p: index, q:newMVertexIndex} ); 
      
      }
      
    }
 
  }
  
  /*
  console.log( 'MPoly...' ) ; 
  console.log( 'Vertices = ' + this.Vertex.length ) ; 
  console.log( 'Edges = ' + this.Edge.length ) ; 
  console.log( 'MVertices = ' + this.MVertex.length ) ; 
  */
  
  this.POINTS = []; 
  for(var i = 0; i < this.MVertex.length; i++){ 
    this.POINTS.push(addSphere()); 
  }

  this.LINES = []; 
  for(var i = 0; i < this.Edge.length; i++){ 
    this.LINES.push(addCylinder());  
  }
}


MPoly.prototype.signSearch = function(index, sign){ 
  //console.log('signSearch ' + index + " " + sign); 
    var wasZero = ( this.MVertex[index].sign == 0 );
    
    this.MVertex[index].sign = sign ; 
    
    if(wasZero){ 
      for(var i = 0; i < this.MVertex[index].neighbors.length; i++){ 
        this.signSearch( this.MVertex[index].neighbors[i], -sign ); 
      }
    }   
}  

/**
  create and return a new MPoly based on this one
  the new one is snubbed. 
**/
MPoly.prototype.snub = function() { 
  var snub = new MPoly(); 
  
  snub.Vertex = this.Vertex;  
  snub.MVertex = []; 
  snub.Edge = [];

//add MVertices
  //using edges, create neighbors list for each MVertex
  for(var i = 0; i < this.MVertex.length; i++){ 
    this.MVertex[i].neighbors = [];
    this.MVertex[i].sign = 0;  
  }  
  
  for(var i = 0; i < this.Edge.length; i++){ 
    var p = this.Edge[i].p ; 
    var q = this.Edge[i].q ; 
    
    this.MVertex[p].neighbors.push(q); 
    this.MVertex[q].neighbors.push(p); 
  }
  
  //add signs to the MVertices +1 or -1
  this.signSearch(0, 1); 
  
  //collect all +1 MVertices in an array, and assign 'newVertex' property
  var arr = [] ; 
  for(var i = 0; i < this.MVertex.length; i++){ 
    if(this.MVertex[i].sign == 1){ 
      arr.push(this.MVertex[i]); 
      this.MVertex[i].newVertex = arr.length-1; 
    }       
  }
  
  snub.MVertex = arr ; 

//add edges
  //create edges for each +1's neighbor's neighbor
  //(note we need to reference the newVertex property)

  //for each MVertex in snub
  for(var i = 0; i < snub.MVertex.length; i++){ 
    //set v1 to newVertex
    var v1 = i;   
    //find arr of neighbors
    var arr1 = snub.MVertex[i].neighbors; 
    
    //find arr of their neighbors
    for(var j = 0; j < arr1.length; j++){ 
      var arr2 = this.MVertex[arr1[j]].neighbors; 
      for(var k = 0; k < arr2.length; k++){ 
        var v2 = this.MVertex[arr2[k]].newVertex;
        if( v1 < v2 ){ 
          snub.addEdge(v1, v2); 
        }
      }  
    }
    //lookup newVertex of them - v2. 
    //if v1 < v2, then add edge
  } 
//add POINTS and LINES...

  snub.POINTS = []; 
  for(var i = 0; i < snub.MVertex.length; i++){ 
    snub.POINTS.push(addSphere()); 
  }

  snub.LINES = []; 
  for(var i = 0; i < snub.Edge.length; i++){ 
    snub.LINES.push(addCylinder());  
  }
  
  /*
  console.log( 'MPoly...' ) ; 
  console.log( 'Vertices = ' + snub.Vertex.length ) ; 
  console.log( 'Edges = ' + snub.Edge.length ) ; 
  console.log( 'MVertices = ' + snub.MVertex.length ) ; 
  console.log( 'POINTS = ' + snub.POINTS.length ) ; 
  console.log( 'LINES = ' + snub.LINES.length ) ; 
  */
  
  return snub ; 
}

MPoly.prototype.addVertex = function(x, y, z){ 
  this.Vertex.push({x:x, y:y, z:z}); 
}

MPoly.prototype.addMVertex = function(o, a, b){ 
  this.MVertex.push({o:o, a:a, b:b}); 
}

MPoly.prototype.addEdge = function(p, q){ 
  this.Edge.push({p:p, q:q}); 
}


//add the MPoly to the scene
MPoly.prototype.show = function(){ 
//console.log('show...'); 

  for(var i = 0; i < this.POINTS.length; i++){ 
    //console.log('point'); 
    scene.add( this.POINTS[i] ) 
  }  

  for(var i = 0; i < this.LINES.length; i++){ 
    //console.log('line'); 
    scene.add( this.LINES[i] ) 
  }  

}

//position the MPoly's POINTS and LINES in the scene
//called after A and B are updated
MPoly.prototype.position = function(){ 
  this.positionPoints(); 
  this.positionLines(); 
}

MPoly.prototype.positionPoints = function(){ 
  for(var i = 0; i < this.MVertex.length; i++){ 
    var P = this.POINTS[i]; 
    var MV = this.MVertex[i]; 
  
    var A = UI.A ; 
    var B = UI.B ; 
    
    if(A + B > 1){ 
      var diff = ( A + B - 1 ) / 2 ; 
      A -= diff ; 
      B -= diff ; 
    }
   
    P.position.x = this.Vertex[MV.o].x + ( this.Vertex[MV.a].x - this.Vertex[MV.o].x ) * A + ( this.Vertex[MV.b].x - this.Vertex[MV.o].x ) * B ;  
    P.position.y = this.Vertex[MV.o].y + ( this.Vertex[MV.a].y - this.Vertex[MV.o].y ) * A + ( this.Vertex[MV.b].y - this.Vertex[MV.o].y ) * B ;  
    P.position.z = this.Vertex[MV.o].z + ( this.Vertex[MV.a].z - this.Vertex[MV.o].z ) * A + ( this.Vertex[MV.b].z - this.Vertex[MV.o].z ) * B ;  

/**  
    console.log(P.position.x); 
    console.log(P.position.y); 
    console.log(P.position.z); 
**/  
  }

}

MPoly.prototype.positionLines = function(){ 
  for(var i = 0; i < this.Edge.length; i++){
    var E = this.Edge[i]; 
    this.lineBetween(i, E.p, E.q); 
  }
}

MPoly.prototype.lineBetween = function(i, p, q){ 

  //position
  this.LINES[i].position.x = this.POINTS[p].position.x + (this.POINTS[q].position.x - this.POINTS[p].position.x) / 2 ; 
  this.LINES[i].position.y = this.POINTS[p].position.y + (this.POINTS[q].position.y - this.POINTS[p].position.y) / 2 ; 
  this.LINES[i].position.z = this.POINTS[p].position.z + (this.POINTS[q].position.z - this.POINTS[p].position.z) / 2 ; 

  var x = this.POINTS[q].position.x - this.POINTS[p].position.x ; 
  var y = this.POINTS[q].position.y - this.POINTS[p].position.y ; 
  var z = this.POINTS[q].position.z - this.POINTS[p].position.z ; 
  
  //console.log('z = ' + z ); //when z is positive it fails
  //console.log('x = ' + x ); 
  
  var s = Math.sqrt(x * x + y * y + z * z); 
  
  this.LINES[i].scale.x = 1 ; 
  this.LINES[i].scale.y = s ; 
  this.LINES[i].scale.z = 1 ; 

  var k = Math.sqrt(x * x + z * z); 
  if(x < 0)
    k = -k; 
  
  this.LINES[i].rotation.z = ( Math.PI / 2 ) + Math.atan(y/k);  

  var atan = Math.atan(z/x); 
  atan = isNaN(atan) ? 0 : atan ; 
  
  this.LINES[i].rotation.y = - atan;  

}

/****************************************************************************************
Vector and Matrix
*****************************************************************************************/

function Matrix(){ 
  this.m = [[0, 0, 0], 
            [0, 0, 0], 
            [0, 0, 0] 
            ];    
}
Matrix.prototype.dump = function(){ 
  console.log(''); 
  for(var i = 0; i < this.m.length; i++){ 
    var row = this.m[i]; 
    console.log(row.join(',')); 
  }
}

Matrix.prototype.setReflectZ = function(){ 
  this.m = [[1, 0, 0], 
            [0, 1, 0], 
            [0, 0, -1] 
            ];    
}

Matrix.prototype.setReflectX = function(){ 
  this.m = [[-1, 0, 0], 
            [0, 1, 0], 
            [0, 0, 1] 
            ];    
}

Matrix.prototype.setReflectY = function(){ 
  this.m = [[1, 0, 0], 
            [0, -1, 0], 
            [0, 0, 1] 
            ];    
}

//rotate about X, angle t, counter-clockwise
Matrix.prototype.setRotateX = function(t){ 
  this.m = [[1,  0,           0          ], 
            [0,  Math.cos(t), Math.sin(t)], 
            [0, -Math.sin(t), Math.cos(t)] 
            ];    
}

Matrix.prototype.setRotateZ = function(t){ 
  this.m = [[ Math.cos(t), Math.sin(t), 0], 
            [-Math.sin(t), Math.cos(t), 0], 
            [0,            0,           1] 
            ];    
}

Matrix.prototype.setRotateY = function(t){ 
  this.m = [[ Math.cos(t), 0, -Math.sin(t)], 
            [ 0,           1,  0          ], 
            [ Math.sin(t), 0,  Math.cos(t)] 
            ];    
}


function Vector(x, y, z){ 
  this.v = [x, 
            y, 
            z]; 
}
Vector.prototype.dump = function(){ 
  console.log(''); 
  console.log(this.v.join(',')); 
}

Vector.prototype.add = function(v2){ 
  this.v[0] = this.v[0] + v2.v[0]; 
  this.v[1] = this.v[1] + v2.v[1]; 
  this.v[2] = this.v[2] + v2.v[2]; 
}

Vector.prototype.times = function(f){ 
  this.v[0] = this.v[0] * f; 
  this.v[1] = this.v[1] * f; 
  this.v[2] = this.v[2] * f; 
}

Vector.prototype.apply = function(m1){ 
  
  var result = []; 
  
  for(var i = 0; i < 3; i++){ 
    var sum = 0; 
    for(var j = 0; j < 3; j++){ 
      sum += m1.m[i][j] * this.v[j]; 
    }
    result.push(sum); 
  }
  
  this.v = result ; 
}

Vector.prototype.clone = function(){ 
  var result = new Vector(); 
  for(var i = 0; i < 3; i++){ 
    result.v[i] = this.v[i]; 
  } 
  return result ; 
}

/**
 reflect vector v in the plane made from the vectors
 P, Q, and the origin.
**/
Vector.prototype.reflect = function(P, Q){ 
//console.log('reflect...');
//this.dump();  
  P = P.clone(); 
  Q = Q.clone(); 
  
  //given vector P, what are the matrices we have to apply 
  //so that P moves to the Z axis. 
  //1. rotateY Math.atan(P.x / P.z)
  //then 2. rotateX Math.atan(P.y / P.z)
  //...then 3. rotateZ Math.atan(Q.y / Q.x)
  //...then reflectY
  //then reverse the above matrices ( in reverse order )
  
  var t1 = Math.atan(P.v[0] / P.v[2]); 
  if(isNaN(t1))
    t1 = 0; 
    
  //console.log('t1 = ' + t1 ) ;   
  
  var m = new Matrix(); 
  m.setRotateY(t1); 
  
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 

  //console.log('P = ');   
  //this.dump(); 
  //P.dump(); 
  //Q.dump(); 
  
  var t2 = - Math.atan(P.v[1] / P.v[2]); 
  if(isNaN(t2))
    t2 = 0; 

  //console.log(t2); 

  m.setRotateX(t2); 
  
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
  
  var t3 = Math.atan(Q.v[1] / Q.v[0]); 
  if(isNaN(t3))
    t3 = 0; 

  m.setRotateZ(t3); 
  
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
  
  m.setReflectY(); 
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
  
  m.setRotateZ(-t3); 
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
  
  m.setRotateX(-t2); 
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
  
  m.setRotateY(-t1); 
  this.apply(m); 
  P.apply(m); 
  Q.apply(m); 
//this.dump(); 
//console.log('reflect done.')

}

Vector.prototype.normalize = function(){ 

  var len = Math.sqrt( this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2] );
  
  this.v[0] /= len ; 
  this.v[1] /= len ; 
  this.v[2] /= len ; 

}

Vector.prototype.equals = function(v2){ 
  var x = this.v[0] - v2.v[0]; 
  var y = this.v[1] - v2.v[1]; 
  var z = this.v[2] - v2.v[2];
  
  var distance = Math.sqrt( x * x + y * y + z * z );
  
  var small = 0.0001; 
  
  return distance < small ; 
}




/**
  note: passing in the second paramater makes sure that the trackball works with
  the gui dat controls!
**/
controls = new THREE.TrackballControls( camera, renderer.domElement );
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 12.8;
controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;
controls.keys = [ 65, 83, 68 ];
controls.addEventListener( 'change', render );


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//make GUI

var UI_Object = function() {
  this.symmetry = 'tetrahedral';
  this.A = 1;
  this.B = 1;
  this.snub = false;
  // Define render logic ...
};

window.onload = function() {
  
  var gui = new dat.GUI();
  gui.add(UI, 'symmetry', [ 'tetrahedral', 'octahedral', 'icosahedral' ]);
  gui.add(UI, 'A', 0, 1);
  gui.add(UI, 'B', 0, 1);
  gui.add(UI, 'snub');

  
  onWindowResize(); 
};

UI = new UI_Object();

oldUI = {}; 
oldUI.symmetry = ''; 
oldUI.A = 0; 
oldUI.B = 0; 
oldUI.snub = false; 

function render() {
  //var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
  renderer.render( scene, camera );
}

/**
construct MPoly's
**/

//octahedral: 

var O = new Vector(0, 1, 1); 
var A = new Vector(0, 1, 0); 
var B = new Vector(1, 1, 1); 

var mpoly0 = new MPoly(O, A, B); 
var mpoly0_snubPoly = mpoly0.snub(); 

//tetrahedral: 

O = A ; 
A = new Vector(-1, 1, 1); 

var mpoly1 = new MPoly(O, A, B); 
var mpoly1_snubPoly = mpoly1.snub(); 

//dodecahedral: 
//see https://math.wikia.org/wiki/Dodecahedron for details
//of positions of dodecahedron vertices.

var phi = 0.5 + Math.sqrt( 5 / 4 ); 

var P1 = new Vector(1/phi, phi, 0); 
var P2 = new Vector(-1/phi, phi, 0); 
var P3 = new Vector(-1, 1, 1); 
var P4 = new Vector(0, 1/phi, phi); 
var P5 = new Vector(1, 1, 1); 

var B = P1.clone(); 
var O = P1.clone(); 
O.add(P2); 
O.times(0.5); 

var A = P1.clone(); 
A.add(P2); 
A.add(P3); 
A.add(P4); 
A.add(P5); 

A.times(0.2); 

var mpoly2 = new MPoly(O, A, B); 
var mpoly2_snubPoly = mpoly2.snub(); 


var animate = function() {
    //console.log(new Date()); 
	requestAnimationFrame(animate);

	controls.update();
	if(oldUI.symmetry != UI.symmetry || oldUI.snub != UI.snub){ 
	  oldUI.symmetry = UI.symmetry; 
	  oldUI.snub = UI.snub; 
	  
	  //console.log(UI.snub); 
	  //console.log(UI.symmetry); 
	  if(UI.snub){ 
        if(UI.symmetry == 'octahedral'){ 
	      hide(); 
	      mpoly0_snubPoly.show();  
	    }
	    else if(UI.symmetry == 'tetrahedral') { 
	      hide(); 
	      mpoly1_snubPoly.show();  
	    }
	    else { 
	      hide(); 
	      mpoly2_snubPoly.show();  
	    }
	  }
	  else
	  { 
        if(UI.symmetry == 'octahedral'){ 
	      hide(); 
	      mpoly0.show();  
	    }
	    else if(UI.symmetry == 'tetrahedral') { 
	      hide(); 
	      mpoly1.show();  
	    }
	    else { 
	      hide(); 
	      mpoly2.show();  
	    }
	  }
	}
	
	mpoly0.position(); 
    mpoly1.position(); 
    mpoly2.position(); 
    mpoly0_snubPoly.position(); 
    mpoly1_snubPoly.position(); 
    mpoly2_snubPoly.position(); 
    
	render();
};

animate();



		
