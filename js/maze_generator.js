//Setup
function initMaze() {
	if (window.maze) {
		clearTimeout(window.maze.timeout);
	}

	let canvasSize = 400;
	let blocks = 10;
	let interval = 10;
	let steps = 1;

	window.maze = new MazeGenerator(
		canvasSize,
		canvasSize,
		blocks,
		blocks,
		interval,
		steps,
		"maze"
	);

	window.maze.generate();
}

class Player {
	x = 0;
	y = 0;
	width = 0;
	height = 0;

	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	draw(context) {
		context.fillStyle = "#5E5B6A";
		context.beginPath();
		context.arc(this.x * this.width + this.width / 2, this.y * this.height + this.height / 2, this.width * 0.33, 0, Math.PI * 2);
		context.fill();
	}
}

//Maze definition starts here
class MazeGenerator {
	constructor(width, height, hBlocks, vBlocks, interval, steps, id) {
		this.canvas = document.getElementById(id);
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d");
		
		this.width = width;
		this.height = height;
		this.hBlocks = hBlocks;
		this.vBlocks = vBlocks;
		this.blockWidth = this.width / this.hBlocks;
		this.blockHeight = this.height / this.vBlocks;
		this.interval = interval;
		this.steps = steps;

		this.markers = [];

		this.lap = 0;
		this.TOTAL_LAPS = 3;
		this.measureTime = 0;

		this.endGame = false;

		this.init();
	}

	init() {
		this.blocks = [];
		this.markers = [];
		this.history = [];
		this.currentBlock = undefined;
		this.finished = false;

		this.player = new Player(0, 0, this.blockWidth, this.blockHeight);

		this.ctx.fillStyle = "#111328";
		this.ctx.fillRect(0, 0, this.width, this.height);
		for (let y = 0; y < this.vBlocks; ++y) {
			let row = [];
			for (let x = 0; x < this.hBlocks; ++x) {
				row.push(new Block(this, x, y));
			}

			this.blocks.push(row);
		}

    //Start the timer.
		if(this.lap === 0) this.measureTime = Date.now();

    this.markers.push({x: this.hBlocks - 1, y: this.vBlocks - 1, taken: false});
    
		for(let i = 1; i < Math.min(this.lap + 1, 3); i++) {
			this.markers.push({x: Math.round(Math.random() * (this.hBlocks - 1)), y: Math.round(Math.random() * (this.vBlocks - 1)), taken: false})
    }
    
	}

	generate() {
		for (let c = 0; c < this.steps; ++c) {
			if (!this.finished) {
				this.step();
			} 
		}

		if(!this.finished) {
			this.timeout = setTimeout(() => {
				this.generate();
			}, this.interval);
		} else {
			this.redraw();

			console.log("Fire up events!");

			window.onkeydown = (event) => {
				if(this.endGame) {
					window.onkeydown = null;

					this.lap = 0;
					this.endGame = false;

					this.init();
					this.generate();

					return;
				}

				const block = this.getBlock(this.player.x, this.player.y);
				if(block) {
					switch(event.key.toLowerCase()) {
						case 'w':
							if(this.player.y - 1 >= 0 && block.connectedTo(block.neighbor(0, -1))) {
								this.player.y--;
							}
							break;
						case 's':
							if(this.player.y + 1 < this.hBlocks && block.connectedTo(block.neighbor(0, 1))) {
								this.player.y++;
							}
							break;
						case 'd':
							if(this.player.x + 1 < this.vBlocks && block.connectedTo(block.neighbor(1, 0))) {
								this.player.x++;
							}
							break;
						case 'a':
							if(this.player.x - 1 >= 0 && block.connectedTo(block.neighbor(-1, 0))) {
								this.player.x--;
							}
							break;
						default: break;
					}

					this.redraw();

					let completed = true;
					this.markers.forEach(element => {
						if(!element.taken) {
							if(this.player.x === element.x && this.player.y === element.y) {
								element.taken = true;
							} else completed = false;
						}
					});

					if(completed) {
						this.lap++;

						if(this.lap < this.TOTAL_LAPS) {
							window.onkeydown = null;

							this.init();
							this.generate();
						} else {
							this.endGame = true;

							this.ctx.fillStyle = "grey";
							this.ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 120);

							this.ctx.textAlign = "center";
							this.ctx.fillStyle = "white";

							this.ctx.font = "30px Arial";
							this.ctx.fillText("You won! Congratulations!", this.canvas.width / 2, this.canvas.height / 2);

							this.ctx.font = "15px Arial";
							this.ctx.fillText("Total time to complete: " + ((Date.now() - this.measureTime) / 1000).toFixed(2) + "s", 
											  this.canvas.width / 2, this.canvas.height / 2 + 30);

							this.ctx.font = "20px Arial";
							this.ctx.fillText("Press any button to restart.", this.canvas.width / 2, this.canvas.height / 2 + 60);
						}
					}
				} else throw new Error("Player beyond the map!");
			}
		}
	}

	getBlock(x, y) {
		for(let i = 0; i < this.blocks.length; ++i) {
			const row = this.blocks[i];
			for(let j = 0; j < row.length; ++j) {
				const block = row[j];
				if(block.x === x && block.y === y) {
					return block;
				}
			}
		}

		return null;
	}

	redraw() {
		this.ctx.fillStyle = "#111328";
		this.ctx.fillRect(0, 0, this.width, this.height);

		this.blocks.forEach((row) => {
			row.forEach((block) => block.draw());
		});

		this.markers.forEach((element) => {
			if(!element.taken) {
				this.ctx.fillStyle = "#eb1555";
				this.ctx.beginPath();
				this.ctx.arc(element.x * this.blockWidth + this.blockWidth / 2, element.y * this.blockHeight + this.blockHeight / 2, this.blockWidth * 0.33, 0, Math.PI * 2);
				this.ctx.fill();
			}
		});
		

		this.player.draw(this.ctx);
	}

	step() {
		let oldBlock = this.currentBlock;
		let currentBlock = (this.currentBlock = this.chooseBlock());
		if (!currentBlock) {
			oldBlock.draw();
			this.finished = true;
			return;
		}
		currentBlock.occupied = true;
		if (!currentBlock.inHistory) {
			this.history.push(currentBlock);
			currentBlock.inHistory = true;
		}
		if (oldBlock) {
			if (!oldBlock.hasChild(currentBlock) && currentBlock.parent === undefined) {
				oldBlock.connectTo(currentBlock);
			}
			oldBlock.draw();
		}
		currentBlock.draw();
	}

	chooseBlock() {
		if (this.currentBlock) {
			let n = this.currentBlock.randomAvailableNeighbor();
			if (n) {
				return n;
			} else {
				let b = this.history.pop();
				b && (b.inHistory = false);
				b = this.history.pop();
				b && (b.inHistory = false);
				return b;
			}
		} else {
			let x = Math.floor(Math.random() * this.hBlocks);
			let y = Math.floor(Math.random() * this.vBlocks);
			return this.blocks[y][x];
		}
	}
}
//Maze definition ends here

//Block definition starts here
class Block {
	constructor(maze, x, y) {
		this.x = x;
		this.y = y;
		this.width = maze.blockWidth;
		this.height = maze.blockHeight;
		this.maze = maze;
		this.markerSize = [this.width, this.height].sort(function (a, b) {
			return a - b;
		})[0];
		this.occupied = false;
		this.ctx = maze.ctx;
		this.parent = undefined;
		this.children = [];
	}

	hasChild(other) {
		return this.children.lastIndexOf(other) > -1;
	}

	randomAvailableNeighbor() {
		this.availableNeighbors = function () {
			this.neighbors = function () {
				if (this._neighbors) {
					return this._neighbors;
				}

				this._neighbors = [];
				if (this.x > 0) this._neighbors.push(this.neighbor(-1, 0));
				if (this.x < this.maze.hBlocks - 1) this._neighbors.push(this.neighbor(1, 0));
				if (this.y > 0) this._neighbors.push(this.neighbor(0, -1));
				if (this.y < this.maze.vBlocks - 1) this._neighbors.push(this.neighbor(0, 1));
				return this._neighbors;
			};

			let neighbors = this.neighbors();
			return neighbors.filter(function (n) {
				return !n.occupied;
			});
		};
		let neighbors = this.availableNeighbors();
		return neighbors[Math.floor(Math.random() * neighbors.length)];
	}

	neighbor(relX, relY) {
		let x = this.x + relX;
		let y = this.y + relY;
		if (x >= 0 && x < this.maze.hBlocks && y >= 0 && y < this.maze.vBlocks) {
			return this.maze.blocks[y][x];
		}
	}

	connectTo(other) {
		this.children.push(other);
		other.parent = this;
	}

	connectedTo(other) {
		if (other) return this.parent === other || this.hasChild(other);
		else return false;
	}

	draw() {
		this.ctx.fillStyle = "#1d1e33";
		this.ctx.fillRect(this.x * this.width, this.y * this.height, this.width, this.height);

		//If the cell is not connected to the top one then draw a top wall.
		if (!this.connectedTo(this.neighbor(0, -1))) {
			this.drawWall(this.x * this.width, this.y * this.height, (this.x + 1) * this.width, this.y * this.height);
		}
		 //If the cell is not connected to the bottom one then draw a bottom wall.
		if (!this.connectedTo(this.neighbor(0, 1))) {
			this.drawWall(this.x * this.width, (this.y + 1) * this.height, (this.x + 1) * this.width, (this.y + 1) * this.height);
		}
		 //If the cell is not connected to the left one then draw a left wall.
		if (this.occupied && !this.connectedTo(this.neighbor(-1, 0))) {
			this.drawWall(this.x * this.width, this.y * this.height, this.x * this.width, (this.y + 1) * this.height );
		}
		//If the current cell is not connected to the right one then draw a right wall.
		if (!this.connectedTo(this.neighbor(1, 0))) {
			this.drawWall((this.x + 1) * this.width, this.y * this.height, (this.x + 1) * this.width, (this.y + 1) * this.height);
		}
		//If the pink dot starts to backtrack remove the gray dots it passes over.
		if (this.inHistory) {
			this.ctx.fillStyle = (this.maze.currentBlock === this) ? "#eb1555" : "#5E5B6A";
			this.ctx.beginPath();
			this.ctx.arc(this.x * this.width + this.width / 2, this.y * this.height + this.height / 2, this.markerSize * 0.33,
						 0, Math.PI * 2, false );
			this.ctx.fill();
		}
	}

	//Simple draw wall function receiving 2d parameters.
	drawWall(x1, y1, x2, y2) {
		this.ctx.strokeStyle = "white";
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.closePath();
		this.ctx.stroke();
	}
}
//Block definition ends here
