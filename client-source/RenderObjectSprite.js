export default class RenderObjectSprite {
    constructor(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 5;
        this.height = options.height || 5;
        this.image = document.createElement('img');
        this.image.width = this.width;
        this.image.height = this.height;
        this.image.src = options.imgUrl.default;
    }

    render(ctx) {
        ctx.drawImage(this.image, this.x, this.y);
    }
}
