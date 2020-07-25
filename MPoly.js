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
