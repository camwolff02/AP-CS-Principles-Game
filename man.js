// to play game, or view/edit source code, visit project at 
// https://studio.code.org/projects/applab/y0Wgvlq40uND2eWCxS9l_1cM8E6eM3eCu31MEc9IOMY
// this document exists as a way to view the project in an easier way
var MoveSpeed = 6; //treat as constant
var Vi = 12; //treat as constant
var highest = 100; //treat as constant
var regHeight = getProperty("actor","height");
var platform = ["obstacle1", "obstacle2", "obstacle3", "obstacle4", "obstacle5", "obstacle6","ground"]; //MAKE SURE GROUND IS READ LAST!!!
var obstacle = ["obstacle1", "obstacle2", "obstacle3", "obstacle4", "obstacle5", "obstacle6"];
var key = [false,false,false,false,false];
//key[0] = left
//key[1] = right
//key[2] = up
//key[3] = down
//key[4] = space
var gravity = 1;
var oSpeed = 5;
var xVel = 0; 
var yVel = 0;
var timer = 0;
var onGround = false;
var auto = false;

setScreen("startScreen");

//*updates key array if a key is pressed
onEvent("gameScreen", "keydown", function(event) { //when a key is pressed
  //sets tester of corresponding key to true
  if(event.key == "Up" || event.key == "w") {
    key[2] = true;    
  }
  if(event.key == "Down" || event.key == "s") {
    key[3] = true;
  }
  if(event.key == "Left" || event.key == "a") {
    key[0] = true;
  }
  if(event.key == "Right" || event.key == "d" || auto) {
    key[1] = true;
  } 
  if(event.key == " " || auto) {
    key[4] = true;
  }
}); 


onEvent("x", "y", function() {
  
});

//*updates key array if a key is lifted
onEvent("gameScreen", "keyup", function(event) { //when a key is released
  //sets tester of corresponding key to false
  if(event.key == "Up" || event.key == "w") {
    key[2] = false;
  }
  if(event.key == "Down" || event.key == "s") {
    key[3] = false;
  }
  if(event.key == "Left" || event.key == "a") {
    key[0] = false;
  }
  if((event.key == "Right" || event.key == "d") && !auto) {
    key[1] = false;
  }
  if((event.key == " ") && !auto) {
    key[4] = false;
  }
});

//resets the game, plays again
onEvent("againButton","click",function() {
  setScreen("startScreen");
  prepare();
});

//main body of code, where everything happens
onEvent("start", "click", function() { 
  prepare();
  
  timedLoop(50/3, function() { //game loop set with frame delay
    lawsOfGravity();
    spawn();
    moveDarnit();
    movement();
    constrain();
    collision();
    gameOver();  
  });    
});

//defines our world
function lawsOfGravity() {
    if(yVel <= 0) {
      gravity = 1;
    }
    if(gravity > 1) {
      gravity = 0;
    }
    if(!onGround) {
      yVel -= gravity;
    } else {
      yVel = 0;
    }
}

//makes the player go vroom vroom
function movement() {
  //checks if key are up or down & decides direction
    xVel = 0;
    
    if(key[0]) {
      xVel += -MoveSpeed;
    }
    if(key[1]) {
      xVel += MoveSpeed;
    }
    if(key[3]) {
      setSize("actor",getProperty("actor","width"), regHeight/2);
    } else {
      setSize("actor",getProperty("actor","width"), regHeight);
    }
    if(key[4] || key[2]) { 
      if(onGround) {  
        yVel = Vi;
        gravity = 0.5;
        } else { //accelerate gravity while spacebar is down until normal
          gravity += 0.2;
        }
    } else { //set gravity to normal 1 if spacebar is let go
      gravity = 1;
    }
      
    //updates position of actor and hitbox after every key press
    setPosition("actor", getXPosition("actor")+xVel, getYPosition("actor")-yVel); 
    
}

//pretty self explanitory
function gameOver() {
  if(getYPosition("actor") > 450) {
      setScreen("gameOver");
      setText("score!", "Time Alive: " + parseInt(timer/60) + " seconds");
      setPosition("actor",160,225);    
  }
}

//moves the obstacles across the screen
function moveDarnit() {
  for(var i = 0; i < obstacle.length; i++) { //moves each obstacle & sets random positions
    if(!getProperty(obstacle[i],"hidden")) {
      setPosition(obstacle[i], getXPosition(obstacle[i])-oSpeed,getYPosition(obstacle[i]));
      
      if(getXPosition(obstacle[i]) <= -(getProperty(obstacle[i], "width"))) {
        setPosition(obstacle[i], 320, randomNumber(highest,425-getProperty(obstacle[i],"height")));
      }
    }
  }
}

//registers if one object intersects the player
function intersect(actor, platform) {
  var atl = {x: getXPosition(actor), y: getYPosition(actor)},
      atr = {x: getXPosition(actor)+getProperty(actor,"width"), y: getYPosition(actor)},
      abl = {x: getXPosition(actor), y: getYPosition(actor)+getProperty(actor,"height")};
  var ptl = {x: getXPosition(platform), y: getYPosition(platform)},
      ptr = {x: getXPosition(platform)+getProperty(platform,"width"), y: getYPosition(platform)},
      pbl = {x: getXPosition(platform), y: getYPosition(platform)+getProperty(platform,"height")};
  var aCorners = [atl,atr,abl];  
  var pCorners = [ptl,ptr,pbl];
  
  for(var i =0; i < aCorners.length; i++) {
    if((aCorners[i].x > pCorners[2].x && 
        aCorners[i].x < pCorners[1].x &&
        aCorners[i].y < pCorners[2].y &&
        aCorners[i].y > pCorners[1].y)||
       (pCorners[i].x > aCorners[2].x &&
        pCorners[i].x < aCorners[1].x &&
        pCorners[i].y < aCorners[2].y &&
        pCorners[i].y > aCorners[1].y)) {
      return true;
    }
  }
  return false;
}

//kicks the player out of the current box
function collision() {
  var temp = false;
  for(var i = 0; i < platform.length; i++) {
    //defines the corners of each block
    var atr = {x: getXPosition("actor")+getProperty("actor","width"), y: getYPosition("actor")},
        abl = {x: getXPosition("actor"), y: getYPosition("actor")+getProperty("actor","height")};
    var ptr = {x: getXPosition(platform[i])+getProperty(platform[i],"width"), y: getYPosition(platform[i])},
        pbl = {x: getXPosition(platform[i]), y: getYPosition(platform[i])+getProperty(platform[i],"height")};
    
    if(intersect("actor", platform[i])) {
       if(abl.x <= ptr.x && abl.x >= ptr.x - MoveSpeed-oSpeed)   {
        setPosition("actor", getXPosition(platform[i]) + getProperty(platform[i], "width"), getYPosition("actor"));
        temp = false;
      } else if(atr.x >= pbl.x && atr.x <= pbl.x + MoveSpeed+oSpeed) {
        setPosition("actor", getXPosition(platform[i])-getProperty("actor","width"), getYPosition("actor"));
        temp = false;
      } else if(atr.y <= pbl.y && atr.y >= ptr.y) {
        setPosition("actor", getXPosition("actor"), getYPosition(platform[i])+getProperty(platform[i], "height"));
        temp = false;
        gravity = 1;
      } else {
        setPosition("actor",getXPosition("actor"), getYPosition(platform[i])-getProperty("actor","height"));
        temp = true;
      }
    }
  }
  
  if(temp) {
    onGround = true;
  } else {
    onGround = false;
  }
}

//sets all the elements in opening positions
function prepare() {
  setScreen("gameScreen");
  for(var i = 0; i < obstacle.length; i++) {
    away(obstacle[i]);
  }
  gravity = 1;
  oSpeed = 5;
  xVel = 0; 
  yVel = 0;
  timer = 0;
  onGround = false;
  setPosition("actor",160,225);
  key = [false,false,false,false,false];
}

//hides an object so its not in use
function away(thang) {
  hideElement(thang);
  setPosition(thang, 0, 0, 1, 1);
}

//brings an object back to be used 
function back(thang) {
  showElement(thang);
  setPosition(thang, 320, 15, 100, 25);
}

//keeps the player withing the bounds of the game
function constrain() {
  if(getXPosition("actor") > 320-getProperty("actor","width")) {
    setPosition("actor",320-getProperty("actor","width"),getYPosition("actor"));
  }
  if(getYPosition("actor") < 0) {
    setPosition("actor",getXPosition("actor"),0);
  }
}

//moves along time, adds obstacles based on time
function spawn() {
    timer++;
    if(timer%60 == 0) {
      setText("tLabel","Time: " + (timer/60));
      
      if(timer/60 == 1) {
        back("obstacle1");
      } else if(timer/60 == 10) {
        back("obstacle2");
      } else if(timer/60 == 20) {
        back("obstacle3");
      } else if(timer/60 == 30) {
        back("obstacle4");
      } else if(timer/60 == 40) {
        back("obstacle5");
      } else if(timer/60 == 50) {
        back("obstacle6");
      }
    }
    
}

//*onEvents for detecting which keys are currently 
//down originally from https://studio.code.org/projects/applab/_RNRhet9AkT6aacw7gSLxQ/view
