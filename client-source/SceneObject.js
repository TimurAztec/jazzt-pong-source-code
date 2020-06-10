import RenderObjectRect from "./RenderObjectRect";

export default class SceneObject {

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
        this.setRenderOptions(options.render || {});
        this.renderObjects = options.renderObjects || new Array([
            new RenderObjectRect({
                x: this.lx || 0,
                y: this.ly || 0,
                width: this.width,
                height: this.height,
                color: this.color
            })
        ]);
    }

    renderStatic(ctx) {
        this.renderObjects[0].forEach(item => {
            item.render(ctx);
        })
    }

    setRenderOptions(options) {
        this.localCanvas = document.createElement('canvas');
        this.localCtx = this.localCanvas.getContext('2d');
        this.localCanvas.width = options.width || this.width*1.5;
        this.localCanvas.height = options.height || this.height*1.5;
        this.lx = (this.localCanvas.width/2)-(this.width/2);
        this.ly = (this.localCanvas.height/2)-(this.height/2);
        if (this.staticRotation) {
            this.localCtx.translate(this.localCanvas.width/2, this.localCanvas.height/2);
            this.localCtx.rotate(this.rotation)
            this.localCtx.translate(-this.localCanvas.width/2, -this.localCanvas.height/2);
        }
    }

    renderActive(ctx) {
        this.localCtx.clearRect(0, 0, this.localCanvas.width, this.localCanvas.height);
        // this.localCtx.fillStyle = '#d90404';
        // this.localCtx.fillRect(0,0, this.localCanvas.width, this.localCanvas.height);
        // ctx.fillStyle = '#0452d9';
        // ctx.fillRect(this.x,this.y, this.width, this.height);
        this.localCtx.fillStyle = this.color;
        this.localCtx.translate(this.localCanvas.width/2, this.localCanvas.height/2);
        if (!this.staticRotation) { this.localCtx.rotate(this.rotation) }
        this.localCtx.translate(-this.localCanvas.width/2, -this.localCanvas.height/2);
        this.renderObjects[0].forEach(item => item.render(this.localCtx));
        ctx.drawImage(this.localCanvas, this.x, this.y);
    }

    collide(angle) {

    }

}
