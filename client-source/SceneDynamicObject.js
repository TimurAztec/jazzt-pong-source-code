import SceneObject from "./SceneObject";
import {playHit} from "./music-player";

export default class SceneDynamicObject extends SceneObject{

    constructor(options) {
        super(options)
        this.sx = options.sx || 0;
        this.sy = options.sy || 0;
        this.lastx = 0;
        this.lasty = 0;
    }

    process() {
        this.lastx = this.x;
        this.lasty = this.y;
    }

    collideBounds(canvas) {
        if (this.y < 0 || this.y+this.height > canvas.height) {
            this.sy = -this.sy;
        }
        if (this.x < 0 || this.x+this.width > canvas.width) {
            this.sx = -this.sx;
        }
    }
}
