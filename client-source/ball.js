import RenderObjectSprite from "./RenderObjectSprite";
import * as imgUrl from './ball.png';
import SceneDynamicObject from "./SceneDynamicObject";
import {playBeeps, playHit} from "./music-player";

export default class Ball extends SceneDynamicObject {

    constructor(options, PG, ctx) {
        super(options)
        this.PG = PG;
        this.ctx = ctx;
        this.renderObjects = new Array([
            new RenderObjectSprite({
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                imgUrl: imgUrl,
            })
        ])
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

    collide(angle, friction) {
        super.collide(angle);
        playHit();
        switch (angle) {
            case 1: {
                this.sx = -this.sx;
                this.PG.generateParticles(this.x + this.width, this.y + this.height / 2, 10, 'lft', this.ctx);
                break;
            }
            case 2: {
                this.sx = -this.sx;
                this.PG.generateParticles(this.x, this.y + this.height / 2, 10, 'rht', this.ctx);
                break;
            }
            case 3: {
                this.sy = -this.sy;
                this.PG.generateParticles(this.x + this.width / 2, this.y + this.height, 10, 'up', this.ctx);
                break;
            }
            case 4: {
                this.sy = -this.sy;
                this.PG.generateParticles(this.x + this.width / 2, this.y, 10, 'down', this.ctx);
                break;
            }
            default: {
                this.sx = -this.sx;
                break;
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
            this.sy = ((Math.random() * 2) + 0.5) + friction.y/3;
        } else {
            this.sy = (((Math.random() * 2) + 0.5) * -1) + friction.y/3;
        }
        this.changeRotation((this.sx + this.sy) * 0.1);
    }

    speedLimit() {
        if (this.sx > 15) {
            this.sx = 15
        } else if (this.sx < -15) {
            this.sx = -15
        } else if (this.sy > 10) {
            this.sy = 10
        } else if (this.sy < -10) {
            this.sy = -10
        }
    }

    collideBounds(canvas, score, paddles) {
        super.collideBounds(canvas);
        if (this.y < 0) {
            playHit();
            this.PG.generateParticles(this.x + this.width / 2, this.y, 10, 'down', this.ctx);
        }
        if (this.y + this.height > canvas.height) {
            playHit();
            this.PG.generateParticles(this.x + this.width / 2, this.y + this.height, 10, 'up', this.ctx);
        }
        if (this.x < 0) {
            playBeeps();
            score.score2 += 1;
            this.holded.state = true;
            this.holded.paddle = paddles[0][0];
            this.sx = 0;
            this.sy = 0;
        }
        if (this.x + this.width > canvas.width) {
            playBeeps();
            score.score1 += 1;
            this.holded.state = true;
            this.holded.paddle = paddles[0][1];
            this.sx = 0;
            this.sy = 0;
        }
    }

    process() {
        super.process();
        this.x += this.sx;
        this.y += this.sy;
        this.speedLimit();
        if (this.holded.state) {
            this.changeRotation(0.0);
            if (this.holded.paddle.name == 'paddle1') {
                this.x = this.holded.paddle.x + this.holded.paddle.width + 10;
                this.y = (this.holded.paddle.y + this.holded.paddle.height / 2) - this.height / 2;
            } else if (this.holded.paddle.name == 'paddle2') {
                this.x = this.holded.paddle.x - this.width - 10;
                this.y = (this.holded.paddle.y + this.holded.paddle.height / 2) - this.height / 2;
            }
        }
    }

    release(playerSide, score) {
        if (this.holded.state) {
            let friction = {x:0,y:0}; friction.y = this.holded.paddle.y - this.holded.paddle.lasty;
            if (this.holded.paddle.name == 'paddle1' && playerSide == 'left') {
                this.holded = {state: false, paddle: {}}
                this.sx += score.score2 || 1;
                this.sy = ((Math.random() * 2) + -1) + friction.y/4;
                this.changeRotation(this.sx * 0.1);
            } else if (this.holded.paddle.name == 'paddle2' && playerSide == 'right') {
                this.holded = {state: false, paddle: {}}
                this.sx -= score.score1 || 1;
                this.sy = ((Math.random() * 2) + -1) + friction.y/4;
                this.changeRotation(this.sx * 0.1);
            }
        }
    }
}
