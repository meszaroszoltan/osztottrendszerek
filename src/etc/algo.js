export async function run(robot) {
  await moveNorth(robot);
  searchNextBranch(robot);
}

async function searchNextBranch(robot) {
  while (true) {
    const moves = robot.getAvailableMoves();

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
    } else {
      break;
    }
  }

  await checkOverhangs(robot);
}

async function checkOverhangs(robot) {
  await moveNorth(robot);

  while (true) {
    const moves = robot.getAvailableMoves();

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
    robot.getPosition().q == 6 &&
    robot.getPosition().r == 6 &&
    !robot.getAvailableMoves().includes('NE')
  )
}

async function moveE(robot) {
  while (true) {
    let moves = robot.getAvailableMoves();

    if (moves.includes('SE')) {
      await robot.move('SE');
      moves = robot.getAvailableMoves();
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
      moves = robot.getAvailableMoves();
      if (moves.includes('S')) {
        await robot.move('S');
        await searchNextBranch();
      } else {
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
  let moves = robot.getAvailableMoves();
  while (moves.includes('N')) {
    await robot.move('N');
    moves = robot.getAvailableMoves();
  }
}

async function getTileN(robot) {
  await moveNorth(robot);
  const moves = robot.getAvailableMoves();
  if (!moves.includes('NW') || moves.includes('SW')) {
    await bringTile(robot);
  }
  else {
    await getTileNW(robot);
  }
}

async function bringTile(robot) {
  robot.liftTile();
  while (true) {
    const moves = robot.getAvailableMoves();

    if (moves.includes('NE')) {
      await robot.move('S');
    }
    else {
      break;
    }
  }

  while (true) {
    const moves = robot.getAvailableMoves();

    if (moves.includes('SE')) {
      await robot.move('S');
    }
    else {
      break;
    }
  }

  await robot.move('SE');
  robot.placeTile();

  const moves = robot.getAvailableMoves();
  if (moves.includes('S')) {
    await moveE(robot);
  }
  else {
    await robot.move('SW');
    getTileN(robot);
  }
}

async function getTileNW(robot) {
  let moves = robot.getAvailableMoves();
  if (moves.includes('NW') && (!moves.includes('SW') && !moves.includes('N'))) {
    await robot.move('NW');
  }
  else if (moves.includes('N')) {
    getTileN(robot);
  }
  else if (moves.includes('SW')) {
    robot.liftTile();
    await robot.move('S')
    robot.placeTile();
    moves = robot.getAvailableMoves();
    if (moves.includes('S') || moves.includes('SE')) {
      await robot.move('NE');
      bringTile(robot);
    }
    else {
      await robot.move('NE')
    }
  } else {
    bringTile(robot);
  }
}
