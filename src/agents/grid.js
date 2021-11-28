import { Constants, hexToString, setGridInfo, store } from './utils.js';

const { createHexPrototype, Grid, rectangle } = globalThis.Honeycomb;

export class VisualGrid {
	#grid;
	#draw;
	#state;
	#robotPosition;

	constructor(selector, state) {
		this.#state = new Set(state.map(hexToString));

		const hexPrototype = createHexPrototype({
			dimensions: 25,
			orientation: 'flat',
			origin: 'topLeft'
		});

		this.#grid = new Grid(hexPrototype,
			rectangle({ start: [0, 0], width: Constants.GRID_WIDTH, height: Constants.GRID_HEIGHT }));

		this.#draw = SVG()
			.addTo(selector)
			.size('100%', '100%');

		setGridInfo();
	}

	#run() {
		this.#draw.clear();

		this.#grid = this.#grid.each(hex => {
			const s = hexToString(hex);
			if (s === this.#robotPosition) {
				this.#render(hex, Constants.ROBOT_COLOR);
			}
			else if (this.#state.has(s)) {
				this.#render(hex, Constants.GRID_TILE_COLOR);
			}
			else {
				this.#render(hex, Constants.GRID_EMPTY_COLOR);
			}
		}).run();
	}

	#render(hex, color) {
		const polygon = this.#draw
			.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
			.fill(color)
			.stroke({ width: 1, color })
			.attr({
				stroke: '#000',
				'stroke-width': 1
			})
			.click(() => {
				if (store.isEditMode) {
					const { q, r } = hex;
					if (this.hasTile({ q, r })) {
						this.remove({ q, r });
					}
					else {
						this.add({ q, r });
					}
					this.#run();
				}
			})
			;
		return this.#draw.group().add(polygon);
	}

	add(hex) {
		this.#state.add(hexToString(hex));
		this.#run();
	}

	remove(hex) {
		this.#state.delete(hexToString(hex));
		this.#run();
	}

	set robot(r) {
		this.#robotPosition = hexToString(r);
		this.#run();
	}

	hasTile(hex) {
		return this.#state.has(hexToString(hex));
	}

	easternColumn() {
		let maximum = 0;
		this.#state.forEach(value => {
			value = Number(value.split(',')[0]);
			if (value > maximum) {
				maximum = value;
			}
		});
		return maximum;
	}

	northernRow(col) {
		let minimum = 100;
		this.#state.forEach(value => {
			const valueRow = Number(value.split(',')[1]);
			const valueCol = Number(value.split(',')[0]);
			if (valueRow < minimum && valueCol === col) {
				minimum = valueRow;
			}
		});
		return minimum;
	}

	get state() {
		return this.#state;
	}
}
