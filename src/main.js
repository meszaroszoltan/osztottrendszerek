import { VisualGrid } from './agents/grid.js';
import { Robot } from './agents/robot.js';
import { demoShape, heart } from './etc/shapes.js';
import { run } from './etc/algo.js';

const grid1 = new VisualGrid('#grid1', heart);
const robot1 = new Robot(grid1, { q: 5, r: 5 });

document.getElementById('start1').addEventListener('click', async () => {
  await robot1.move('NE');
  await robot1.move('NE');
  await robot1.move('SE');
  robot1.liftTile()
  await robot1.move('N');
  await robot1.move('N');
  await robot1.move('NW');
  await robot1.move('SW');
  await robot1.move('SW');
  robot1.placeTile()
  await robot1.move('NE');
})


const grid2 = new VisualGrid('#grid2', demoShape, '#1434A4');
const robot2 = new Robot(grid2, { q: 5, r: 5 });

document.getElementById('start2').addEventListener('click', async () => {
  await run(robot2);
})

