

export class GameTimer {
    len: number = 0;
    finishedBool: boolean = false;
    timeout: null | ReturnType<typeof setTimeout> = null;
    callback!: () => void;
  
    constructor(callback: () => void, len: number) {
      this.len = len;
      this.callback = callback;
    }
  
    start() {
      this.reset();
    }
  
    reset() {
      this.finishedBool = false;
      this.timeout = setTimeout(() => {
        this.finishedBool = true;
        this.timeout = null;
        if (this.callback !== null) 
          this.callback();
      }, this.len);
    }
  
    stop() {
      if (this.timeout) 
        clearTimeout(this.timeout);
      this.timeout = null;
      this.finishedBool = true;
    }
  
    finished(time: number) {
      return this.finishedBool;
    }
  
    isActive() {
      return this.timeout !== null;
    }
  }