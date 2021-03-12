const SQUARE_SIZE = 18;
const MATRIX_SIZE = 52;
const FRAME_RATIO = 24;

var squares = [], //Armazena os nós do algorítmo
   state, //Armazena o estado usado pra poder fazer a gamificação edição e etd;
   shipCount, //Armazena a quantidade de navios disponíveis
   goldCount, //Armazena a quantidade de ouro/tesouros disponíveis
   editingObj, //Armazena qual objeto está sendo colocado ao clicar
   editButton, //
   playButton, //
   eraseButton, //
   shipButton, //
   stateLabel, // Todos esses são apenas criação de elementos de
   shipLabel, // texto e botões para poder editar e começar o
   goldLabel, // algorítmo.
   rockButton, //
   goldButton,
   method = "A*"; //

var openSet = [], //Armazena os nós que estão sendo visitados(A*)
   closedSet = [], //Armazena os nós que já foram visitados (A*)
   endNode = [], //Armazena o nó final
   startNode = []; //Armazena o nó inicial

function Square(xparam, yparam, squareSize) {
   //Descrição do objeto quadrado, usado para montar o grid e rodar o algorítmo
   this.f = 0; // Parâmetros usados para calcular o A *
   this.g = 0; //     f = g + h [custo_total = custo_padrão + custo_heurístico]
   this.h = 0; //  lembrando que o custo heurístico é só uma "aproximação" do custo de um dado nó até a chegada
   this.neighbourhood = []; //Array que vai guardar todos os vizinhos de um dado quadrado na matriz
   this.cameFrom = undefined; //Array que vai guardar qual nó que colocou o nó atual no openset (usado para pintar o caminho)

   this.x = xparam; //x do quadrado na matriz
   this.y = yparam; //y do quadrado na matriz
   this.posX = this.x * squareSize; //posição do quadrado baseada no X
   this.posY = this.y * squareSize; //posição do quadrado baseada no Y
   this.xCenter = this.posX + squareSize / 2; //Coordenada x do centro do quadrado (usada para calcular o click)
   this.yCenter = this.posY + squareSize / 2; //Coordenada y do centro do quadrado (usada para calcular o click)
   this.size = squareSize; //Tamanho do quadrado
   this.color = color(135, 174, 211); //Cor inicial
   this.state = 2; //estado inicial (0 = pedra, 1 = tesouro, 2 = água, 3 = navio)

   this.display = function () {
      //Função display apenas exibe o quadrado no canvas criado em setup()
      strokeWeight(1);
      stroke(0, 0, 0);
      fill(this.color);
      rect(this.posX, this.posY, this.size, this.size);
   };
   this.vizinhos = function (squares) {
      //Essa função cria os vizinhos de um dado quadrado (lembrando que tudo isso são referências);
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
      /*
         Função que verifica se o click foi no quadrado
         recebe um state equivalente ao editObj, isto é, o state do elemento square
         apenas diz qual tipo de quadrado ele é. o state da aplicação diz qual a fase
         de execução atual.
      */
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

/*
   FUNÇÕES DE CRIAÇÃO DE ELEMENTOS HTML (BOTÕES E LABELS)
*/

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
   playButton = createButton("Começar");
   playButton.style("font-size", "50px");
   playButton.position(1000, 400);
   playButton.mousePressed(() => {
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
   goldButton = createButton("Colocar Ouro");
   goldButton.style("font-size", "20px");
   goldButton.position(1150, 215);
   goldButton.mousePressed(() => {
      state = 0;
      editingObj = 1;
      stateLabel.html("Editando: Colocando ouro!");
   });
}

function createEraseButton() {
   eraseButton = createButton("Desfazer");
   eraseButton.style("font-size", "20px");
   eraseButton.position(1150, 250);
   eraseButton.mousePressed(() => {
      state = 0;
      editingObj = 2;
      stateLabel.html("Editando: Desfazendo alterações");
   });
}

function createPutShipButton() {
   shipButton = createButton("Colocar Navio");
   shipButton.style("font-size", "20px");
   shipButton.position(1150, 300);
   shipButton.mousePressed(() => {
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
//A função setup roda uma vez no início do código/
function setup() {
   //Aqui eu ajusto o frameratio pra 24fps, se você não fizer isso ele pode acabar puxando um pouquinho a memória do seu PC kk;
   frameRate(24);
   //Aqui eu crio um elemento canvas, com o tamanho da matriz que eu vou desenhar;

   createCanvas(MATRIX_SIZE * SQUARE_SIZE, MATRIX_SIZE * SQUARE_SIZE);

   //Aqui eu tô populando o array squares com os elementos do tipo square que vão ser usados na simulação
   for (let x = 0; x < MATRIX_SIZE; x++) {
      for (let y = 0; y < MATRIX_SIZE; y++) {
         squares.push(new Square(x, y, SQUARE_SIZE));
      }
   }

   //Estado inicial = 0 (atualmente, 0 = edição, 1 = preparando A*, 2 = executando A*)
   state = 0;
   //Objeto inicial sendo colocado (0 = pedras, 1 = ouro, 2 = água, 3 = navio)
   editingObj = 0;

   //Setando os limites de ouro e de navios a serem colocados
   shipCount = 1;
   goldCount = 1;

   //Criando os elementos HTMl
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

/*
   Essas duas funções atualizam o valor de 
   ouro e navios disponíveis a cada iteração
*/

function updateShipLabel() {
   shipLabel.html(`Navios: ${shipCount}`);
}

function updateGoldLabel() {
   goldLabel.html(`Tesouros: ${goldCount}`);
}

/*
   Função heurística do A*, basicamente pega a distância euclidiana entre os nós;
*/
function heuristic(nodeA, nodeB) {
   let dx = abs(nodeA.x - nodeB.x);
   let dy = abs(nodeA.y - nodeB.y);
   //Retorna a distância euclidiana dos nós
   return dx + dy;
}

/*
   Percorre todos os nós que originaram o caminho, pintando eles de azul
*/
function printPath(node) {
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
   // Loop da aplicação
   background(0);
   //Desenha o grid
   drawGrid();
   if (state == 0) {
      //Estado 0, editando;

      //Atualizando a qtd de navios e tesouros disponíveis
      updateShipLabel();
      updateGoldLabel();
   } else if (state == 1) {
      /*
         Basicamente quando a pessoa aperta "Começar" o algorítmo vem pra cá e inicia
         quando tu adicionar os teus algorítmos tu pode fazer mais states e alguma variável
         pra dizer qual algorítmo vai executar tipo

         State - 1 : prepara A*
         State - 2 : Executa A*

         State - 3 : prepara DFS
         State - 4 : Executa DFS
      */
      //Estado 1, setando o openset a partir da posição do navio.
      openSet.push(...squares.filter((item) => item.state == 3));
      endNode.push(squares.filter((item) => item.state == 1)[0]); // pegando apenas um dos tesouros
      startNode.push(...squares.filter((item) => item.state == 3));

      //Setando os vizinhos dos nós;
      for (let i = 0; i < squares.length; i++) {
         squares[i].vizinhos(squares);
      }
      //Passa automaticamente pra o estado 2 (Execução de A*);
      state += 1;
   } else if (state == 2) {
      //Roda o algorítmo
      //Caso meu openset não seja vazio

      //Aqui basicamente é execução de A*. Precisando de explicação chama no zap

      /*
         é importante saber que ele roda o algorítmo atrás de 2 condições,

            1 - Ainda não encontrei o objetivo
            2 - Meu openset tem elementos

         Se alguma das duas não for verdade eu encerro o algorítmo e boto pra o state 0 de edição
      */
      switch(method){
         case "A*":
            callAEstrela();
            break;
         case "DFS":
            callDFS();
            break;
         case "BFS":
            callBFS();
            break;
         case "Greedy":
            callGreedy();
            break;
         default: 
            console.error("unknown method");
      }
      
   }
}

function callGreedy(){
   if (openSet.length > 0) {
      //Seta o melhor lugar arbitráriamente
      var winner = 0;
      //Procura para ver a melhor escolha
      for (var i = 0; i < openSet.length; i++) {
         if (openSet[i].f < openSet[winner].f) {
            winner = i;
         }
      }

      let current = openSet[winner];

      if (current.state == 1) {
         squares = squares.map((item) => {
            if (item.x == current.x && item.y == current.y) {
               item.color = color(0, 255, 0);
               return item;
            }
            return item;
         });
         printPath(current);
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
                  // var tempG = current.g + 1;

                  if (openSet.includes(neighbor)) {
                     // if (tempG < neighbor.g) {
                     //    neighbor.g = tempG;
                     // }
                  } else {
                     // neighbor.g = tempG;
                     openSet.push(neighbor);
                  }

                  neighbor.h = heuristic(neighbor, endNode[0]);
                  neighbor.f = neighbor.h;
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
   }
}

function callAEstrela(){
   if (openSet.length > 0) {
      //Seta o melhor lugar arbitráriamente
      var winner = 0;
      //Procura para ver a melhor escolha
      for (var i = 0; i < openSet.length; i++) {
         if (openSet[i].f < openSet[winner].f) {
            winner = i;
         }
      }

      let current = openSet[winner];

      if (current.state == 1) {
         squares = squares.map((item) => {
            if (item.x == current.x && item.y == current.y) {
               item.color = color(0, 255, 0);
               return item;
            }
            return item;
         });
         printPath(current);
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
   }
}

function callBFS(){
   if (openSet.length > 0) {
      //Seta o melhor lugar arbitráriamente
      // var winner = 0;
      // //Procura para ver a melhor escolha
      // for (var i = 0; i < openSet.length; i++) {
      //    if (openSet[i].f < openSet[winner].f) {
      //       winner = i;
      //    }
      // }

      let current = openSet[winner];

      if (current.state == 1) {
         squares = squares.map((item) => {
            if (item.x == current.x && item.y == current.y) {
               item.color = color(0, 255, 0);
               return item;
            }
            return item;
         });
         printPath(current);
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
   }
}


function drawGrid() {
   //Desenha cada quadrado do grid
   let sl = squares.length;
   for (var i = 0; i < sl; i++) {
      squares[i].display();
   }
}

function triggerSquareClick(newState) {
   //
   console.log();
   //
   let sl = squares.length;
   for (var i = 0; i < sl; i++) {
      squares[i].click(newState, this);
   }
}

function mouseDragged() {
   updateObjects();
   console.log("mouseDragging", mouseX, mouseY);
}

function mousePressed() {
   //Quando clicar no mouse, se estiver editando
   //Pega o editing object e chama o click do quadrado pra ele trocar
   updateObjects();
}

function updateObjects() {
   //Quando clicar no mouse, se estiver editando
   //Pega o editing object e chama o click do quadrado pra ele trocar
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
