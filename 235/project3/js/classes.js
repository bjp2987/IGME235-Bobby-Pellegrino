class Circle extends PIXI.Graphics{
    constructor(radius, color=0xFF0000, speed=50, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = speed;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX(sceneWidth){
        this.fwd.x *= -1;
    }

    reflectY(sceneHeight){
        this.fwd.y *= -1;
    }
}

//This class was created by me in order to allow for the paddles to be displayed on screen,
//and also be able to move up and down the screen.
class Paddle extends PIXI.Graphics{
    constructor(height, width, color=0x0000FF, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawRect(0,0,height,width);
        this.endFill();
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.speed = 250;
    }

    //The paddle's y position is set upwards by a specific amount based on the speed * delta time.
    moveUp(dt=1/60){
        this.y -= this.speed * dt;
    }

    //Same deal, but moving down the screen.
    moveDown(dt=1/60){
        this.y += this.speed * dt;
    }
}