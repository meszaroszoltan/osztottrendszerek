function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration ?? 500);
  });
}

export class Robot {
  #grid;
  #position;
  #isCarrying;

  #COLOR_WHEN_CARRIYING = '#838383';
  #COLOR_WHEN_NOT_CARRIYING = '#BEBEBE';

  constructor(grid, position) {
    this.#position = position;
    this.#grid = grid;
    this.#grid.robot = position;
    this.#grid.robotColor = this.#COLOR_WHEN_NOT_CARRIYING;
  }

  async move(direction) {
    await wait();
    this.#move(direction);
  }

  #move(direction) {
    let { r, q } = this.#position;
    switch (direction) {
      case 'N':
        r += -1;
        q += 0;
        break;
      case 'NE':
        r += -1;
        q += 1;
        break;
      case 'SE':
        r += 0;
        q += 1;
        break;
      case 'S':
        r += 1;
        q += 0;
        break;
      case 'SW':
        r += 1;
        q += -1;
        break;
      case 'NW':
        r += 0;
        q += -1;
        break;
    };
    this.#position = { r, q };
    this.#grid.robot = this.#position;
  }

  liftTile() {
    if (this.#isCarrying) return;
    this.#isCarrying = true;
    this.#grid.robotColor = this.#COLOR_WHEN_CARRIYING;
    this.#grid.remove(this.#position);
  }

  placeTile() {
    if (!this.#isCarrying) return;
    this.#grid.robotColor = this.#COLOR_WHEN_NOT_CARRIYING;
    this.#isCarrying = false;
    this.#grid.add(this.#position);
  }

  getAvailableMoves() {
    let { r, q } = this.#position;
    const available = [];

    if (this.#grid.hasThisTile({ q, r: r-1 })) {
      available.push('N');
    }
    if (this.#grid.hasThisTile({ q: q+1, r: r-1 })) {
      available.push('NE');
    }
    if (this.#grid.hasThisTile({ q: q+1, r })) {
      available.push('SE');
    }
    if (this.#grid.hasThisTile({ q, r: r+1 })) {
      available.push('S');
    }
    if (this.#grid.hasThisTile({ q: q-1, r: r+1 })) {
      available.push('SW');
    }
    if (this.#grid.hasThisTile({ q: q-1, r })) {
      available.push('NW');
    }

    return available;
  }

}
