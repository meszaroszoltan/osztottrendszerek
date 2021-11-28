import { Robot } from './agents/robot.js';
import { VisualGrid } from './agents/grid.js';
import { Constants, randInt, store } from './agents/utils.js';
import { simple, demoShape } from './agents/shapes.js';
import { line, tree } from './agents/algorithm.js';

let grid = new VisualGrid('#grid', simple);
let robot = new Robot(grid, { q: 3, r: 3 }, line);

//let grid = new VisualGrid('#grid', demoShape);
//let robot = new Robot(grid, { q: 5, r: 5 }, tree);

document.getElementById('edit-toggle').addEventListener('click', () => {
	store.isEditMode = !store.isEditMode;
})

let speedToggled = false;
document.getElementById('speed-toggle').addEventListener('click', () => {
	speedToggled = !speedToggled;
	store.speed = speedToggled ? 25 : 400;
})

document.getElementById('random-button').addEventListener('click', () => {
	const shape = [];
	const numberOfTiles = Constants.GRID_HEIGHT * Constants.GRID_WIDTH * 0.6;
	for (let i = 0; i < numberOfTiles; i++) {
		shape.push({
			q: randInt(0, Constants.GRID_HEIGHT),
			r: randInt(0, Constants.GRID_WIDTH)
		})
	}
	document.getElementById('grid').innerHTML = '';
	grid = new VisualGrid('#grid', shape);
	robot = new Robot(grid, shape[0], line);
})

document.getElementById('start-button').addEventListener('click', async () => {
	await robot.start();
})
