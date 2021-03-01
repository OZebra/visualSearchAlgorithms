const SQUARE_SIZE = 18;
const MATRIX_SIZE = 50;
const FRAME_RATIO = 24;

var squares = [],
   state,
   shipCount,
   goldCount;

let editButton,
   playButton,
   stateLabel,
   shipLabel,
   goldLabel,
   editingObj,
   rockButton,
   goldButton;

function createEditButton() {
   editButton = createButton("Editar");
   editButton.style("font-size", "50px");
   editButton.position(1000, 200);
   editButton.mousePressed(() => {
      state = 0;
      if (editingObj == 0) {
         stateLabel.html("Editando: Colocando pedras...");
      } else {
         stateLabel.html("Editando: Colocando ouro!");
      }
   });
}

function createStartButton() {
   editButton = createButton("Começar");
   editButton.style("font-size", "50px");
   editButton.position(1000, 400);
   editButton.mousePressed(() => {
      state = 1;
      stateLabel.html("Procurando tesouros!");
   });
}

function createPutRockButton() {
   rockButton = createButton("Colocar Pedras");
   rockButton.style("font-size", "20px");
   rockButton.position(1150, 180);
   rockButton.mousePressed(() => {
      state = 0;
      editingObj = 0;
      stateLabel.html("Editando: Colocando pedras...");
   });
}

function createPutGoldButton() {
   rockButton = createButton("Colocar Ouro");
   rockButton.style("font-size", "20px");
   rockButton.position(1150, 215);
   rockButton.mousePressed(() => {
      state = 0;
      editingObj = 1;
      stateLabel.html("Editando: Colocando ouro!");
   });
}

function createEraseButton() {
   rockButton = createButton("Desfazer");
   rockButton.style("font-size", "20px");
   rockButton.position(1150, 250);
   rockButton.mousePressed(() => {
      state = 0;
      editingObj = 2;
      stateLabel.html("Editando: Desfazendo alterações");
   });
}

function createPutShipButton() {
   rockButton = createButton("Colocar Navio");
   rockButton.style("font-size", "20px");
   rockButton.position(1150, 300);
   rockButton.mousePressed(() => {
      state = 0;
      editingObj = 3;
      stateLabel.html("Editando: Posicionando Frota!");
   });
}

function createStateLabel() {
   stateLabel = createDiv(`Editando: Colocando pedras...`);
   stateLabel.style("font-size: 50px");
   stateLabel.position(1000, 500);
}

function createShipCountLabel() {
   shipLabel = createDiv(`Navios: ${shipCount}`);
   shipLabel.style("font-size: 30px");
   shipLabel.position(1000, 570);
}

function createGoldCountLabel() {
   goldLabel = createDiv(`Tesouros: ${goldCount}`);
   goldLabel.style("font-size: 30px");
   goldLabel.position(1000, 610);
}

function setup() {
   frameRate(FRAME_RATIO);
   createCanvas(MATRIX_SIZE * SQUARE_SIZE, MATRIX_SIZE * SQUARE_SIZE);

   for (let x = 0; x < MATRIX_SIZE; x++) {
      for (let y = 0; y < MATRIX_SIZE; y++) {
         squares.push(
            new Square(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE)
         );
      }
   }

   state = 0;
   editingObj = 0;

   shipCount = 1;
   goldCount = 3;

   createEditButton();
   createPutRockButton();
   createStartButton();
   createStateLabel();
   createPutGoldButton();
   createEraseButton();
   createPutShipButton();
   createShipCountLabel();
   createGoldCountLabel();
}

function updateShipLabel() {
   shipLabel.html(`Navios: ${shipCount}`);
}

function updateGoldLabel() {
   goldLabel.html(`Tesouros: ${goldCount}`);
}

function draw() {
   background(0);
   drawGrid();

   updateShipLabel();
   updateGoldLabel();
}

function drawGrid() {
   let sl = squares.length;
   for (var i = 0; i < sl; i++) {
      squares[i].display();
   }
}

function triggerSquareClick(newState) {
   let sl = squares.length;
   for (var i = 0; i < sl; i++) {
      squares[i].click(newState, this);
   }
}

function mousePressed() {
   if (state == 0) {
      if (editingObj == 0) {
         //Put rocks
         triggerSquareClick(0);
      } else if (editingObj == 1) {
         //Put Gold
         console.log("gold count: ", goldCount);
         if (goldCount > 0) triggerSquareClick(1);
      } else if (editingObj == 2) {
         //Erase / Undo
         triggerSquareClick(2);
      } else {
         //Put ship
         console.log("Ship count: ", shipCount);
         if (shipCount > 0) triggerSquareClick(3);
      }
   }
}
