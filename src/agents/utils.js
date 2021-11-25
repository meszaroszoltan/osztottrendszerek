export const store = {
	speed: 300,
	isEditMode: false
};

export const Constants = {
	GRID_TILE_COLOR: '#358ee8',
	GRID_EMPTY_COLOR: '#FFFFFF',
	ROBOT_COLOR: '#000000',
	GRID_WIDTH: 25,
	GRID_HEIGHT: 20,
};

export const hexToString = (x) => `${x.q},${x.r}`;

export const stringToHex = (x) => {
	const [q, r] = x.split(',').map(s => +s);
	return { q, r };
};

export const wait = (duration) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), duration);
	});
};

export function setGridInfo() {
	document.getElementById('grid-info').innerText = Constants.GRID_HEIGHT + 'x' + Constants.GRID_WIDTH;
}

export function setMoves(value) {
	document.getElementById('moves').innerText = value;
}

export function setCarrying(value) {
	document.getElementById('carry').innerText = value;
}

export function randInt(min, max) {
	return Math.floor(
		Math.random() * (max - min) + min
	)
}
