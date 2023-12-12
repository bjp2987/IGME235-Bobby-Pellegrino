//Hello! Just as an FYI, I will not be explaining any code directly pulled from Circle Blast.
//I will only be making new comments on my own code.
//Any comments from Circle Blast are just going to stay if I don't have anything in that section that I changed.

// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// aliases
let stage;

// game variables
let startScene;
let gameScene;
//These are a bunch of variables that will be used later. I will explain what these are when they are properly introduced in the code.
let paddleP1, paddleP2, scoreLabelP1, scoreLabelP2, hitWalls, p1Point, p2Point, paddlenoise, spawnballs;
let gameOverScene;

let circles = [];
//The scores of P1 and P2, respectively.
let P1Score = 0;
let P2Score = 0;
let paused = true;

//I ended up finding this video here that showed how to implement movement of a sprite in PIXIJS using the keyboard.
//https://www.youtube.com/watch?v=cP-_beFbz_Q
//I will explain the code I implemented based on that video as it appears.

//When the browser recognizes a key on the keyboard being pressed or released, the respective methods will activate.
window.addEventListener("keydown",keysPressed);
window.addEventListener("keyup",keysReleased);

//This creates an object named keys. This will have an entry for every key that was pressed since the window was loaded.
//for example:
//{
//    "87": true
//    "83": false
//}
//The browser has a number code for every keyboard key. For example, 87 is W and 83 is S.
//When the key in question is being pressed, the value for that key is set to true, and when released, it's set to false.
let keys = {};

let gameOverSceneLabel;

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();

	//Here is where the paddles for the 2 players are placed on screen.
    //2 instances of the object Paddle I made in classes.js are created.
    //The paddles are created, given their colors,
    //and placed at their respective sides of the screen.
    //P1 is blue, and P2 is red.
    //P1 is placed on the middle of the left side, P2 is the middle of the right side.
    paddleP1 = new Paddle(80,15,0x0000FF,10,sceneHeight / 2);
    gameScene.addChild(paddleP1);
    paddleP2 = new Paddle(80,15,0xFF0000,580,sceneHeight / 2);
    gameScene.addChild(paddleP2);

	//I created sound effects for the game using ChipTone.

    //Sound for when a ball hits the top or bottom of the screen.
    hitWalls = new Howl({
        src: ['../sounds/hitwalls.wav']
    });

    //Sound for when P1 gets a point.
    p1Point = new Howl({
        src: ['../sounds/p1point.wav']
    });

    //Sound for when P2 gets a point.
    p2Point = new Howl({
        src: ['../sounds/p2point.wav']
    });

    //Sound for when a ball hits a paddle.
    paddlenoise = new Howl({
        src: ['../sounds/paddle.wav']
    });

    //Sound for when balls spawn from the middle.
    spawnballs = new Howl({
        src: ['../sounds/spawnballs.wav']
    });
		
	// #8 - Start update loop
    app.ticker.add(gameLoop);
}

//Note: The font for this game is Silkscreen, which is a Google Font.
function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Silkscreen",
        stroke: 0x0000FF,
        strokeThickness: 8
    });

    //1 set up "startScene"
    //1A make top start label
    let startLabel1 = new PIXI.Text("Crazy Pong");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 60,
        fontFamily: "Silkscreen",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 60;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    //This explains to the player that the game will go until one of the players gets 20 points.
    let startLabelInstructions = new PIXI.Text("First to 20 points wins!");
    startLabelInstructions.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Silkscreen"
    });
    startLabelInstructions.x = 60;
    startLabelInstructions.y = 200;
    startScene.addChild(startLabelInstructions);

    //Explains P1's controls. Text is blue to match P1's paddle.
    let startLabel2 = new PIXI.Text("P1: W for up, S for down");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 25,
        fontFamily: "Silkscreen",
    });
    startLabel2.x = 40;
    startLabel2.y = 290;
    startScene.addChild(startLabel2);

    //Explains P2's controls. Text is red to match P2's paddle.
    let startLabel3 = new PIXI.Text("P2: Num8 for Up, Num2 for Down\n(or I/K)");
    startLabel3.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 25,
        fontFamily: "Silkscreen",
    });
    startLabel3.x = 40;
    startLabel3.y = 350;
    startScene.addChild(startLabel3);

    //1C make start game button
    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 190;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); //startGame is a function reference
    startButton.on("pointerover", e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);

    //2 set up "gameScene"
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 14,
        fontFamily: "Silkscreen",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    //As there are 2 players, there need to be 2 labels to display score with.
    //This label displays P1's score.
    scoreLabelP1 = new PIXI.Text();
    scoreLabelP1.style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 50,
        fontFamily: "Silkscreen",
    });
    scoreLabelP1.x = 160;
    scoreLabelP1.y = 5;
    gameScene.addChild(scoreLabelP1);
    increaseP1ScoreBy(0);

    //Displays P2's score.
    scoreLabelP2 = new PIXI.Text();
    scoreLabelP2.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 50,
        fontFamily: "Silkscreen",
    });;
    scoreLabelP2.x = 360;
    scoreLabelP2.y = 5;
    gameScene.addChild(scoreLabelP2);
    increaseP2ScoreBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 40,
	    fontFamily: "Silkscreen",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 160;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    //This will display who the winner of the game is.
    gameOverSceneLabel = new PIXI.Text("");
    gameOverSceneLabel.style = textStyle;
    gameOverSceneLabel.x = 200;
    gameOverSceneLabel.y = sceneHeight/2 + 10;
    gameOverScene.addChild(gameOverSceneLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    P1Score = 0;
    P2Score = 0;
    increaseP1ScoreBy(0);
    increaseP2ScoreBy(0);
    loadLevel();
}

//These 2 methods have the same exact logic as Circle Blast's increaseScoreBy() method,
//but I had to create 2 of them because there are 2 players to worry about.
//The respective method gets called based on when P1 or P2 scores a point.
//The value is added onto the score variable, and the score is updated.
function increaseP1ScoreBy(value){
    P1Score += value;
    scoreLabelP1.text = `${P1Score}`;
}
function increaseP2ScoreBy(value){
    P2Score += value;
    scoreLabelP2.text = `${P2Score}`;
}

function gameLoop(){
    if (paused) return;
	
	// #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	
	// #3 - Move Circles
	for(let c of circles){
        c.move(dt);
        //I only kept the logic for bouncing off the top of the screen
        //because the ball needs to go past the left and right sides of the screen to allow points to be scored.
        //Also, the hitWalls sound effect is played.
        if(c.y <= c.radius || c.y >= sceneHeight - c.radius){
            c.reflectY(sceneHeight);
            hitWalls.play();
        }
    }

    
    //This section keeps track of whether certain specfic keys are currently pressed.
    //If so, the respective paddle moves up or down as appropriate.

    //If W is pressed, P1's paddle should move up.
    if(keys["87"]){
        paddleP1.moveUp(dt);
    }
    //If S is pressed, P1's paddle should move down.
    if(keys["83"]){
        paddleP1.moveDown(dt);
    }
    
    //P2 has 2 options for keys. The number pad makes the most sense for movement to me,
    //but I also included I and K as an option incase the users don't have a number pad.

    //If I or Num8 are pressed, P2's paddle should move up.
    if(keys["73"] || keys["104"]){
        paddleP2.moveUp(dt);
    }
    //If K or Num2 are pressed, P2's paddle should move down.
    if(keys["75"] || keys["98"]){
        paddleP2.moveDown(dt);
    }

    //This logic prevents either paddle from getting off the screen.
    //If a paddle gets off the screen, it is forced back in bounds.
    //In-game, it looks like the player is simply forced against a wall.
    if(paddleP1.y < 0){
        paddleP1.y = 0;
    }
    if(paddleP1.y > sceneHeight - paddleP1.height){
        paddleP1.y = sceneHeight - paddleP1.height;
    }
    if(paddleP2.y < 0){
        paddleP2.y = 0;
    }
    if(paddleP2.y > sceneHeight - paddleP2.height){
        paddleP2.y = sceneHeight - paddleP2.height;
    }
	
	// #5 - Check for Collisions
	for (let c of circles){
        //Using the rectsIntersect method, every circle is checked to see if they are intersecting with either paddle.
        //If that is the case, the circle reflects in the X direction using reflectX(),
        //the paddle noise plays, and the circle's speed is increased by 2.5.
        if((c.isAlive && rectsIntersect(c,paddleP1)) || (c.isAlive && rectsIntersect(c,paddleP2))){
            c.reflectX(sceneWidth);
            paddlenoise.play();
            c.speed+= 2.5;
        }
    }
	
	//This is where the players get a point because of a ball escaping the left or right of the screen.
	for (let c of circles){
        //If a ball goes beyond the left side of the screen, 1 point is added to P2's score,
        //P2's sound plays, and the circle is declared as not being alive.
        if(c.x <= -10){
            increaseP2ScoreBy(1);
            p2Point.play();
            c.isAlive = false;
        }
        //If a ball goes beyond the right side of the screen, 1 point is added to P1's score,
        //P1's sound plays, and the circle is declared as not being alive.
        if(c.x >= sceneWidth + 10){
            increaseP1ScoreBy(1);
            p1Point.play();
            c.isAlive = false;
        }
    }

    // get rid of dead circles
    circles = circles.filter(c=>c.isAlive);
	
	//This part activates if there are 4 or less balls.
    //I put in this logic to avoid a situation where a ball is just stuck bouncing up and down the screen.
    //To resolve this problem, if a circle's x direction is too close to 0, it will be redirected.
    //If the ball is moving more left, it will move to the right and vice versa.
    if(circles.length <= 4){
        for(let c of circles){
            if(c.fwd.x >= -0.5 && c.fwd.x < 0){
                c.fwd.x = 0.5;
            }
            if(c.fwd.x > 0 && c.fwd.x <= 0.5){
                c.fwd.x = -0.5;
            }
            c.speed += 0.1;
        }
    }
    // If there are 2 or less balls, then more balls will spawn using loadLevel().
    if (circles.length <= 2){
	    loadLevel();
    }

    //If either players' scores are above 19, then the game ends.
    if(P1Score > 19 || P2Score > 19){
        end();
    }
}

//When a key is pressed in the browser, that key's keycode is added to the keys object if it isn't already, and the value is set to true.
function keysPressed(e){
    keys[e.keyCode] = true;
}
//When the key is released, its keycode is set to false.
function keysReleased(e){
    keys[e.keyCode] = false;
}

//The circle variants beyond normal and orthogonal are not included
//because the idea of wrapping balls doesn't make sense with Pong.
function createCircles(numCircles){
    for(let i=0; i<numCircles; i++){
        let c = new Circle(10,0xFFFFFF, 100);
        c.x = 300;
        c.y = (Math.random() * 140) + 230;
        circles.push(c);
        gameScene.addChild(c);
    }

    //orthogonal circles
    for(let i = 0; i < numCircles/5; i++){
        let c = new Circle(10, 0x00FFFF, 50);
        c.speed = Math.random() * 100 + 100;
        c.x = 300;
        c.y = c.y = (Math.random() * 140) + 230;
        c.fwd = {x:1,y:0}
        circles.push(c);
        gameScene.addChild(c);
    }
}

//Even though we aren't really going through levels per se, this method is still useful when more balls need to spawn.
//Additionally, the sound effect for spawning balls plays as well.
function loadLevel(){
	createCircles(5);
	paused = false;
    spawnballs.play();
}

function end(){
    paused = true;
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); // concise arrow function with no brackets and no return
    circles = [];

    //The proper winner is displayed on screen.
    //If player 1 has more points, they win.
    //If player 2 has more points, they win.
    //If for some reason there is a tie, then that is displayed as well.
    if(P1Score > P2Score){
        gameOverSceneLabel.text = `P1 Wins!`;
    }
    else if(P2Score > P1Score){
        gameOverSceneLabel.text = `P2 Wins!`;
    }
    else{
        gameOverSceneLabel.text = `Tie.`;
    }

    gameOverScene.visible = true;
    gameScene.visible = false;
}