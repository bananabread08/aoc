import { getFileData } from '../getdata';

function solve(input: string): number {
  const board: string[] = input.split('\n');
  const pipeMaze: Record<number, Record<number, string>> = {};

  board.forEach((row, rowIndex) => {
    row.split('').forEach((cell, colIndex) => {
      if (!pipeMaze[rowIndex]) {
        pipeMaze[rowIndex] = {};
      }
      pipeMaze[rowIndex][colIndex] = cell;
    });
  });

  const pipes: Record<string, number[][]> = {
    '-': [
      [0, -1],
      [0, 1],
    ],
    L: [
      [-1, 0],
      [0, 1],
    ],
    J: [
      [-1, 0],
      [0, -1],
    ],
    '|': [
      [-1, 0],
      [1, 0],
    ],
    '7': [
      [0, -1],
      [1, 0],
    ],
    F: [
      [0, 1],
      [1, 0],
    ],
    '.': [],
    S: [],
  };

  const neighbors: Record<number, Record<number, Set<number[]>>> = {};
  Object.entries(pipeMaze).forEach(([row, cols]) => {
    Object.entries(cols).forEach(([col, cell]) => {
      const rowNumber = parseInt(row);
      const colNumber = parseInt(col);
      if (!neighbors[rowNumber]) {
        neighbors[rowNumber] = {};
      }
      neighbors[rowNumber][colNumber] = new Set(
        pipes[cell].map(([deltaX, deltaY]) => [rowNumber + deltaX, colNumber + deltaY]),
      );
    });
  });

  const height: number = board.length;
  const width: number = board[0].length;

  let startPosition: number[] = [];
  Object.entries(pipeMaze).forEach(([row, cols]) => {
    Object.entries(cols).forEach(([col, cell]) => {
      if (cell === 'S') {
        startPosition = [parseInt(row), parseInt(col)];
      }
    });
  });

  neighbors[startPosition[0]][startPosition[1]] = new Set(
    Array.from(Object.entries(neighbors))
      .flatMap(([row, cols]) =>
        Object.entries(cols).flatMap(([col, value]) =>
          Array.from(value).map((pos) => [...pos, parseInt(row), parseInt(col)]),
        ),
      )
      .filter(([x, y]) => x === startPosition[0] && y === startPosition[1])
      .map(([_, __, row, col]) => [row, col]),
  );

  const possibleDirections: Set<string> = new Set(
    Array.from(neighbors[startPosition[0]][startPosition[1]]).map(([row, col]) => {
      return `${startPosition[0] - row},${startPosition[1] - col}`;
    }),
  );

  const startPipeType: string = Object.entries(pipes).find(
    ([_, values]) =>
      new Set(values.map((val) => val.join(','))).size === possibleDirections.size &&
      Array.from(new Set(values.map((val) => val.join(',')))).every((value) =>
        possibleDirections.has(value),
      ),
  )![0];
  pipeMaze[startPosition[0]][startPosition[1]] = startPipeType;

  const loop: Set<string> = new Set([startPosition.join(',')]);
  let nodes: Set<string> = new Set(
    Array.from(neighbors[startPosition[0]][startPosition[1]]).map((pos) => pos.join(',')),
  );
  while (nodes.size) {
    const [currentRow, currentCol] = Array.from(nodes)[0].split(',').map(Number);
    loop.add([currentRow, currentCol].join(','));
    const newNodes: Set<string> = new Set(
      Array.from(neighbors[currentRow][currentCol])
        .filter((node) => !loop.has(node.join(',')))
        .map((node) => node.join(',')),
    );
    nodes = new Set([...nodes, ...newNodes]);
    nodes.delete([currentRow, currentCol].join(','));
  }

  function countRowIntersections(rowIndex: number): number {
    let topPipeCount = 0,
      bottomPipeCount = 0,
      intersectionCount = 0;
    for (let colIndex = 0; colIndex <= width; colIndex++) {
      const position = `${rowIndex},${colIndex}`;
      if (loop.has(position) && '|LJ'.includes(pipeMaze[rowIndex]?.[colIndex])) {
        topPipeCount++;
      }
      if (loop.has(position) && '|7F'.includes(pipeMaze[rowIndex]?.[colIndex])) {
        bottomPipeCount++;
      }
      if (bottomPipeCount % 2 && topPipeCount % 2 && !loop.has(position)) {
        intersectionCount++;
      }
    }
    return intersectionCount;
  }

  return Array.from({ length: height + 1 }).reduce(
    (accumulator: number, _, rowIndex) => accumulator + countRowIntersections(rowIndex),
    0,
  );
}

console.log(solve(getFileData('input.txt')));
