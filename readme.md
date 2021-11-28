# Forming tile shapes with simple robots - implementation  

## Project setup  

0. Download and install the necessary tools (if necessary):  
    - [git](https://gitforwindows.org/),
    - [Node.js](https://nodejs.org/en/)  

1. Clone the project:  
  `git clone https://github.com/meszaroszoltan/osztottrendszerek.git`  

2. Install the dependencies and start the app:  
  - `npm ci`  
  - `npm start`  
  - open `http://localhost:3000/` in your browser  

---

## How to use the program  

First, define the positions of the occupied tiles. These are axial coordinates on a flat hexagonal grid. For more info check this out https://www.redblobgames.com/grids/hexagons/#coordinates-axial.
These coordinates must be passed to the `VisualGrid` when instantiating.
The size of the grid can also be specified in the constructor. By default the grid is 100x100.

Example:
```js
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
```
> Life pro tip: enable logging for debugging: `new VisualGrid(occupied, 100, 100, true);`

The next step is creating the robot. The first constructor argument is the previously created grid object, and the second ins the starting position

```js
const robot = new Robot(grid, { q: 5, r: 5 });
```

In the main.js you can see a self invoking function that's where you should implement the algorithm.

Example:
```js
(async () => {
  await robot.move('S');
  await robot.move('S');
  await robot.move('SE');
  robot.liftTile()
  ...
})();
```

## The Robot's API
- `move(direction: str): void`  
  This moves the robot in the specified direction after 500 ms delay.  
  Possible direction: N, NE, SE, S, SW, NW  
  Tip for js beginners: always put the `await` keyword before this method call  

- `liftTile(): void`  
  The robot picks up the tile it is currently standing on.  
  Only one tile can be carried at once.  

- `interact(): void`  
  the robot puts down the tile it is currently carrying

- `getavailableMoves()(): str[]`  
  return which neighboring tiles are occupied  
