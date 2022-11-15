class Animation {
    id = 0;
    step = 0;
    start = 0;
    previousTimeStep = 0;

    constructor(maxStep = 20, frameDuration = 400) {
        this.frameDuration = frameDuration;
        this.maxStep = maxStep;
    }

    run() {
        let that = this;
        if (this.firstStep !== undefined) this.firstStep(Date.now());
        this.id = window.requestAnimationFrame(function (t) {
            that.start = t;
            that.previousTimeStep = t;
            that.animate(t);
        });
    }

    animate(t) {
        if (this.step < this.maxStep) {
            let that = this;
            let delta = t - this.previousTimeStep;
            if (delta >= this.frameDuration) {
                //console.log(this.step + "-> delta = " + delta);
                this.nextStep(t);
                this.previousTimeStep = t;
                this.step++;
            }
            this.id = window.requestAnimationFrame(function (t) {
                that.animate(t);
            });
        } else {
            if (this.lastStep !== undefined) this.lastStep(Date.now());
            window.cancelAnimationFrame(this.id);
            this.duration = Date.now() - this.start;
            console.log("Animation terminee (" + this.duration + ")");
        }
    }
}
