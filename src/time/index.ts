class Stopwatch {
  private _start = 0;
  private _stop = 0;
  private _isRunning = false;

  public get elapsedTime() {
    return (this._isRunning ? Date.now() : this._stop) - this._start;
  }

  public get isRunning() {
    return this._isRunning;
  }

  public start() {
    if (this._isRunning) return;

    this._start = Date.now();
    this._stop = 0;
    this._isRunning = true;
  }

  public stop() {
    if (!this._isRunning) return;

    this._stop = Date.now();
    this._isRunning = false;
  }

  public reset() {
    this._start = this._isRunning ? Date.now() : 0;
    this._stop = 0;
  }

  public restart() {
    this._isRunning = true;
    this.reset();
  }
}

async function aDelayOf(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getStopwatch() {
  return new Stopwatch();
}

export { aDelayOf, getStopwatch };
