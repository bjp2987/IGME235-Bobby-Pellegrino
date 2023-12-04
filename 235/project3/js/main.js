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
let gameScene, paddleP1, paddleP2, scoreLabelP1, scoreLabelP2,shootSound,hitSound,fireballSound;
let gameOverScene;

let circles = [];
let P1Score = 0;
let P2Score = 0;
let paused = true;

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

	//Create paddles
    paddleP1 = new Paddle(70,10,0x0000FF,10,sceneWidth / 2);
    gameScene.addChild(paddleP1);
    paddleP2 = new Paddle(70,10,0xFF0000,580,sceneWidth / 2);
    gameScene.addChild(paddleP2);

	// #6 - Load Sounds
    shootSound = new Howl({
	    src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
	    src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
	    src: ['sounds/fireball.mp3']
    });
		
	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
    //app.view.onclick = fireBullet;
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 20,
        fontFamily: "Press Start 2P"
    });

    //1 set up "startScene"
    //1A make top start label
    let startLabel1 = new PIXI.Text("Crazy Pong");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 40,
        fontFamily: "Press Start 2P",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 90;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    //1B make middle start label
    let startLabel2 = new PIXI.Text("P1: W for up,\nS for down");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 20,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 4
    });
    startLabel2.x = 100;
    startLabel2.y = 250;
    startScene.addChild(startLabel2);

    let startLabel3 = new PIXI.Text("P2: Arrow keys for\nup and down");
    startLabel3.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 20,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 4
    });
    startLabel3.x = 100;
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
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    //2A make score label
    scoreLabelP1 = new PIXI.Text();
    scoreLabelP1.style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 40,
        fontFamily: "Verdana",
    });
    scoreLabelP1.x = 160;
    scoreLabelP1.y = 5;
    gameScene.addChild(scoreLabelP1);
    increaseP1ScoreBy(0);

    //2A make score label
    scoreLabelP2 = new PIXI.Text();
    scoreLabelP2.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 40,
        fontFamily: "Verdana",
    });;
    scoreLabelP2.x = 360;
    scoreLabelP2.y = 5;
    gameScene.addChild(scoreLabelP2);
    increaseP2ScoreBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n\n   :-O");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 25,
	    fontFamily: "Press Start 2P",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 160;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    gameOverSceneLabel = new PIXI.Text("");
    gameOverSceneLabel.style = textStyle;
    gameOverSceneLabel.x = 40;
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
    //establish position of paddles
    loadLevel();
}

function increaseP1ScoreBy(value){
    P1Score += value;
    scoreLabelP1.text = `${P1Score}`;
}
function increaseP2ScoreBy(value){
    P2Score += value;
    scoreLabelP2.text = `${P2Score}`;
}

function gameLoop(){
	if (paused) return; // keep this commented out for now
	
	// #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	
	// #3 - Move Circles
	for(let c of circles){
        c.move(dt);
        if(c.x <= c.radius || c.x >= sceneWidth - c.radius){
            c.reflectX(sceneWidth);
            //c.move(dt);
        }
        if(c.y <= c.radius || c.y >= sceneHeight - c.radius){
            c.reflectY(sceneHeight);
            //c.move(dt);
        }
    }
	
	// #5 - Check for Collisions
	for (let c of circles){

        ////5B circles collision
        //if(c.isAlive && rectsIntersect(c,)){
        //    hitSound.play();
        //    gameScene.removeChild(c);
        //    c.isAlive = false;
        //}
    }
	
	// #6 - Now do some clean up

    // get rid of dead circles
    circles = circles.filter(c=>c.isAlive);
	
	// #8 - Load next level
    if (circles.length == 0){
	    loadLevel();
    }
}

function createCircles(numCircles){
    for(let i=0; i<numCircles; i++){
        let c = new Circle(10,0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }

    //orthogonal circles
    for(let i = 0; i < numCircles/4; i++){
        let c = new Circle(10, 0x00FFFF);
        c.speed = Math.random() * 100 + 100;
        if(Math.random() < .5){
            c.x = Math.random() * (sceneWidth - 50) + 25;
            c.y = Math.random() * 100 + c.radius;
            c.fwd = {x:0,y:1}
        }
        else{
            c.x = Math.random() * 25 + c.radius;
            c.y = Math.random() * (sceneHeight - 80) - c.radius;
            c.fwd = {x:1, y:0};
        }
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
	createCircles(5);
	paused = false;
}

function end(){
    paused = true;
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); // concise arrow function with no brackets and no return
    circles = [];

    gameOverSceneLabel.text = `Your final Score: ${P1Score}`;

    gameOverScene.visible = true;
    gameScene.visible = false;
}