export default class ParticlesGenerator {

    constructor() {
        this.particels = new Array();
    }

    createParticle(x, y, direction, ctx) {
        return new Particle(ctx, x, y, direction)
    }

    generateParticles(x, y, amount, direction, ctx) {
        let particles = new Array();
        for(let i = 0 ; i < amount ; i++) {
            particles.push(this.createParticle(x, y, direction, ctx));
        }
        this.particels = particles;
    }

    render() {
        this.particels.forEach(particle => particle.draw());
    }
}

class Particle {

    constructor(ctx, x, y, direction) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        let deviationCalc;
        if (Math.round(Math.random() * 1) == 0) { deviationCalc = Math.round(Math.random() * 3); } else { deviationCalc = -Math.round(Math.random() * 3); }
        this.deviation = deviationCalc;
        this.lifeTime = Math.round(Math.random() * 25);
        this.direction = direction;
    }

    draw() {
        if (this.lifeTime) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(this.x, this.y, 3, 3);
            switch (this.direction) {
                case 'up': {
                    this.y -= 1;
                    this.x -= this.deviation;
                    break;
                }
                case 'down': {
                    this.y += 1;
                    this.x += this.deviation;
                    break;
                }
                case 'lft': {
                    this.x -= 1;
                    this.y -= this.deviation;
                    break;
                }
                case 'rht': {
                    this.x += 1;
                    this.y += this.deviation;
                    break;
                }
                default : {
                    this.y -= this.deviation;
                    break;
                }
            }
            this.lifeTime -= 1;
        }
    }

}
