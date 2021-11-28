import { startAlgorithm } from './algorithm.js';
import { store, wait, setMoves, setCarrying } from './utils.js';

export class Robot {
	#grid;
	isCarrying;
	position;
	moves = 0;

	constructor(grid, position) {
		this.position = position;
		this.#grid = grid;
		this.#grid.robot = position;
		setCarrying(false);
		setMoves(0)
	}

	async start() {
		await startAlgorithm(this);
	}

	async move(direction) {
		this.moves += 1;
		setMoves(this.moves)
		await wait(store.speed);

		let { r, q } = this.position;
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
		}
		this.position = { r, q };
		this.#grid.robot = this.position;
	}

	async jump(position) {
		await wait(store.speed * 2);
		const dQ = Math.abs(this.position.q - position.q);
		const dR = Math.abs(this.position.r - position.r);
		this.moves += (dQ + dR);
		console.log(this.position);
		this.position = position;
		this.#grid.robot = this.position;
		console.log(this.position);

	}

	interact() {
		if (this.isCarrying) {
			// place
			this.isCarrying = false;
			this.#grid.add(this.position);
		}
		else {
			// lift
			this.isCarrying = true;
			this.#grid.remove(this.position);
		}
		setCarrying(this.isCarrying);
	}

	get availableMoves() {
		let { r, q } = this.position;
		const available = [];

		if (this.#grid.hasTile({ q, r: r - 1 })) {
			available.push('N');
		}
		if (this.#grid.hasTile({ q: q + 1, r: r - 1 })) {
			available.push('NE');
		}
		if (this.#grid.hasTile({ q: q + 1, r })) {
			available.push('SE');
		}
		if (this.#grid.hasTile({ q, r: r + 1 })) {
			available.push('S');
		}
		if (this.#grid.hasTile({ q: q - 1, r: r + 1 })) {
			available.push('SW');
		}
		if (this.#grid.hasTile({ q: q - 1, r })) {
			available.push('NW');
		}
		return available;
	}

	get grid() {
		return this.#grid;
	}

}
