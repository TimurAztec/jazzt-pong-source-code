export default class RenderObjectRect {
    constructor(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 5;
        this.height = options.height || 5;
        this.color = options.color || '#FFFFFF';
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
