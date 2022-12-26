enum Cell {
    Dead = 0,
    Alive = 1
}

class Universe {
    width: number;
    height: number;
    cells: Cell[];
    finished: boolean;
    previous: Cell[];
    previous2: Cell[];
    color: string;
    bgColor: string;

    constructor() {
        this.finished = false;
        this.width = 64;
        this.height = 64;
        this.cells = [];
        this.previous = [];
        this.previous2 = [];
        for (let i =1; i < (this.width * this.height); i++) {
            //const cell = (i % 2 == 0 || i % 7 == 0) ? Cell.Alive : Cell.Dead;
            const cell = Math.random() < 0.5 ? Cell.Alive : Cell.Dead;
            this.cells.push(cell);
            this.previous.push(Cell.Dead);
            this.previous2.push(Cell.Dead);
        }
        
        const r = Math.random() * 255;
        const g = Math.random() * 255;
        const b = Math.random() * 255;
        this.color = `rgb(${r},${g},${b})`;

        const br = 255 - r;
        const bg = 255 - g;
        const bb = 255 - b;
        this.bgColor = `rgb(${br},${bg},${bb})`;
    }

    getIndex(row: number, column: number) {
        return (row * this.width) + column;
    }

    liveNeighbourCount(row: number, column: number) {   
        let count = 0;
        // for the ranges -1 to +1 around the cell, for both rows and columns
        // When applying a delta of -1, we add self.height - 1 and let the modulo do its thing, rather than attempting to subtract 1
        for (let deltaRow of [this.height - 1, 0, 1]) {
            for (let deltaCol of [this.width - 1, 0, 1]) {
                if (deltaRow == 0 && deltaCol == 0) {
                    // don't count the cell itself
                    continue;
                }

                // use modulo to wrap round if necessary
                const neighbourRow = (row + deltaRow) % this.height;
                const neighbourCol = (column + deltaCol) % this.width;
                const idx = this.getIndex(neighbourRow, neighbourCol);
                count += this.cells[idx] as number; // add the value for this neighbour to the count. Note cast from Cell to number in order to count
            }
        }
        return count
    }

    tick() {
        const next = [...this.cells];

        for (let row = 0; row < this.height; row++) {    
            for (let col = 0; col < this.width; col++) {
                const idx = this.getIndex(row, col);
                const cell = this.cells[idx];
                const liveNeighbours = this.liveNeighbourCount(row, col);

                let nextCell = cell;

                if (cell === Cell.Alive) {
                    if (liveNeighbours < 2) {
                        // Rule 1: Any live cell with fewer than two live neighbours
                        // dies, as if caused by underpopulation.
                        nextCell = Cell.Dead;
                    } else if (liveNeighbours === 2 || liveNeighbours === 3) {
                        // Rule 2: Any live cell with two or three live neighbours
                        // lives on to the next generation.
                        nextCell = Cell.Alive;
                    } else {
                        // Rule 3: Any live cell with more than three live
                        // neighbours dies, as if by overpopulation.
                        nextCell = Cell.Dead;
                    }
                } else {
                    // cell is currently dead
                    if (liveNeighbours === 3) {
                        // Rule 4: Any dead cell with exactly three live neighbours
                        // becomes a live cell, as if by reproduction.
                        nextCell = Cell.Alive;
                    }
                    // All other cells remain in the same state.
                }

                next[idx] = nextCell;
            }
        }

        this.previous2 = this.previous;
        this.previous = this.cells;

        this.cells = next;

        const currentString = this.cellsAsString(this.cells);
        if (currentString === this.cellsAsString(this.previous) || currentString === this.cellsAsString(this.previous2)) {
            this.finished = true;    
        }
    }

    asString() {
        return this.cellsAsString(this.cells);
    }
    
    private cellsAsString(arr: Cell[]) {
        const lines = [];
        for (let row = 0; row < this.height; row++) {
            let line = "";   
            for (let col = 0; col < this.width; col++) {
                const idx = this.getIndex(row, col);
                let symbol = arr[idx] === Cell.Dead ? "◠": "◉";
                line += symbol;
            }
            lines.push(line);
        }
        return lines.join("\n");
    }

}

const pre = document.getElementById("game-content")!;
const body = document.getElementById("body");
let universe = new Universe();

const setColors = () => {
    body?.setAttribute("style", `color:${universe.color};background-color:${universe.bgColor}`);
};

setColors();

const renderLoop = () => {
    pre.textContent = universe.asString();
    universe.tick();
    if (universe.finished) {
        universe = new Universe();
        setColors();
    }
  
    requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);