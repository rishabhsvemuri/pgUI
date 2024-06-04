class Plot {
    maker = 'barplot(';
    x;
    y;
  
    constructor(maker) {
      this.maker = maker;
    }
  
    set x(x) {
      this.x = x;
    }
  
    set y(y) {
      this.y = y;
    }
  
    get x() {
      return this.x;
    }
  
    get y() {
      return this.y;
    }
  }
  
  export { Plot };
  