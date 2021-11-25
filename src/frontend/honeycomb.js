(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Honeycomb = {}));
}(this, (function (exports) { 'use strict';

  /**
   * In TypeScript: pass a type variable to isObject() for best result. E.g.: `isObject<MyObject>(value)`
   */
  const isObject = (value) => typeof value === 'object' && value !== null;

  const isFunction = (value) => typeof value === 'function';

  const isOffset = (value) => isObject(value) && Number.isFinite(value.col) && Number.isFinite(value.row);

  const isPoint = (value) => isObject(value) && Number.isFinite(value.x) && Number.isFinite(value.y);

  const isTuple = (value) => Array.isArray(value) && Number.isFinite(value[0]) && Number.isFinite(value[1]);

  // todo: rename (also rename offset)?
  // todo: change to https://www.redblobgames.com/grids/hexagons/#conversions-offset
  const offsetFromZero = (offset, distance) => (distance + offset * (distance & 1)) >> 1;

  function signedModulo(dividend, divisor) {
      return ((dividend % divisor) + divisor) % divisor;
  }

  const tupleToCube = ([q, r, s = -q - r]) => ({ q, r, s });

  exports.CardinalCompassDirection = void 0;
  (function (CardinalCompassDirection) {
      CardinalCompassDirection[CardinalCompassDirection["N"] = 0] = "N";
      CardinalCompassDirection[CardinalCompassDirection["E"] = 2] = "E";
      CardinalCompassDirection[CardinalCompassDirection["S"] = 4] = "S";
      CardinalCompassDirection[CardinalCompassDirection["W"] = 6] = "W";
  })(exports.CardinalCompassDirection || (exports.CardinalCompassDirection = {}));
  exports.OrdinalCompassDirection = void 0;
  (function (OrdinalCompassDirection) {
      OrdinalCompassDirection[OrdinalCompassDirection["NE"] = 1] = "NE";
      OrdinalCompassDirection[OrdinalCompassDirection["SE"] = 3] = "SE";
      OrdinalCompassDirection[OrdinalCompassDirection["SW"] = 5] = "SW";
      OrdinalCompassDirection[OrdinalCompassDirection["NW"] = 7] = "NW";
  })(exports.OrdinalCompassDirection || (exports.OrdinalCompassDirection = {}));
  exports.CompassDirection = void 0;
  (function (CompassDirection) {
      CompassDirection[CompassDirection["N"] = 0] = "N";
      CompassDirection[CompassDirection["NE"] = 1] = "NE";
      CompassDirection[CompassDirection["E"] = 2] = "E";
      CompassDirection[CompassDirection["SE"] = 3] = "SE";
      CompassDirection[CompassDirection["S"] = 4] = "S";
      CompassDirection[CompassDirection["SW"] = 5] = "SW";
      CompassDirection[CompassDirection["W"] = 6] = "W";
      CompassDirection[CompassDirection["NW"] = 7] = "NW";
  })(exports.CompassDirection || (exports.CompassDirection = {}));
  class Compass {
      constructor(direction = exports.CompassDirection.N) {
          this.direction = typeof direction === 'number' ? direction : exports.CompassDirection[direction];
      }
      static of(direction = exports.CompassDirection.N) {
          return new Compass(direction);
      }
      static isCardinal(direction) {
          return !!exports.CardinalCompassDirection[direction];
      }
      static isOrdinal(direction) {
          return !!exports.OrdinalCompassDirection[direction];
      }
      static rotate(direction, steps) {
          return signedModulo(direction + steps, 8);
      }
      isCardinal() {
          return Compass.isCardinal(this.direction);
      }
      isOrdinal() {
          return Compass.isOrdinal(this.direction);
      }
      rotate(steps) {
          return Compass.rotate(this.direction, steps);
      }
  }
  Compass.N = exports.CompassDirection.N;
  Compass.NE = exports.CompassDirection.NE;
  Compass.E = exports.CompassDirection.E;
  Compass.SE = exports.CompassDirection.SE;
  Compass.S = exports.CompassDirection.S;
  Compass.SW = exports.CompassDirection.SW;
  Compass.W = exports.CompassDirection.W;
  Compass.NW = exports.CompassDirection.NW;

  const offsetToCubePointy = (col, row, offset) => {
      const q = col - offsetFromZero(offset, row);
      const r = row;
      const s = -q - r;
      return { q, r, s };
  };
  const offsetToCubeFlat = (col, row, offset) => {
      const q = col;
      const r = row - offsetFromZero(offset, col);
      const s = -q - r;
      return { q, r, s };
  };
  const offsetToCube = ({ col, row }, { offset, isPointy }) => (isPointy ? offsetToCubePointy(col, row, offset) : offsetToCubeFlat(col, row, offset));

  /**
   * Util for converting offset/axial/cube/tuple coordinates to cube coordinates. It's not placed in /src/utils because that causes circular dependencies.
   * @private
   */
  function assertCubeCoordinates(coordinates, hexPrototype) {
      const { q, r, s = -q - r } = isOffset(coordinates)
          ? offsetToCube(coordinates, hexPrototype)
          : isTuple(coordinates)
              ? tupleToCube(coordinates)
              : coordinates;
      return { q, r, s };
  }

  const isHex = (value) => isObject(value) && !!Object.getPrototypeOf(value).__isHoneycombHex;

  // todo: add to docs that when passed a hex, its center relative to the "origin hex" are returned (different per hex coordinates)
  // and when passed hex prototype, its center relative to any hex's origin are returned (always the same)
  function center(hexOrPrototype) {
      const { width, height } = hexOrPrototype;
      const { x, y } = isHex(hexOrPrototype) ? hexOrPrototype : hexOrPrototype.origin;
      return { x: width / 2 - x, y: height / 2 - y };
  }

  const cloneHex = (hex, newProps = {}) => {
      if (isOffset(newProps)) {
          const { col, row, ...otherProps } = newProps;
          const coordinates = offsetToCube({ col, row }, hex);
          return Object.assign(Object.create(Object.getPrototypeOf(hex)), hex, coordinates, otherProps);
      }
      newProps = isTuple(newProps) ? tupleToCube(newProps) : newProps;
      return Object.assign(Object.create(Object.getPrototypeOf(hex)), hex, newProps);
  };

  // todo: move types to single file in /src
  // tried it and somehow typescript can't call origin as a function anymore in createHexPrototype.ts normalizeOrigin()
  exports.Orientation = void 0;
  (function (Orientation) {
      Orientation["FLAT"] = "FLAT";
      Orientation["POINTY"] = "POINTY";
  })(exports.Orientation || (exports.Orientation = {}));

  const heightPointy = (yRadius) => yRadius * 2;
  const heightFlat = (yRadius) => yRadius * Math.sqrt(3);
  const height = ({ orientation, dimensions: { yRadius } }) => orientation === exports.Orientation.POINTY ? heightPointy(yRadius) : heightFlat(yRadius);

  const hexToPoint = ({ orientation, dimensions: { xRadius, yRadius }, origin: { x, y }, q, r }) => orientation === exports.Orientation.POINTY
      ? {
          x: xRadius * Math.sqrt(3) * (q + r / 2) - x,
          y: ((yRadius * 3) / 2) * r - y,
      }
      : {
          x: ((xRadius * 3) / 2) * q - x,
          y: yRadius * Math.sqrt(3) * (r + q / 2) - y,
      };

  const widthPointy = (xRadius) => xRadius * Math.sqrt(3);
  const widthFlat = (xRadius) => xRadius * 2;
  const width = ({ orientation, dimensions: { xRadius } }) => orientation === exports.Orientation.POINTY ? widthPointy(xRadius) : widthFlat(xRadius);

  const cornersPointy = (width, height, { x, y }) => [
      { x: x + width * 0.5, y: y - height * 0.25 },
      { x: x + width * 0.5, y: y + height * 0.25 },
      { x, y: y + height * 0.5 },
      { x: x - width * 0.5, y: y + height * 0.25 },
      { x: x - width * 0.5, y: y - height * 0.25 },
      { x, y: y - height * 0.5 },
  ];
  const cornersFlat = (width, height, { x, y }) => [
      { x: x + width * 0.25, y: y - height * 0.5 },
      { x: x + width * 0.5, y },
      { x: x + width * 0.25, y: y + height * 0.5 },
      { x: x - width * 0.25, y: y + height * 0.5 },
      { x: x - width * 0.5, y },
      { x: x - width * 0.25, y: y - height * 0.5 },
  ];
  function corners(hexOrHexSettings) {
      const { orientation, dimensions: { xRadius, yRadius }, } = hexOrHexSettings;
      const point = isHex(hexOrHexSettings) ? hexToPoint(hexOrHexSettings) : hexOrHexSettings.origin;
      return orientation === exports.Orientation.POINTY
          ? cornersPointy(widthPointy(xRadius), heightPointy(yRadius), point)
          : cornersFlat(widthFlat(xRadius), heightFlat(yRadius), point);
  }

  const createHex = (prototypeOrHex, props = { q: 0, r: 0 }) => {
      if (isHex(prototypeOrHex)) {
          return prototypeOrHex.clone(props);
      }
      if (isOffset(props)) {
          const { col, row, ...otherProps } = props;
          const coordinates = offsetToCube({ col, row }, prototypeOrHex);
          return Object.assign(Object.create(prototypeOrHex), coordinates, otherProps);
      }
      return Object.assign(Object.create(prototypeOrHex), props);
  };

  function equals(a, b) {
      if (isOffset(a) && isOffset(b)) {
          return a.col === b.col && a.row === b.row;
      }
      // can't use isOffset() because that also checks in the prototype chain and that would always return true for hexes
      if (Object.prototype.hasOwnProperty.call(a, 'col') || Object.prototype.hasOwnProperty.call(b, 'col')) {
          throw new Error(`Can't compare coordinates where one are offset coordinates. Either pass two offset coordinates or two axial/cube coordinates. Received: ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
      }
      const cubeA = (isTuple(a) ? tupleToCube(a) : a);
      const cubeB = (isTuple(b) ? tupleToCube(b) : b);
      return cubeA.q === cubeB.q && cubeA.r === cubeB.r;
  }

  const hexToOffsetPointy = (q, r, offset) => ({
      col: q + offsetFromZero(offset, r),
      row: r,
  });
  const hexToOffsetFlat = (q, r, offset) => ({
      col: q,
      row: r + offsetFromZero(offset, q),
  });
  const hexToOffset = ({ q, r, offset, isPointy }) => isPointy ? hexToOffsetPointy(q, r, offset) : hexToOffsetFlat(q, r, offset);

  const isFlat = ({ orientation }) => orientation === exports.Orientation.FLAT;

  const isPointy = ({ orientation }) => orientation === exports.Orientation.POINTY;

  const toString = ({ q, r }) => `${q},${r}`;

  const defaultHexSettings = {
      dimensions: { xRadius: 1, yRadius: 1 },
      orientation: exports.Orientation.POINTY,
      origin: { x: 0, y: 0 },
      offset: -1,
  };
  const createHexPrototype = (options) => {
      // pseudo private property
      const s = new WeakMap();
      const prototype = {
          ...defaultHexSettings,
          clone(newProps) {
              return cloneHex(this, newProps);
          },
          equals(coordinates) {
              return equals(this, isOffset(coordinates) ? offsetToCube(coordinates, this) : coordinates);
          },
          toString() {
              return toString(this);
          },
          // todo: add to docs that any of the above methods will be overwritten when present in customPrototype
          ...options,
      };
      // use Object.defineProperties() to create readonly properties
      // origin is set in the final "step"
      Object.defineProperties(prototype, {
          [Symbol.toStringTag]: { value: 'Hex' },
          __isHoneycombHex: { value: true, writable: false },
          // todo: all props set with `value` are writable (somehow the default `writable: false` doesn't apply). Not sure if this is a problem though
          // see: Object.getOwnPropertyDescriptors(hexPrototype)
          center: {
              get() {
                  return center(this);
              },
          },
          col: {
              get() {
                  return hexToOffset(this).col;
              },
          },
          corners: {
              get() {
                  return corners(this);
              },
          },
          dimensions: { value: normalizeDimensions(prototype) },
          height: {
              get() {
                  return height(this);
              },
          },
          isFlat: {
              get() {
                  return isFlat(this);
              },
          },
          isPointy: {
              get() {
                  return isPointy(this);
              },
          },
          orientation: { value: normalizeOrientation(prototype) },
          offset: { value: assertOffset(prototype) },
          row: {
              get() {
                  return hexToOffset(this).row;
              },
          },
          s: {
              get() {
                  return Number.isFinite(s.get(this)) ? s.get(this) : -this.q - this.r;
              },
              set(_s) {
                  s.set(this, _s);
              },
          },
          width: {
              get() {
                  return width(this);
              },
          },
          x: {
              get() {
                  return hexToPoint(this).x;
              },
          },
          y: {
              get() {
                  return hexToPoint(this).y;
              },
          },
      });
      return Object.defineProperties(prototype, {
          origin: { value: normalizeOrigin(prototype) },
      });
  };
  function normalizeDimensions(prototype) {
      const { dimensions } = prototype;
      if (isObject(dimensions)) {
          if (dimensions.xRadius > 0 && dimensions.yRadius > 0) {
              return { ...dimensions };
          }
          const { width, height } = dimensions;
          if (width > 0 && height > 0) {
              return normalizeOrientation(prototype) === exports.Orientation.POINTY
                  ? { xRadius: width / Math.sqrt(3), yRadius: height / 2 }
                  : { xRadius: width / 2, yRadius: height / Math.sqrt(3) };
          }
      }
      if (dimensions > 0) {
          return { xRadius: dimensions, yRadius: dimensions };
      }
      throw new TypeError(`Invalid dimensions: ${dimensions}. Dimensions must be expressed as an Ellipse ({ xRadius: number, yRadius: number }), a Rectangle ({ width: number, height: number }) or a number.`);
  }
  function normalizeOrientation({ orientation }) {
      orientation = orientation.toUpperCase();
      if (orientation === exports.Orientation.POINTY || orientation === exports.Orientation.FLAT) {
          return orientation;
      }
      throw new TypeError(`Invalid orientation: ${orientation}. Orientation must be either 'POINTY' or 'FLAT'.`);
  }
  function assertOffset({ offset }) {
      if (!Number.isFinite(offset)) {
          throw new TypeError(`Invalid offset: ${offset}. Offset must be a number.`);
      }
      return offset;
  }
  // origin can be a function that will be called with the almost-complete hex prototype (complete except for origin)
  function normalizeOrigin(prototype) {
      const { origin } = prototype;
      if (isPoint(origin)) {
          return { ...origin };
      }
      if (origin === 'topLeft') {
          return { x: prototype.width * -0.5, y: prototype.height * -0.5 };
      }
      if (isFunction(origin)) {
          return origin(prototype);
      }
      throw new TypeError(`Invalid origin: ${origin}. Origin must be expressed as a Point ({ x: number, y: number }), 'topLeft' or a function that returns a Point.`);
  }

  const round = ({ q, r, s = -q - r }) => {
      let roundedQ = Math.round(q);
      let roundedR = Math.round(r);
      let roundedS = Math.round(s);
      const diffQ = Math.abs(q - roundedQ);
      const diffR = Math.abs(r - roundedR);
      const diffS = Math.abs(s - roundedS);
      if (diffQ > diffR && diffQ > diffS) {
          roundedQ = -roundedR - roundedS;
      }
      else if (diffR > diffS) {
          roundedR = -roundedQ - roundedS;
      }
      else {
          roundedS = -roundedQ - roundedR;
      }
      return { q: roundedQ, r: roundedR, s: roundedS };
  };

  // inspired by https://github.com/gojuno/hexgrid-py
  // and simplified by https://www.symbolab.com/solver/simplify-calculator/simplify
  const pointToCube = ({ x, y }, { dimensions: { xRadius, yRadius }, origin, isPointy }) => {
      x += origin.x;
      y += origin.y;
      if (isPointy) {
          return round({ q: (Math.sqrt(3) * x) / (3 * xRadius) - y / (3 * yRadius), r: (2 / 3) * (y / yRadius) });
      }
      return round({ q: (2 / 3) * (x / xRadius), r: (Math.sqrt(3) * y) / (3 * yRadius) - x / (3 * xRadius) });
  };

  function distance(hexPrototype, from, to) {
      const { q: fromQ, r: fromR, s: fromS = -fromQ - fromR } = assertCubeCoordinates(from, hexPrototype);
      const { q: toQ, r: toR, s: toS = -toQ - toR } = assertCubeCoordinates(to, hexPrototype);
      return Math.max(Math.abs(fromQ - toQ), Math.abs(fromR - toR), Math.abs(fromS - toS));
  }

  const flatTraverse = (traversers) => (cursor, getHex) => {
      if (!Array.isArray(traversers)) {
          return Array.from(traversers(cursor, getHex));
      }
      const nextHexes = [];
      for (const traverser of traversers) {
          for (const nextCursor of traverser(cursor, getHex)) {
              cursor = nextCursor;
              nextHexes.push(cursor);
          }
      }
      return nextHexes;
  };

  const inStore = (hex, grid) => grid.store.has(hex.toString());

  const DIRECTIONS_POINTY = [
      null,
      { q: 1, r: -1 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      null,
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 }, // NW
  ];
  const DIRECTIONS_FLAT = [
      { q: 0, r: -1 },
      { q: 1, r: -1 },
      null,
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      null,
      { q: -1, r: 0 }, // NW
  ];
  const neighborOfPointy = ({ offset, q, r, col, row }, direction) => {
      if (direction === exports.CompassDirection.S || direction === exports.CompassDirection.N) {
          const nextRow = direction === exports.CompassDirection.S ? row + 1 : row - 1;
          return offsetToCubePointy(col, nextRow, offset);
      }
      const neighbor = DIRECTIONS_POINTY[direction];
      return { q: q + neighbor.q, r: r + neighbor.r };
  };
  const neighborOfFlat = ({ offset, q, r, col, row }, direction) => {
      if (direction === exports.CompassDirection.E || direction === exports.CompassDirection.W) {
          const nextCol = direction === exports.CompassDirection.E ? col + 1 : col - 1;
          return offsetToCubeFlat(nextCol, row, offset);
      }
      const neighbor = DIRECTIONS_FLAT[direction];
      return { q: q + neighbor.q, r: r + neighbor.r };
  };
  const neighborOf = (hex, direction) => hex.isPointy ? neighborOfPointy(hex, direction) : neighborOfFlat(hex, direction);

  class Grid {
      constructor(hexPrototype, traversersOrStore) {
          this.hexPrototype = hexPrototype;
          this.store = new Map();
          this.getHex = (coordinates) => {
              const hex = createHex(this.hexPrototype).clone(coordinates); // clone to enable users to make custom hexes
              return this.store.get(hex.toString()) ?? hex;
          };
          this._getPrevHexes = () => [];
          if (traversersOrStore instanceof Map) {
              this._getPrevHexes = () => Array.from(traversersOrStore.values());
              this.store = new Map(traversersOrStore);
          }
          else if (traversersOrStore) {
              const hexes = flatTraverse(traversersOrStore)(this.getHex(), this.getHex);
              this._getPrevHexes = () => hexes;
              this.store = new Map(hexes.map((hex) => [hex.toString(), hex]));
          }
      }
      static from(iterable) {
          let firstHex;
          let store;
          if (iterable instanceof Map) {
              firstHex = iterable.values()[Symbol.iterator]().next().value;
              store = iterable;
          }
          else {
              const array = Array.from(iterable);
              firstHex = array[0];
              store = new Map(array.map((hex) => [hex.toString(), hex]));
          }
          if (!firstHex) {
              throw new Error(`Can't create grid from empty iterable: ${iterable}`);
          }
          return new Grid(Object.getPrototypeOf(firstHex), store);
      }
      get [Symbol.toStringTag]() {
          return 'Grid';
      }
      pointToHex(point) {
          return this.getHex(pointToCube(point, this.hexPrototype));
      }
      distance(from, to) {
          return distance(this.hexPrototype, from, to);
      }
      update(callback) {
          let nextGrid = this._clone(this._getPrevHexes);
          nextGrid = callback(nextGrid) || nextGrid;
          // reset hex state to iterate over nextGrid's store (fixes issue #68)
          nextGrid._getPrevHexes = () => Array.from(nextGrid.store.values());
          return nextGrid;
      }
      each(callback) {
          const each = (currentGrid) => {
              const hexes = this._getPrevHexes(currentGrid);
              hexes.forEach((hex) => callback(hex, currentGrid));
              return hexes;
          };
          return this._clone(each);
      }
      map(callback) {
          const map = (currentGrid) => this._getPrevHexes(currentGrid).map((hex) => {
              const cursor = hex.clone();
              return callback(cursor, currentGrid) || cursor;
          });
          return this._clone(map);
      }
      filter(predicate) {
          const filter = (currentGrid) => this._getPrevHexes(currentGrid).filter((hex) => predicate(hex, currentGrid));
          return this._clone(filter);
      }
      takeWhile(predicate) {
          const takeWhile = (currentGrid) => {
              const hexes = [];
              for (const hex of this._getPrevHexes(currentGrid)) {
                  if (!predicate(hex, currentGrid)) {
                      return hexes;
                  }
                  hexes.push(hex);
              }
              return hexes;
          };
          return this._clone(takeWhile);
      }
      traverse(traversers) {
          const traverse = (currentGrid) => {
              // run any previous iterators
              this._getPrevHexes(currentGrid);
              return flatTraverse(traversers)(this.getHex(), this.getHex);
          };
          return this._clone(traverse);
      }
      hexes() {
          return this._getPrevHexes(this);
      }
      run(callback) {
          const hexes = this._getPrevHexes(this);
          hexes.forEach((hex) => callback && callback(hex, this));
          return this._clone(() => hexes);
      }
      _clone(getHexState) {
          const newGrid = new Grid(this.hexPrototype, this.store);
          newGrid._getPrevHexes = getHexState;
          return newGrid;
      }
  }

  const add = (...coordinates) => (_, getHex) => coordinates.map(getHex);

  /**
   * For each hex from `source` traverses over hex coordinates from `traverser`
   * @param source    Each hex in the source is passed one-by-one as a cursor to the traverser
   * @param branch Receives each hex coordinates from source as the start cursor
   */
  const branch = (source, branch) => (cursor, getHex) => {
      const flatBranch = flatTraverse(branch);
      const hexes = [];
      let _cursor = cursor;
      for (const sourceCursor of flatTraverse(source)(_cursor, getHex)) {
          _cursor = sourceCursor;
          hexes.push(_cursor);
          for (const branchCursor of flatBranch(_cursor, getHex)) {
              hexes.push(branchCursor);
          }
      }
      return hexes;
  };

  function line(options) {
      return (cursor, getHex) => {
          const { start, at } = options;
          const startHex = start && getHex(start);
          const hexes = startHex ? [startHex] : [];
          if (options.direction in exports.CompassDirection) {
              const { direction, length = 1 } = options;
              let _cursor = startHex ?? (at ? getHex(at) : cursor);
              for (let i = 1; i <= length; i++) {
                  _cursor = getHex(neighborOf(_cursor, direction));
                  hexes.push(_cursor);
              }
          }
          else {
              const { until, through } = options;
              const _start = start ?? at ?? cursor;
              const _through = until ?? through;
              const startCube = assertCubeCoordinates(_start, cursor);
              const throughCube = assertCubeCoordinates(_through, cursor);
              const length = distance(cursor, _start, _through);
              const step = 1.0 / Math.max(length, 1);
              for (let i = 1; until ? i < length : i <= length; i++) {
                  const coordinates = round(lerp(nudge(startCube), nudge(throughCube), step * i));
                  hexes.push(getHex(coordinates));
              }
          }
          return hexes;
      };
  }
  function nudge({ q, r, s }) {
      return { q: q + 1e-6, r: r + 1e-6, s: s + -2e-6 };
  }
  // linear interpolation
  function lerp(a, b, t) {
      const q = a.q * (1 - t) + b.q * t;
      const r = a.r * (1 - t) + b.r * t;
      return { q, r };
  }

  function rectangle(optionsOrCornerA, cornerB, includeCornerA = true) {
      return (cursor, getHex) => {
          const { width, height, start, at, direction = exports.CompassDirection.E } = cornerB
              ? optionsFromOpposingCorners(optionsOrCornerA, cornerB, cursor.isPointy, cursor.offset, includeCornerA)
              : optionsOrCornerA;
          const firstHex = start ? getHex(start) : at ? getHex(at) : cursor;
          const hexes = branch(line({ start: firstHex, direction: Compass.rotate(direction, 2), length: height - 1 }), line({ direction, length: width - 1 }))(firstHex, getHex);
          return start ? hexes : hexes.slice(1);
      };
  }
  function optionsFromOpposingCorners(cornerA, cornerB, isPointy, offset, includeCornerA) {
      const { col: cornerACol, row: cornerARow } = assertOffsetCoordinates(cornerA, isPointy, offset);
      const { col: cornerBCol, row: cornerBRow } = assertOffsetCoordinates(cornerB, isPointy, offset);
      const smallestCol = cornerACol < cornerBCol ? 'A' : 'B';
      const smallestRow = cornerARow < cornerBRow ? 'A' : 'B';
      const smallestColRow = (smallestCol + smallestRow);
      const { swapWidthHeight, direction } = RULES_FOR_SMALLEST_COL_ROW[smallestColRow];
      const width = Math.abs(cornerACol - cornerBCol) + 1;
      const height = Math.abs(cornerARow - cornerBRow) + 1;
      return {
          width: swapWidthHeight ? height : width,
          height: swapWidthHeight ? width : height,
          [includeCornerA ? 'start' : 'at']: cornerA,
          direction,
      };
  }
  function assertOffsetCoordinates(coordinates, isPointy, offset) {
      if (isOffset(coordinates)) {
          return coordinates;
      }
      const { q, r } = isTuple(coordinates) ? tupleToCube(coordinates) : coordinates;
      return hexToOffset({ q, r, isPointy, offset });
  }
  const RULES_FOR_SMALLEST_COL_ROW = {
      AA: {
          swapWidthHeight: false,
          direction: exports.CompassDirection.E,
      },
      AB: {
          swapWidthHeight: true,
          direction: exports.CompassDirection.N,
      },
      BA: {
          swapWidthHeight: true,
          direction: exports.CompassDirection.S,
      },
      BB: {
          swapWidthHeight: false,
          direction: exports.CompassDirection.W,
      },
  };
  /**
   * This is the "old way" of creating rectangles. It's less performant (up until ~40x slower with 200x200 rectangles), but it's able to create
   * actual rectangles (with 90° corners) for the ordinal directions. But because I assume people mostly need rectangles in the cardinal directions,
   * I've decided to drop "true ordinal rectangle" support for now.
   */
  // export const RECTANGLE_DIRECTIONS_POINTY = [
  //   null, // ambiguous
  //   ['q', 's', 'r'], // NE
  //   ['q', 'r', 's'], // E
  //   ['r', 'q', 's'], // SE
  //   null, // ambiguous
  //   ['r', 's', 'q'], // SW
  //   ['s', 'r', 'q'], // W
  //   ['s', 'q', 'r'], // NW
  // ] as [keyof CubeCoordinates, keyof CubeCoordinates, keyof CubeCoordinates][]
  // export const RECTANGLE_DIRECTIONS_FLAT = [
  //   ['s', 'q', 'r'], // N
  //   ['q', 's', 'r'], // NE
  //   null,
  //   ['q', 'r', 's'], // SE
  //   ['r', 'q', 's'], // S
  //   ['r', 's', 'q'], // SW
  //   null,
  //   ['s', 'r', 'q'], // NW
  // ] as [keyof CubeCoordinates, keyof CubeCoordinates, keyof CubeCoordinates][]
  // export const rectangle = <T extends Hex>(
  //   hexPrototype: T,
  //   {
  //     width,
  //     height,
  //     start = { q: 0, r: 0 },
  //     direction = hexPrototype.isPointy ? CompassDirection.E : CompassDirection.SE,
  //   }: RectangleOptions,
  // ) => {
  //   const result: T[] = []
  //   const _start: CubeCoordinates = { q: start.q, r: start.r, s: -start.q - start.r }
  //   const [firstCoordinate, secondCoordinate, thirdCoordinate] = (hexPrototype.isPointy
  //     ? RECTANGLE_DIRECTIONS_POINTY
  //     : RECTANGLE_DIRECTIONS_FLAT)[direction]
  //   const [firstStop, secondStop] = hexPrototype.isPointy ? [width, height] : [height, width]
  //   for (let second = 0; second < secondStop; second++) {
  //     // for (let second = 0; second > -secondStop; second--) {
  //     const secondOffset = offsetFromZero(hexPrototype.offset, second)
  //     for (let first = -secondOffset; first < firstStop - secondOffset; first++) {
  //       const nextCoordinates = {
  //         [firstCoordinate]: first + _start[firstCoordinate],
  //         [secondCoordinate]: second + _start[secondCoordinate],
  //         [thirdCoordinate]: -first - second + _start[thirdCoordinate],
  //       } as unknown
  //       result.push(createHex<T>(hexPrototype, nextCoordinates as CubeCoordinates))
  //     }
  //   }
  //   return result
  // }

  exports.Rotation = void 0;
  (function (Rotation) {
      Rotation["CLOCKWISE"] = "CLOCKWISE";
      Rotation["COUNTERCLOCKWISE"] = "COUNTERCLOCKWISE";
  })(exports.Rotation || (exports.Rotation = {}));

  const ring = ({ start, at, center, rotation }) => (cursor, getHex) => {
      rotation = rotation?.toUpperCase() ?? exports.Rotation.CLOCKWISE;
      const firstHex = start ? getHex(start) : at ? getHex(at) : cursor;
      const radius = distance(cursor, center, firstHex);
      const hexes = [];
      // always start at coordinates radius away from the center, reorder the hexes later
      const { q, r, s } = assertCubeCoordinates(center, cursor);
      let _cursor = getHex({ q, r: r - radius, s: s + radius });
      if (rotation === exports.Rotation.CLOCKWISE) {
          for (let direction = 0; direction < 6; direction++) {
              for (let i = 0; i < radius; i++) {
                  const { q, r } = DIRECTION_COORDINATES[direction];
                  _cursor = getHex({ q: _cursor.q + q, r: _cursor.r + r });
                  hexes.push(_cursor);
              }
          }
      }
      else {
          for (let direction = 5; direction >= 0; direction--) {
              for (let i = 0; i < radius; i++) {
                  const { q, r } = DIRECTION_COORDINATES[direction];
                  _cursor = getHex({ q: _cursor.q - q, r: _cursor.r - r });
                  hexes.push(_cursor);
              }
          }
      }
      const startIndex = hexes.findIndex((hex) => hex.equals(firstHex));
      // move part of hexes array to the front so that firstHex is actually the first hex
      return hexes.slice(startIndex + (start ? 0 : 1)).concat(hexes.slice(0, startIndex));
  };
  const DIRECTION_COORDINATES = [
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
      { q: 1, r: -1 },
  ];

  const spiral = ({ radius, start, at, rotation }) => (cursor, getHex) => {
      const center = start ? getHex(start) : at ? getHex(at) : cursor;
      return branch(line({ start, at, direction: exports.CompassDirection.N, length: radius }), ring({ center, rotation }))(getHex(center), getHex);
  };

  exports.Compass = Compass;
  exports.Grid = Grid;
  exports.add = add;
  exports.assertCubeCoordinates = assertCubeCoordinates;
  exports.branch = branch;
  exports.center = center;
  exports.cloneHex = cloneHex;
  exports.corners = corners;
  exports.cornersFlat = cornersFlat;
  exports.cornersPointy = cornersPointy;
  exports.createHex = createHex;
  exports.createHexPrototype = createHexPrototype;
  exports.defaultHexSettings = defaultHexSettings;
  exports.distance = distance;
  exports.equals = equals;
  exports.flatTraverse = flatTraverse;
  exports.height = height;
  exports.heightFlat = heightFlat;
  exports.heightPointy = heightPointy;
  exports.hexToOffset = hexToOffset;
  exports.hexToOffsetFlat = hexToOffsetFlat;
  exports.hexToOffsetPointy = hexToOffsetPointy;
  exports.hexToPoint = hexToPoint;
  exports.inStore = inStore;
  exports.isFlat = isFlat;
  exports.isHex = isHex;
  exports.isPointy = isPointy;
  exports.line = line;
  exports.neighborOf = neighborOf;
  exports.neighborOfFlat = neighborOfFlat;
  exports.neighborOfPointy = neighborOfPointy;
  exports.offsetToCube = offsetToCube;
  exports.offsetToCubeFlat = offsetToCubeFlat;
  exports.offsetToCubePointy = offsetToCubePointy;
  exports.pointToCube = pointToCube;
  exports.rectangle = rectangle;
  exports.ring = ring;
  exports.round = round;
  exports.spiral = spiral;
  exports.toString = toString;
  exports.width = width;
  exports.widthFlat = widthFlat;
  exports.widthPointy = widthPointy;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
