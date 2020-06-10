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

    collide(angle) {
        super.collide(angle);
        playHit();
        switch (angle) {
            case 1: {
                this.PG.generateParticles(this.x + this.width, this.y + this.height / 2, 10, 'lft', this.ctx);
                break;
            }
            case 2: {
                this.PG.generateParticles(this.x, this.y + this.height / 2, 10, 'rht', this.ctx);
                break;
            }
            case 3: {
                this.PG.generateParticles(this.x + this.width / 2, this.y + this.height, 10, 'up', this.ctx);
                break;
            }
            case 4: {
                this.PG.generateParticles(this.x + this.width / 2, this.y, 10, 'down', this.ctx);
                break;
            }
            default: {
                break;
            }
        }
    }

    collideBounds(canvas) {
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
        }
        if (this.x + this.width > canvas.width) {
            playBeeps();
        }
    }

    process() {

    }

    release(playerSide, score) {

    }
}
