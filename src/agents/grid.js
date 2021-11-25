const { createHexPrototype, Grid, rectangle } = globalThis.Honeycomb;
const hexToString = x => `${x.q},${x.r}`;
const stringToHex = x => {
  const [q, r] = x.split(',').map(s => +s);
  return {q, r};
}

export class VisualGrid {
  #GRID_WIDTH = 100;
  #GRID_HEIGHT = 100;

  tileColor = '#FF0000';
  robotColor = '#BEBEBE';

  #grid;
  #draw;
  #state;
  #robot;

  #debugMode;
  #builderMode;

  constructor(selector, state, tileColor, gridWidth, gridHeight, debug = false) {
    this.#GRID_WIDTH = gridWidth ?? this.#GRID_WIDTH;
    this.#GRID_HEIGHT = gridHeight ?? this.#GRID_HEIGHT;
    this.tileColor = tileColor ?? '#FF0000'; // TODO: kinda ugly, fix this

    this.#state = new Set(state.map(hexToString));
    if (state.length === 0) {
      this.#builderMode = true;
      console.log(`here`)
    }
    this.#debugMode = debug;

    const hexPrototype = createHexPrototype({
      dimensions: 25,
      orientation: 'flat',
      origin: 'topLeft'
    });
    this.#grid = new Grid(hexPrototype,
      rectangle({ start: [0, 0], width: this.#GRID_WIDTH , height: this.#GRID_HEIGHT }));

    this.#draw = SVG()
      .addTo(selector)
      .size('100%', '100%');

    this.#run();
  }

  #run() {
    if (this.#debugMode) console.log('drawing grid...');
    this.#draw.clear();

    this.#grid = this.#grid.each(hex => {

      const s = hexToString(hex);

      if (s === this.#robot) {
        this.#render(hex, this.robotColor);
      }
      else if (this.#state.has(s)) {
        this.#render(hex, this.tileColor);
      }
      else if (this.#builderMode) {
        this.#render(hex, '#FFFFFF');
      }
    })
    .run();
  }

  //FIXME: This is ugly af.
  #render(hex, color) {
    if (this.#debugMode) console.log(hex);
    const that = this; // I am sorry.

    const polygon = this.#draw
      .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
      .fill(color)
      .stroke({ width: 1, color })
      .click(function(){
        if (that.#builderMode) {
          const {q, r} = hex;

          if (that.#state.has(hexToString({q, r}))) {
            that.remove({q, r});
          }
          else {
            that.add({q, r});
          }
          that.#run();
        }
      });
    polygon.attr({
      stroke: '#000',
      'stroke-width': 1
    });
    return this.#draw.group().add(polygon);
  }

  set robot(r) {
    this.#robot = hexToString(r);
    if (this.#debugMode) console.log(`robot: ${JSON.stringify(r)}`);
    this.#run();
  }

  hasThisTile(hex) {
    return this.#state.has(hexToString(hex));
  }

  easternColumn() { // u mean most eastern col?
    let maximum = [0, 0];
    this.#state.forEach(value => {
      let new_value = [value[0], value[2]];
      if (maximum[0] < new_value[0]) {
        maximum = new_value;
      }
    });
    return Number(maximum[0]);
  }

  northernRow(col) {
    let minimum = [col, 100];
    this.#state.forEach(value => {
      let new_value = [value[0], value[2]];
      if (minimum[1] > new_value[1] && new_value[0] === col) {
        minimum = new_value;
      }
    });
    return Number(minimum[1]);
  }

  add(hex) {
    this.#state.add(hexToString(hex));
    this.#run();
  }

  remove(hex) {
    this.#state.delete(hexToString(hex));
    this.#run();
  }

  exportState() {
    return JSON.stringify(
        [...this.#state]
        .map(stringToHex)
    );
  }

}
