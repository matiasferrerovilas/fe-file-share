export class Semaphore {
  private active = 0;
  private readonly max: number;
  private readonly queue: (() => void)[] = [];

  constructor(max: number) {
    this.max = max;
  }

  acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const grant = () => {
        this.active++;
        resolve(() => this.release());
      };

      if (this.active < this.max) {
        grant();
      } else {
        this.queue.push(grant);
      }
    });
  }

  private release() {
    this.active--;
    const next = this.queue.shift();
    if (next) next();
  }
}
