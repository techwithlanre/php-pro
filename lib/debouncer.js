/**
 * Debouncer utility - prevents rapid repeated function calls
 * Useful for file change listeners and search operations
 */
class Debouncer {
  constructor(delay = 1000) {
    this.delay = delay;
    this.timers = new Map();
  }

  debounce(key, fn, thisArg = null) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    const timer = setTimeout(() => {
      this.timers.delete(key);
      fn.call(thisArg);
    }, this.delay);
    this.timers.set(key, timer);
  }

  async debounceAsync(key, fn, thisArg = null) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        this.timers.delete(key);
        const result = await fn.call(thisArg);
        resolve(result);
      }, this.delay);
      this.timers.set(key, timer);
    });
  }

  cancel(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  cancelAll() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

module.exports = { Debouncer };
