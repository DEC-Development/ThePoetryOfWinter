export default class TimeLoopTask {
    constructor(timeOut, looper) {
        this.time = 1000;
        this.setTimeout = timeOut.setTimeout.bind(timeOut);
        this.looper = looper;
    }
    delay(time) {
        this.time = time;
        return this;
    }
    start() {
        this.isStopped = false;
        let func = () => {
            if (!this.isStopped) {
                this.looper();
                this.setTimeout(func, this.time);
            }
        };
        this.setTimeout(func, this.time);
    }
    stop() {
        this.isStopped = true;
    }
}
//# sourceMappingURL=TimeLoopTask.js.map