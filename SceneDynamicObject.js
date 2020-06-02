const SceneObject = require("./SceneObject");

module.exports = class SceneDynamicObject extends SceneObject{

    constructor(options) {
        super(options)
        this.sx = options.sx || 0;
        this.sy = options.sy || 0;
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
