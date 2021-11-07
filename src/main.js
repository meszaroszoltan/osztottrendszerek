import { VisualGrid } from './agents/grid.js';
import { Robot } from './agents/robot.js';
import { demoShape } from './agents/shapes.js';

const grid = new VisualGrid(demoShape);
const startColumn = grid.easternColumn()
const robot = new Robot(grid, { q: 8, r: 1 });

async function searchNextBranch() {
  while (1) {
    let moves = robot.getAvailableMoves();
    if (moves.includes('NW')) {
      await robot.move('NW');
      await moveNorth();
    } else if (moves.includes('SW')) {
      await robot.move('SW');
      await moveNorth();
    } else if (moves.includes('S')) {
      await robot.move('S');
    } else {
      break;
    }
  }
  await checkOverhangs();
}

async function checkOverhangs() {
  await moveNorth();
  while (1) {
    console.log('ide is belep');
    let moves = robot.getAvailableMoves();
    if (await easternOverhang() == true) {
      await getTileN();
      console.log('always true');
    } else if (moves.includes('S')) {
      await robot.move('S');
    } else {
      break;
    }
  }
  await moveE();
}

async function easternOverhang() {
  if (robot.getPosition().q == 6 && robot.getPosition().r == 6) {
    console.log('true');
    return true;
  } else {
    console.log('false');
    return false;
  }
}

async function moveE() {
  while (1) {
    let moves = robot.getAvailableMoves();
    if (moves.includes('SE')) {
      await robot.move('SE');
      moves = robot.getAvailableMoves();
      if (moves.includes('S')) {
        await robot.move('S');
        await searchNextBranch();
      } else {
        await checkOverhangs();
      }
    } else if (moves.includes('NE')) {
      await robot.move('NE');
      moves = robot.getAvailableMoves();
      if (moves.includes('S')) {
        await robot.move('S');
        await searchNextBranch();
      } else {
        await checkOverhangs();
      }
    } else if (moves.includes('N')) {
      await robot.move('N');
    } else {
      break;
    }
  }
  console.log('It is a tree!');
}

async function moveNorth() {
  let moves = robot.getAvailableMoves();
  while (moves.includes('N')) {
    await robot.move('N');
    moves = robot.getAvailableMoves();
  }
}

async function getTileN() {
  console.log('indulas');
  await moveNorth();
  let moves = robot.getAvailableMoves();
  if (!moves.includes('NW') || moves.includes('SW')) {
    await bringTile();
  } else {
    await getTileNW();
  }
}

async function bringTile() {
  console.log('bring');
  robot.liftTile();
  while(1) {
    let moves = robot.getAvailableMoves();
    if (moves.includes('NE')) {
      await robot.move('S');
      //await robot.move('SE');
    } else {
      break;
    }
  }
  while(1) {
    let moves = robot.getAvailableMoves();
    if (moves.includes('SE')) {
      await robot.move('S');
    } else {
      break;
    }
  }
  await robot.move('SE');
  robot.placeTile();
  return
  let moves = robot.getAvailableMoves();
  if (moves.includes('S')) {
    init();
  } else {
    await robot.move('SW');
    getTileN();
  }
}

async function getTileNW() {
  console.log('NW');
  let moves = robot.getAvailableMoves();
  if (moves.includes('NW') && (!moves.includes('SW') && !moves.includes('N'))) {
    await robot.move('NW');
  } else if (moves.includes('N')) {
    getTileN();
  } else if (moves.includes('SW')) {
    robot.liftTile();
    await robot.move('S')
    robot.placeTile();
    moves = robot.getAvailableMoves();
    if (moves.includes('S') || moves.includes('SE')) {
      await robot.move('NE');
      bringTile();
    } else {
      await robot.move('NE')
    }
  } else {
    bringTile();
  }
}

(async () => {
  searchNextBranch();
})();
