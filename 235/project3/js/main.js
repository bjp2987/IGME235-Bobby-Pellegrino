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
let gameScene, paddleP1, paddleP2, scoreLabelP1, scoreLabelP2, hitWalls, p1Point, p2Point, paddlenoise, spawnballs;
let gameOverScene;

let circles = [];
let P1Score = 0;
let P2Score = 0;
let paused = true;

//https://www.youtube.com/watch?v=cP-_beFbz_Q
window.addEventListener("keydown",keysPressed);
window.addEventListener("keyup",keysReleased);
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

	//Create paddles
    paddleP1 = new Paddle(80,15,0x0000FF,10,sceneHeight / 2);
    gameScene.addChild(paddleP1);
    paddleP2 = new Paddle(80,15,0xFF0000,580,sceneHeight / 2);
    gameScene.addChild(paddleP2);

	// #6 - Load Sounds
    hitWalls = new Howl({
        src: ['../sounds/hitwalls.wav']
    });

    p1Point = new Howl({
        src: ['../sounds/p1point.wav']
    });

    p2Point = new Howl({
        src: ['../sounds/p2point.wav']
    });

    paddlenoise = new Howl({
        src: ['../sounds/paddle.wav']
    });

    spawnballs = new Howl({
        src: ['../sounds/spawnballs.wav']
    });
		
	// #8 - Start update loop
    app.ticker.add(gameLoop);
}

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

    let startLabelInstructions = new PIXI.Text("First to 20 points wins!");
    startLabelInstructions.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Silkscreen"
    });
    startLabelInstructions.x = 60;
    startLabelInstructions.y = 200;
    startScene.addChild(startLabelInstructions);

    //1B make middle start label
    let startLabel2 = new PIXI.Text("P1: W for up, S for down");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0x0000FF,
        fontSize: 25,
        fontFamily: "Silkscreen",
    });
    startLabel2.x = 40;
    startLabel2.y = 290;
    startScene.addChild(startLabel2);

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
    //2A make score label
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

    //2A make score label
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
        if(c.y <= c.radius || c.y >= sceneHeight - c.radius){
            c.reflectY(sceneHeight);
            hitWalls.play();
        }
    }

    //W
    if(keys["87"]){
        paddleP1.moveUp(dt);
    }
    //S
    if(keys["83"]){
        paddleP1.moveDown(dt);
    }
    //I or Num8
    if(keys["73"] || keys["104"]){
        paddleP2.moveUp(dt);
    }
    //K or Num2
    if(keys["75"] || keys["98"]){
        paddleP2.moveDown(dt);
    }

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
        //5B circles collision
        if((c.isAlive && rectsIntersect(c,paddleP1)) || (c.isAlive && rectsIntersect(c,paddleP2))){
            c.reflectX(sceneWidth);
            paddlenoise.play();
            c.speed+= 2.5;
        }
    }
	
	// #6 - Now do some clean up
	for (let c of circles){
        //5B circles collision
        if(c.x <= -10){
            increaseP2ScoreBy(1);
            p2Point.play();
            c.isAlive = false;
        }
        if(c.x >= sceneWidth + 10){
            increaseP1ScoreBy(1);
            p1Point.play();
            c.isAlive = false;
        }
    }

    // get rid of dead circles
    circles = circles.filter(c=>c.isAlive);
	
	//corrective alignment
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
    // #8 - Load next level
    if (circles.length <= 2){
	    loadLevel();
        spawnballs.play();
    }

    if(P1Score > 19 || P2Score > 19){
        end();
    }
}

function keysPressed(e){
    console.log(e.keyCode);
    keys[e.keyCode] = true;
}

function keysReleased(e){
    console.log(e.keyCode);
    keys[e.keyCode] = false;
}

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

function loadLevel(){
	createCircles(5);
	paused = false;
}

function end(){
    paused = true;
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); // concise arrow function with no brackets and no return
    circles = [];

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