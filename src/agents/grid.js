const { createHexPrototype, Grid, rectangle } = globalThis.Honeycomb;
const hexToString = x => `${x.q},${x.r}`;

export class VisualGrid {
  #GRID_WIDTH = 100;
  #GRID_HEIGHT = 100;

  tileColor = '#FF0000';
  robotColor = '#BEBEBE';

  #grid;
  #draw;
  #state;
  #robot;
  #debug;

  constructor(state, gridWidth, gridHeight, debug = false) {
    this.#GRID_WIDTH = gridWidth ?? this.#GRID_WIDTH;
    this.#GRID_HEIGHT = gridHeight ?? this.#GRID_HEIGHT;

    console.log(this.#GRID_WIDTH);

    this.#state = new Set(state.map(hexToString));
    this.#debug = debug;

    const hexPrototype = createHexPrototype({
      dimensions: 25,
      orientation: 'flat',
      origin: 'topLeft'
    });
    this.#grid = new Grid(hexPrototype,
      rectangle({ start: [0, 0], width: this.#GRID_WIDTH , height: this.#GRID_HEIGHT }));

    this.#draw = SVG()
      .addTo('body')
      .size('100%', '100%');

    this.#run();
  }

  #run() {
    if (this.#debug) console.log('drawing grid...');
    this.#draw.clear();

    this.#grid = this.#grid.each(hex => {

      const s = hexToString(hex);

      if (s === this.#robot) {
        this.#render(hex, this.robotColor);
      }
      else if (this.#state.has(s)) {
        this.#render(hex, this.tileColor);
      }
    })
    .run();
  }

  #render(hex, color) {
    if (this.#debug) console.log(hex);

    const polygon = this.#draw
      .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
      .fill(color)
      .stroke({ width: 1, color: color });
    return this.#draw.group().add(polygon);
  }

  set robot(r) {
    this.#robot = hexToString(r);
    if (this.#debug) console.log(`robot: ${JSON.stringify(r)}`);
    this.#run();
  }

  hasThisTile(hex) {
    return this.#state.has(hexToString(hex));
  }

  easternColumn() {
    var maximum = [0, 0]
    function logSetElements(value) {
      let new_value = [value[0], value[2]]
      if (maximum[0] < new_value[0]) {
        maximum = new_value
      }
    }
    this.#state.forEach(logSetElements)
    return Number(maximum[0])
  }

  northernRow(col) {
    var minimum = [col, 100]
    function logSetElements(value) {
      let new_value = [value[0], value[2]]
      if (minimum[1] > new_value[1] && new_value[0] == col) {
        minimum = new_value
      }
    }
    this.#state.forEach(logSetElements)
    return Number(minimum[1])
  }

  add(hex) {
    this.#state.add(hexToString(hex));
    this.#run();
  }

  remove(hex) {
    this.#state.delete(hexToString(hex));
    this.#run();
  }

}
