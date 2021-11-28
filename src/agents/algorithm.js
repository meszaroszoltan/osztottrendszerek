import { stringToHex } from './utils.js';

export async function startAlgorithm(robot) {
	await moveNorth(robot);
	await searchNextBranch(robot);
}

async function searchNextBranch(robot) {
	while (true) {
		const moves = robot.availableMoves();

		if (moves.includes('NW')) {
			await robot.move('NW');
			await moveNorth(robot);
		}
		else if (moves.includes('SW')) {
			await robot.move('SW');
			await moveNorth(robot);
		}
		else if (moves.includes('S')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	await checkOverhangs(robot);
}

async function checkOverhangs(robot) {
	await moveNorth(robot);

	while (true) {
		const moves = robot.availableMoves();

		if (await easternOverhang(robot)) {
			await getTileN(robot);
		}
		else if (moves.includes('S')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	await moveE(robot);
}

async function easternOverhang(robot) {
	console.log("Checking for eastern overhang");

	const noSNeighbors = [];
	[...robot.grid.state].map(stringToHex).forEach(x => {
		const availableMoves = robot.availableMoves(x);
		if (!availableMoves.includes('S')) {
			noSNeighbors.push(x);
		}
	});

	for (const x of noSNeighbors) {
		const potentialOverHangs = [];
		for (const y of noSNeighbors) {
			if (x !== y && x.q === y.q) {
				potentialOverHangs.push(y);
			}
		}

		let closest = { q: 0 }
		for (let neighbor of potentialOverHangs) {
			if ((neighbor.q - x) < closest.q) {
				closest = neighbor;
			}
		}

		// const start = { q: x.q-1, r: x.r+1};
		// const stop = { q: x.q-1, r: closest.r}

		let allTilesCool = true;
		for (let i = x.r+1; i < (closest.r - x.r-1); i++) {
			let hasTile = robot.grid.hasTile({ q: x.q-1, r: i});
			if (!hasTile) {
				allTilesCool = false;
			}
		}
		if (allTilesCool) {
			console.log("here")
			return true
		}
	}
	return false;
}

async function moveE(robot) {
	while (true) {
		let moves = robot.availableMoves();

		if (moves.includes('SE')) {
			await robot.move('SE');
			moves = robot.availableMoves();
			if (moves.includes('S')) {
				await robot.move('S');
				await searchNextBranch(robot);
			}
			else {
				await checkOverhangs(robot);
			}
		}
		else if (moves.includes('NE')) {
			await robot.move('NE');
			moves = robot.availableMoves();
			if (moves.includes('S')) {
				await robot.move('S');
				await searchNextBranch();
			}
			else {
				await checkOverhangs(robot);
			}
		}
		else if (moves.includes('N')) {
			await robot.move('N');
		}
		else {
			break;
		}
	}
}

async function moveNorth(robot) {
	let moves = robot.availableMoves();
	while (moves.includes('N')) {
		await robot.move('N');
		moves = robot.availableMoves();
	}
}

async function getTileN(robot) {
	await moveNorth(robot);
	const moves = robot.availableMoves();
	if (!moves.includes('NW') || moves.includes('SW')) {
		await bringTile(robot);
	}
	else {
		await getTileNW(robot);
	}
}

async function bringTile(robot) {
	robot.interact();
	while (true) {
		const moves = robot.availableMoves();

		if (moves.includes('NE')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	while (true) {
		const moves = robot.availableMoves();

		if (moves.includes('SE')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	await robot.move('SE');
	robot.interact();

	const moves = robot.availableMoves();
	if (moves.includes('S')) {
		await moveE(robot);
	}
	else {
		await robot.move('SW');
		await getTileN(robot);
	}
}

async function getTileNW(robot) {
	let moves = robot.availableMoves();
	if (moves.includes('NW') && (!moves.includes('SW') && !moves.includes('N'))) {
		await robot.move('NW');
	}
	else if (moves.includes('N')) {
		await getTileN(robot);
	}
	else if (moves.includes('SW')) {
		robot.interact();
		await robot.move('S')
		robot.interact();
		moves = robot.availableMoves();
		if (moves.includes('S') || moves.includes('SE')) {
			await robot.move('NE');
			await bringTile(robot);
		}
		else {
			await robot.move('NE')
		}
	}
	else {
		await bringTile(robot);
	}
}
