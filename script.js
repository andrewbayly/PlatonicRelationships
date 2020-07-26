		

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



		
