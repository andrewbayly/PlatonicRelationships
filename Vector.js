/****************************************************************************************
Vector 
*****************************************************************************************/

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



