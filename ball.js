const SceneDynamicObject = require("./SceneDynamicObject");

module.exports = class Ball extends SceneDynamicObject {

    constructor(options, PG, ctx) {
        super(options)
        this.PG = PG;
        this.ctx = ctx;
        this.holded = {
            state: false,
            paddle: {}
        }
    }

    // buildBlocks() {
    //     this.renderObjects = new Array([
    //         new RenderObjectRect({
    //             x: this.lx + ((this.width/2) - (this.width - this.width/3)/2),
    //             y: this.ly + ((this.height/2) - (this.height - this.height/3)/2),
    //             width: this.width - this.width/3 + 1,
    //             height: this.height - this.height/3 + 1
    //         }),
    //         new RenderObjectRect({
    //             x: this.lx,
    //             y: this.ly + ((this.height/2) - (this.height - this.height/2)/2),
    //             width: this.width,
    //             height: this.height - this.height/2
    //         }),
    //         new RenderObjectRect({
    //             x: this.lx + ((this.width/2) - (this.width - this.width/2)/2),
    //             y: this.ly,
    //             width: this.width - this.width/2,
    //             height: this.height
    //         })
    //     ]);
    // }

    changeRotation(rotation) {
        this.rotation = rotation;
    }

    collide(angle) {
        super.collide(angle);
        switch (angle) {
            case 1: {
                this.sx = -this.sx;
                break;
            }
            case 2: {
                this.sx = -this.sx;
                break;
            }
            case 3: {
                this.sy = -this.sy;
                break;
            }
            case 4: {
                this.sy = -this.sy;
                break;
            }
            default: {
                this.sx = -this.sx;
                this.sy = -this.sy;
                break;
            }
        }
        if (this.sx > 0) {
            this.sx++
        } else {
            this.sx--
        }
        if (this.sy > 0) {
            this.sy = (Math.random() * 3) + 0.5;
        } else {
            this.sy = ((Math.random() * 3) + 0.5) * -1;
        }
        this.changeRotation((this.sx + this.sy) * 0.1);
    }

    speedLimit() {
        if (this.sx > 15) {
            this.sx = 15
        } else if (this.sx < -15) {
            this.sx = -15
        }
    }

    collideBounds(canvas, score, paddles) {
        super.collideBounds(canvas);
        if (this.x < 0) {
            score.score2 += 1;
            this.holded.state = true;
            this.holded.paddle = paddles[0][0];
            this.x = 5;
            this.sx = 0;
            this.sy = 0;
            setTimeout(() => {
                    this.release('left', score);
            }, 10000);
        }
        if (this.x + this.width > canvas.width) {
            score.score1 += 1;
            this.holded.state = true;
            this.holded.paddle = paddles[0][1];
            this.x = canvas.width-(this.width+5);
            this.sx = 0;
            this.sy = 0;
            setTimeout(() => {
                    this.release('right', score);
            }, 10000);
        }
    }

    process(paddles) {
        this.x += this.sx;
        this.y += this.sy;
        this.speedLimit();
        if (this.holded.state) {
            this.changeRotation(0.0);
            if (this.holded.paddle.nameId == paddles[0][0].nameId) {
                this.x = paddles[0][0].x + paddles[0][0].width + 10;
                this.y = (paddles[0][0].y + paddles[0][0].height / 2) - this.height / 2;
            } else if (this.holded.paddle.nameId == paddles[0][1].nameId) {
                this.x = paddles[0][1].x - this.width - 10;
                this.y = (paddles[0][1].y + paddles[0][1].height / 2) - this.height / 2;
            }
        }
    }

    release(playerSide, score) {
        if (this.holded.state) {
            if (this.holded.paddle.nameId == 'paddle1' && playerSide == 'left') {
                this.holded = {state: false, paddle: {}}
                this.sx += score.score2 || 1;
                this.sy = ((Math.random() * 6) + -3);
                this.changeRotation(this.sx * 0.1);
            } else if (this.holded.paddle.nameId == 'paddle2' && playerSide == 'right') {
                this.holded = {state: false, paddle: {}}
                this.sx -= score.score1 || 1;
                this.sy = ((Math.random() * 6) + -3);
                this.changeRotation(this.sx * 0.1);
            }
        }
    }
}
