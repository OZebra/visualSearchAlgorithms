function Square(posX, posY, squareSize) {
   this.x = posX;
   this.y = posY;
   this.xCenter = posX + squareSize / 2;
   this.yCenter = posY + squareSize / 2;
   this.size = squareSize;
   this.color = color(135, 174, 211);
   this.state = 0;

   this.display = function () {
      strokeWeight(1);
      stroke(0, 0, 0);
      fill(this.color);
      rect(this.x, this.y, this.size, this.size);
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
            this.color = color(200, 0, 0);
         }

         this.state = newState;
      }
   };
}
