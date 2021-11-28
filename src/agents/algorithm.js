export async function tree(robot) {
	await moveNorth(robot);
	await searchNextBranch(robot);
}

async function searchNextBranch(robot) {
	while (true) {
		const moves = robot.availableMoves;

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
		const moves = robot.availableMoves;

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
	return (
		robot.position.q === 6 &&
		robot.position.r === 6 &&
		!robot.availableMoves.includes('NE')
	)
}

async function moveE(robot) {
	while (true) {
		let moves = robot.availableMoves;

		if (moves.includes('SE')) {
			await robot.move('SE');
			moves = robot.availableMoves;
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
			moves = robot.availableMoves;
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
	let moves = robot.availableMoves;
	while (moves.includes('N')) {
		await robot.move('N');
		moves = robot.availableMoves;
	}
}

async function getTileN(robot) {
	await moveNorth(robot);
	const moves = robot.availableMoves;
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
		const moves = robot.availableMoves;

		if (moves.includes('NE')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	while (true) {
		const moves = robot.availableMoves;

		if (moves.includes('SE')) {
			await robot.move('S');
		}
		else {
			break;
		}
	}

	await robot.move('SE');
	robot.interact();

	const moves = robot.availableMoves;
	if (moves.includes('S')) {
		await moveE(robot);
	}
	else {
		await robot.move('SW');
		await getTileN(robot);
	}
}

async function getTileNW(robot) {
	let moves = robot.availableMoves;
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
		moves = robot.availableMoves;
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

export async function line(robot) {
	while (robot.availableMoves.includes('S')) {
		await robot.move('S');
	}

	while (true) {
		const terminated = await tileSearchingPhase(robot);
		if (terminated) {
			break;
		}
		else {
			await tileMovingPhase(robot);
		}
	}
}

async function tileSearchingPhase(robot) {
	while (robot.availableMoves.includes('N')
		|| robot.availableMoves.includes('NW')
		|| robot.availableMoves.includes('SW')
		) {
		if (robot.availableMoves.includes('N')) {
			await robot.move('N');
		}
		if (robot.availableMoves.includes('NW')) {
			await robot.move('NW');
		}
		if (robot.availableMoves.includes('SW')) {
			await robot.move('SW');
		}
	}

	return !robot.availableMoves.includes('NE') && !robot.availableMoves.includes('SE')
	&& !robot.availableMoves.includes('NW') && !robot.availableMoves.includes('SW')
}

async function tileMovingPhase(robot) {
	robot.interact();
	await robot.move('SE');
	while (robot.availableMoves.includes('S')) {
		await robot.move('S');
	}
	await robot.move('S');
	robot.interact();
}