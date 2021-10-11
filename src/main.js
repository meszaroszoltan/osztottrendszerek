import { VisualGrid } from './agents/grid.js';
import { Robot } from './agents/robot.js';

const occupied = [
  { q: 2, r: 4 },
  { q: 3, r: 3 },
  { q: 4, r: 3 },

  { q: 4, r: 5 },
  { q: 3, r: 5 },
  { q: 2, r: 5 },

  { q: 5, r: 5 },
  { q: 8, r: 3 },

  { q: 6, r: 4 },
  { q: 7, r: 3 },
  { q: 8, r: 2 },

  { q: 8, r: 1 },
  { q: 7, r: 1 },
  { q: 6, r: 2 },
];

const grid = new VisualGrid(occupied);
const robot = new Robot(grid, { q: 5, r: 5 });

(async () => {
  console.log(robot.getAvailableMoves());
  await robot.move('NE');
  await robot.move('NE');
  await robot.move('SE');
  robot.liftTile()
  await robot.move('N');
  await robot.move('N');
  await robot.move('NW');
  await robot.move('SW');
  await robot.move('SW');
  robot.placeTile()
  await robot.move('NE');
})();
