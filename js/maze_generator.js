let columns, rows;
let w = 40;
let grid = [];
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");


function draw() {
  background();
  setup();
}

function background() {
  ctx.fillStyle = "#323232";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function setup() {
  colums = Math.floor(canvas.width / w);
  rows = Math.floor(canvas.width / w);

  //Make 100 Cell objects and let the program know where they are.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let cell = new Cell(x, y);
      grid.push(cell);
    }
  }

  for (let i = 0; i < grid.length; i++) {
    grid[i].show();
  }
}


function Cell(x, y) {
  //Column number
  this.x = x;
  //Row number
  this.y = y;

  this.show = function () {
    let x = this.i * w;
    let y = this.j * w;
    ctx.rect(x, y, w, w);
    ctx.stroke();
  };
}


draw();


