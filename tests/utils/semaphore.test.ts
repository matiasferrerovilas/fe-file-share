import { describe, it, expect } from "vitest";
import { Semaphore } from "../../src/utils/semaphore";

describe("Semaphore", () => {
  it("otorga acceso inmediato mientras haya cupo disponible", async () => {
    const semaphore = new Semaphore(2);

    const release1 = await semaphore.acquire();
    const release2 = await semaphore.acquire();

    expect(release1).toBeInstanceOf(Function);
    expect(release2).toBeInstanceOf(Function);
  });

  it("encola una solicitud cuando se alcanza el máximo de concurrencia", async () => {
    const semaphore = new Semaphore(1);
    const order: number[] = [];

    const release1 = await semaphore.acquire();
    order.push(1);

    let acquired2 = false;
    const pending = semaphore.acquire().then((release) => {
      acquired2 = true;
      order.push(2);
      return release;
    });

    await Promise.resolve();
    expect(acquired2).toBe(false);

    release1();
    const release2 = await pending;

    expect(acquired2).toBe(true);
    expect(order).toEqual([1, 2]);
    release2();
  });

  it("respeta el orden FIFO de la cola al liberar", async () => {
    const semaphore = new Semaphore(1);
    const order: number[] = [];

    const release1 = await semaphore.acquire();
    const p2 = semaphore.acquire().then((release) => {
      order.push(2);
      return release;
    });
    const p3 = semaphore.acquire().then((release) => {
      order.push(3);
      return release;
    });

    release1();
    const release2 = await p2;
    release2();
    await p3;

    expect(order).toEqual([2, 3]);
  });

  it("permite hasta 'max' acquisitions concurrentes sin encolar", async () => {
    const semaphore = new Semaphore(3);
    let concurrent = 0;
    let maxConcurrent = 0;

    const run = async () => {
      const release = await semaphore.acquire();
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      concurrent--;
      release();
    };

    await Promise.all([run(), run(), run()]);

    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });
});
