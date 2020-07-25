

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