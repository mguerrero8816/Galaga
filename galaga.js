var BOARDHEIGHT = 21;
var BOARDWIDTH = 21; //must be odd
var TOPLIMIT = 3;
var RIGHTLIMIT = 3;
var LEFTLIMIT = 3;
var BOTTOMLIMIT = 7;
var EMPTY = 0;
var PLAYER = 1;
var BULLET = 2;
var ALIEN = 3;
var HIT = 4;
var changeDirectionTimer = LEFTLIMIT;
var alienDirection = -1;
var gameStatus;
var isRunning = true;
var speed = 500; // in milliseconds
var playerLocation;
var highestCell = 0;
var jsGameBoard = [];

function createBoards(){
  createHtmlBoard();
  createJsBoard();
}

function createHtmlBoard(){
  var numberOfCells = 0;
  for(var i = 0; i < BOARDHEIGHT; i++){
    var newRow = $("#htmlBoard").append("<tr></tr>");
    for(var y = 0; y < BOARDWIDTH; y++){
      $(newRow).append('<td id="' + numberOfCells + '"></td>');
      numberOfCells++;
      highestCell = numberOfCells;
    }
  }
}

function createJsBoard(){
  var numberOfCells = 0;
  for(var i = 0; i < BOARDHEIGHT; i++){
    for(var y = 0; y < BOARDWIDTH; y++){
      jsGameBoard[numberOfCells] = EMPTY;
      numberOfCells++;
    }
  }
}

function updateHTML(board){
  for(var i = 0; i < highestCell; i++){
    $("#"+i).removeClass();
    if(board[i] === PLAYER){
      $("#"+i).addClass("playerCell");
    }
    if(board[i] === ALIEN){
      $("#"+i).addClass("alienCell");
    }
    if(board[i] === BULLET){
      $("#"+i).addClass("bulletCell");
    }
    if(board[i] === HIT){
      $("#"+i).addClass("hitCell");
    }
  }
}

function placePlayer(){
  playerLocation = Math.floor(BOARDWIDTH/2+((BOARDHEIGHT-1)*BOARDWIDTH))
  jsGameBoard[playerLocation] = PLAYER;
  updateHTML(jsGameBoard);
}

function willLeaveRow(location, direction){
  var destination = location%BOARDWIDTH + direction
  return destination < 0 || destination > BOARDWIDTH-1;
}

function inTopRow(location){
  return location < BOARDWIDTH;
}

function movePlayer(direction){
  if(!willLeaveRow(playerLocation, direction) && isRunning){
    jsGameBoard[playerLocation] = EMPTY;
    playerLocation += direction;
    jsGameBoard[playerLocation] = PLAYER;
    updateHTML(jsGameBoard);
  }
}

function inTopLimit(location){
  return location < BOARDWIDTH*TOPLIMIT;
}

function inBottomLimit(location){
  return location > BOARDWIDTH*BOARDHEIGHT-BOARDWIDTH*BOTTOMLIMIT-1;
}

function inRightLimit(location){
  return location%BOARDWIDTH > BOARDWIDTH-RIGHTLIMIT-1;
}

function inLeftLimit(location){
  return location%BOARDWIDTH < LEFTLIMIT;
}

function placeAliens(){
  for(var i = 0; i<highestCell-BOARDWIDTH; i += 2){
    if(!inTopLimit(i) && !inBottomLimit(i) && !inRightLimit(i) && !inLeftLimit(i)){
      jsGameBoard[i] = ALIEN;
    }
  }
  updateHTML(jsGameBoard);
}

function giveAlienTrajectory(){
  var newBoard = [];
  for(var i = 0; i<highestCell; i++){
    if(jsGameBoard[i] === ALIEN){
      newBoard[i + alienDirection] = ALIEN;
    }
  }
  changeDirectionTimer -= 1;
  if(changeDirectionTimer === 0){
    changeDirectionTimer = LEFTLIMIT + RIGHTLIMIT
    if(alienDirection === -1){
      alienDirection = 1;
    }
    else {
      alienDirection = -1;
    }
  }
  return newBoard;
}

function fireBullet(){
  if(jsGameBoard[playerLocation-BOARDWIDTH] != BULLET && isRunning){
    jsGameBoard[playerLocation-BOARDWIDTH] = BULLET;
    updateHTML(jsGameBoard);
  }
}

function giveBulletTrajectory(){
  var newBoard = [];
  for(i = 0; i < highestCell; i++){
    if(jsGameBoard[i] === BULLET){
      if(!inTopRow(i)){
        newBoard[i-BOARDWIDTH] = BULLET;
      }
    }
  }
  return newBoard;
}

function moveThings(){
  var newBoard = [];
  var alienBoard = giveAlienTrajectory();
  var bulletBoard = giveBulletTrajectory();
  for(var i = 0; i < highestCell; i++){
    if(alienBoard[i] === ALIEN){
      if(bulletBoard[i] === BULLET){
        newBoard[i] = HIT;
      }
      else{
        newBoard[i] = ALIEN
      }
    }
    if(bulletBoard[i] === BULLET && alienBoard[i] != ALIEN){
      newBoard[i] = BULLET
    }
    if(jsGameBoard[i] === PLAYER){
      newBoard[i] = PLAYER;
    }
  }
  jsGameBoard = newBoard;
  updateHTML(jsGameBoard);
}

function clearHits(){
  for(i = 0; i < highestCell; i++){
    if(jsGameBoard[i] === HIT){
      jsGameBoard[i] = EMPTY;
    }
  }
  updateHTML(jsGameBoard);
}


function cycleBoard(){
  clearHits();
  moveThings();
}

function runGame(){
  pauseGame();
  isRunning = true;
  gameStatus = setInterval(function(){
    cycleBoard();
  }, speed)
}

function pauseGame(){
  isRunning = false;
  clearInterval(gameStatus);
}

$(document).ready(function(){
  createBoards();
  placePlayer();
  placeAliens();
  $("#leftButton").on("click", function(){
    movePlayer(-1);
  });
  $("#rightButton").on("click", function(){
    movePlayer(1);
  });
  $("#fireButton").on("click", fireBullet);
  $("#pauseButton").on("click", pauseGame);
  $("#startButton").on("click", runGame);

  // $(window).keypress(function(key){
  //   alert(key.keyCode);
  // })

  $(window).keypress(function(key){
    if(key.keyCode === 32){
      fireBullet();
    };
  })

  $(window).keypress(function(key){
    if(key.keyCode === 97 || key.keyCode === 65){
      movePlayer(-1);
    };
  })

  $(window).keypress(function(key){
    if(key.keyCode === 100 || key.keyCode === 68){
      movePlayer(1);
    };
  })


  runGame();
})
