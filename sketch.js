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

var openSet = [],
   closedSet = [],
   endNode = [],
   startNode = [];

function Square(xparam, yparam, squareSize) {
   this.f = 0;
   this.g = 0;
   this.h = 0;
   this.neighbourhood = [];
   this.cameFrom = undefined;

   this.x = xparam;
   this.y = yparam;
   this.posX = this.x * squareSize;
   this.posY = this.y * squareSize;
   this.xCenter = this.posX + squareSize / 2;
   this.yCenter = this.posY + squareSize / 2;
   this.size = squareSize;
   this.color = color(135, 174, 211);
   this.state = 2;

   this.display = function () {
      strokeWeight(1);
      stroke(0, 0, 0);
      fill(this.color);
      rect(this.posX, this.posY, this.size, this.size);
   };
   this.vizinhos = function (squares) {
      if (this.x - 1 > -1) {
         this.neighbourhood.push(squares[(this.x - 1) * MATRIX_SIZE + this.y]);
      }
      if (this.x + 1 < MATRIX_SIZE) {
         this.neighbourhood.push(squares[(this.x + 1) * MATRIX_SIZE + this.y]);
      }
      if (this.y - 1 > -1) {
         this.neighbourhood.push(squares[this.x * MATRIX_SIZE + (this.y - 1)]);
      }
      if (this.y + 1 < MATRIX_SIZE) {
         this.neighbourhood.push(squares[this.x * MATRIX_SIZE + (this.y + 1)]);
      }
   };
   this.click = function (newState, parent) {
      let dX = int(dist(mouseX, 0, this.xCenter, 0));
      let dY = int(dist(0, mouseY, 0, this.yCenter));

      if (abs(dX) < this.size / 2 && abs(dY) < this.size / 2) {
         if (newState === 0) {
            //Colocando pedras
            this.color = color(102, 102, 102);
         } else if (newState === 1) {
            //colocando ouro e diminuindo a contagem do pai
            parent.goldCount -= 1;
            this.color = color(242, 185, 36);
         } else if (newState === 2) {
            //desfazendo mudanças e restaurando os elementos na contagem do pai
            if (this.state == 3) {
               parent.shipCount += 1;
            } else if (this.state == 1) {
               parent.goldCount += 1;
            }
            this.color = color(135, 174, 211);
         } else {
            //colocando navio e diminuindo contagem do pai
            parent.shipCount -= 1;
            this.color = color("#FF2B27");
         }

         this.state = newState;
      }
   };
}

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
         squares.push(new Square(x, y, SQUARE_SIZE));
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

function heuristic(nodeA, nodeB) {
   let dx = abs(nodeA.x - nodeB.x);
   let dy = abs(nodeA.y - nodeB.y);
   //Retorna a distância euclidiana dos nós
   return sqrt(pow(dx, 2) + pow(dy, 2));
}

function recurPath(node) {
   let temp = node;
   while (temp.cameFrom != undefined) {
      if (!endNode.includes(temp)) {
         temp.color = color(0, 0, 255);
         temp.display();
      }

      temp = temp.cameFrom;
   }
}

function draw() {
   background(0);
   //Desenha o grid
   drawGrid();
   if (state == 0) {
      //Estado 0, editando;
      updateShipLabel();
      updateGoldLabel();
   } else if (state == 1) {
      //Estado 1, setando o openset a partir da posição do navio.
      openSet.push(...squares.filter((item) => item.state == 3));
      endNode.push(squares.filter((item) => item.state == 1)[0]); // pegando apenas um dos tesouros
      startNode.push(...squares.filter((item) => item.state == 3));
      for (let i = 0; i < squares.length; i++) {
         squares[i].vizinhos(squares);
      }
      console.log("openSet: ", openSet, openSet[0].x, openSet[0].y);
      //Passa automaticamente pra o estado 2;
      state += 1;
   } else if (state == 2) {
      console.log("Iterando...");
      //Roda o algorítmo
      //Caso meu openset não seja vazio
      if (openSet.length > 0) {
         //Seta o melhor lugar arbitráriamente
         var winner = 0;
         //Procura para ver a melhor escolha
         console.log("Competidores: ", openSet);
         for (var i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) {
               winner = i;
            }
         }

         let current = openSet[winner];
         console.log("Escolhido: ", openSet[winner]);

         if (current.state == 1) {
            squares = squares.map((item) => {
               if (item.x == current.x && item.y == current.y) {
                  item.color = color(0, 255, 0);
                  return item;
               }
               return item;
            });
            recurPath(current);
            state = 0;
         } else {
            openSet = openSet.filter(
               (item) => item.x != current.x || item.y != current.y
            );
            closedSet.push(current);

            var neighbourhood = current.neighbourhood;

            for (var i = 0; i < neighbourhood.length; i++) {
               var neighbor = neighbourhood[i];
               if (neighbor.state != 0) {
                  if (!closedSet.includes(neighbor)) {
                     var tempG = current.g + 1;

                     if (openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                           neighbor.g = tempG;
                        }
                     } else {
                        console.log("Não está ainda");
                        neighbor.g = tempG;
                        openSet.push(neighbor);
                     }

                     neighbor.h = heuristic(neighbor, endNode[0]);
                     neighbor.f = neighbor.g + neighbor.h;
                     neighbor.cameFrom = current;
                  }
               }
            }
            //Change color as we iterate to track
            squares = squares.map((item) => {
               if (
                  openSet.includes(item) &&
                  !startNode.includes(item) &&
                  item.state != 0
               ) {
                  item.color = color("#FF748C");
                  return item;
               }
               if (
                  closedSet.includes(item) &&
                  !startNode.includes(item) &&
                  item.state != 0
               ) {
                  item.color = color("#F4CCFF");
                  return item;
               }
               return item;
            });
         }
      } else {
         state = 0;
         console.log("Algorítmo acabou!");
      }
   }
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
