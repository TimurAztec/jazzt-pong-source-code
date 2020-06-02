module.exports = class SceneObject {

    constructor(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 5;
        this.height = options.height || 5;
        this.color = options.color || '#FFFFFF';
        this.name = options.name || '';
        this.rotation = options.rotation || 0;
        this.staticRotation = options.staticRotation || false;
        this.cx = this.x + this.width/2;
        this.cy = this.y + this.height/2;
    }

    collide(angle) {

    }

}
