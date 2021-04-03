function Engine() {
  //size:how many 'blocks' wide and tall the canvas is. step: how large individual 'blocks are'//
  let gameStates = {
    playing: "playing",
    dead: "dead"
  };

  let state = gameStates.playing;

  let size = 20;
  let step = 20;
  let total = 0;
  let gameColors = {
    heading: "#32746D",
    canvasBackground: "#141414",
    death: "#910023",
    snake: "#00916E",
    apple: "#EEC643",
    font: "#141414",
    background: "#141414",
    divBackground: "#EEF0F2"
  };
  let pressed = false;
  //speed game will run
  const frameRate = 10;

  const percent = 0.7;
  const percentHeight = 1;
  //adjusts size and step to fit the
  if (window.innerWidth > window.innerHeight) {
    step = Math.floor((window.innerHeight * percent) / size);
  } else {
    step = Math.floor((window.innerWidth * percent) / size);
  }
  //DOM elements
  document.body.style.background = gameColors.background;

  const gameContainer = document.createElement("div");

  document.body.appendChild(gameContainer);

  const container = document.createElement("div");
  let maxWidth = size * step;
  container.style.background = gameColors.divBackground;
  container.style.display = "block";
  container.style.marginLeft = "auto";
  container.style.marginRight = "auto";
  container.style.width = (maxWidth *1.1).toString() + "px";
  container.style.height = (maxWidth + step + step).toString() + "px";

  container.style.maxWidth = (percent * 100).toString() + "%";
  container.style.maxHeight = (percent * 100).toString() + "%";
  container.style.border = `${step}px solid #EEF0F2`;
  gameContainer.appendChild(container);

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.marginLeft = "auto";
  canvas.style.marginRight = "auto";

  const score = document.createElement("h1");
  score.style.fontSize = "3vh";
  score.style.display = "block";
  score.style.fontFamily = "Courier New";
  score.style.color = gameColors.font;
  score.style.textAlign = "left";
  score.style.marginLeft = "auto";
  score.style.marginRight = "auto";
  const ctx = canvas.getContext("2d");

  //creates game objects
  let gameCanvas = new Canvas();
  let gameSnake = new Snake();
  let gameApple = new Apple();

  //game initilization function
  function init() {
    state = gameStates.playing;
    canvas.width = canvas.height = size * step;
    score.textContent = `Score: ${total}`;
    canvas.focus();
    container.appendChild(canvas);
    container.appendChild(score);
    gameCanvas.draw();
    gameSnake.init();
    gameSnake.draw();
    gameApple.check();
    gameApple.draw();
  }

  //randomness function for game objects
  function randomIntFromRange(max, min) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

  function Canvas() {
    this.draw = function () {
      ctx.fillStyle = gameColors.canvasBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
  }

  //Snake object
  function Snake(pos) {
    //snake 'segment' storage
    this.snake = [];
    this.color = gameColors.snake;
    //total number of initial segments
    this.tail = 3;

    //px border for snake render
    const border = 1;

    //picks random starting position without overflowing of the game space
    this.pos = {
      x: randomIntFromRange(size - this.tail, this.tail) * step,
      y: randomIntFromRange(size - this.tail, this.tail) * step
    };
    //horizontal and vertical velocity 'delta X' and 'delta Y'
    this.dX;
    this.dY;

    //how many apples this hungry snake as consumed
    this.eaten = 0;

    //snake initialization ,
    this.init = function () {
      //creates random velocity
      this.dX = randomIntFromRange(1, -1);
      if (this.dX === 0) {
        let value = randomIntFromRange(1, -1);
        this.dY = value;
        while (value === 0) {
          this.dY = value = randomIntFromRange(1, -1);
        }
      } else {
        this.dY = 0;
      }
      //orients , creates and stores segments within snake
      for (let i = 0; i < this.tail; i++) {
        this.snake.push({
          x: this.pos.x + i * -this.dX * step,
          y: this.pos.y + i * -this.dY * step
        });
      }

      //moves the snake on screen
      this.move = function () {
        //moves one step in the direction of current velocity
        this.pos = {
          x: this.pos.x + this.dX * step,
          y: this.pos.y + this.dY * step
        };

        // wraps to opposite side if it goes out of bounds
        if (this.pos.x >= canvas.width) {
          this.pos.x = 0;
        }
        if (this.pos.x < 0) {
          this.pos.x = canvas.width - step;
        }
        if (this.pos.y >= canvas.height) {
          this.pos.y = 0;
        }
        if (this.pos.y < 0) {
          this.pos.y = canvas.height - step;
        }
        //stores new positions
        this.snake.unshift(this.pos);
        this.snake.pop();
      };
    };

    //draws the snake on screen
    this.draw = function () {
      for (cell of this.snake) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
          cell.x + border,
          cell.y - border,
          step - border,
          step - border
        );
      }
    };

    //collision detection for apples and the snake
    this.eat = function () {
      //grow one segment if apple is eaten and update scorboard and create a new apple
      let count = false;
      if (this.pos.x == gameApple.pos.x && this.pos.y == gameApple.pos.y) {
        this.pos = {
          x: this.pos.x + this.dX * step,
          y: this.pos.y + this.dY * step
        };
        this.snake.unshift(this.pos);
        this.eaten++;
        total = this.eaten;
        score.textContent = `Score: ${this.eaten}`;
        gameApple = new Apple();
        gameApple.check();
      }

      //if snake eats itself start a new game
      //it tests all indexs of snake including [0] or the 'head'
      for (cell of this.snake) {
        if (this.snake[0].x == cell.x && this.snake[0].y == cell.y) {
          if (count) {
            state = gameStates.dead;
          }
          count = true;
        }
      }
    };
    this.last;
    this.dead = function () {
      this.color =
        this.color === gameColors.snake ? gameColors.death : gameColors.snake;
      console.log(this.snake);
      if (this.snake.length !== 0) {
        this.last = this.snake.shift();
      } else {
        console.log(this.last);
        /*   this.snake = [
          { x: this.last.x + step, y: this.last.y },
          { x: this.last.x - step, y: this.last.y },
          { x: this.last.x, y: this.last.y + step },
          { x: this.last.x, y: this.last.y - step }
        ];
        console.log(this.snake); */
        gameCanvas.draw();
        gameSnake.draw();
        gameApple.draw();
        gameApple = new Apple();
        gameSnake = new Snake({
          x: canvas.width / 2,
          y: canvas.width / 2
        });
        init();
      }
    };
  }
  //apple game object
  function Apple() {
    //picks random location and verifies its not ontop of the snake
    this.check = function () {
      let noMatches = false;
      //prevent the apple from being spawned out of bounds
      let appleSize = 1;
      this.pos = {
        x: randomIntFromRange(size - appleSize, 0) * step,
        y: randomIntFromRange(size - appleSize, 0) * step
      };

      //verify apple did not spawn ontop of snake
      while (!noMatches) {
        let checkedAll = true;

        //check all snake segments if apple is on top of segment pick again an reverfiy no collision occu

        for (cell of gameSnake.snake) {
          if (this.pos.x === cell.x && this.pos.y === cell.y) {
            console.log("match");
            this.pos = {
              x: randomIntFromRange(size - appleSize, 0) * step,
              y: randomIntFromRange(size - appleSize, 0) * step
            };
            checkedAll = false;
            noMatches = false;
            break;
          }
          if (checkedAll) {
            noMatches = true;
          }
        }
      }
    };

    //draw these red squares
    this.draw = function () {
      ctx.fillStyle = gameColors.apple;
      ctx.fillRect(this.pos.x + 1, this.pos.y - 1, step - 1, step - 1);
    };
  }

  //arrow key event listener, changes snake velocity on input
  document.addEventListener("keydown", function (event) {
    if (!pressed) {
      pressed = true;
      const pos = gameSnake.snake[0];
      switch (event.keyCode) {
        case 37:
          if (gameSnake.dX !== 1) {
            gameSnake.dX = -1;
            gameSnake.dY = 0;
          }
          break;
        case 38:
          if (gameSnake.dY !== 1) {
            gameSnake.dX = 0;
            gameSnake.dY = -1;
          }

          break;
        case 39:
          if (gameSnake.dX !== -1) {
            gameSnake.dX = 1;
            gameSnake.dY = 0;
          }
          break;
        case 40:
          if (gameSnake.dY !== -1) {
            gameSnake.dX = 0;
            gameSnake.dY = 1;
          }
          break;
        case 65:
          if (gameSnake.dX !== 1) {
            gameSnake.dX = -1;
            gameSnake.dY = 0;
          }
          break;
        case 87:
          if (gameSnake.dY !== 1) {
            gameSnake.dX = 0;
            gameSnake.dY = -1;
          }

          break;
        case 68:
          if (gameSnake.dX !== -1) {
            gameSnake.dX = 1;
            gameSnake.dY = 0;
          }
          break;
        case 83:
          if (gameSnake.dY !== -1) {
            gameSnake.dX = 0;
            gameSnake.dY = 1;
          }
          break;
      }
    }
  });

  //touch controls
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);

  let xDown = null;
  let yDown = null;

  function getTouches(event) {
    return event.touches;
  }

  function handleTouchStart(event) {
    const firstTouch = getTouches(event)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(event) {
    if (!xDown || !yDown) {
      return;
    }

    let xUp = event.touches[0].clientX;
    let yUp = event.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      //most significant
      if (xDiff > 0) {
        if (gameSnake.dX !== 1) {
          gameSnake.dX = -1;
          gameSnake.dY = 0;
        }
      } else {
        if (gameSnake.dX !== -1) {
          gameSnake.dX = 1;
          gameSnake.dY = 0;
        }
      }
    } else {
      if (yDiff > 0) {
        if (gameSnake.dY !== 1) {
          gameSnake.dX = 0;
          gameSnake.dY = -1;
        }
      } else {
        if (gameSnake.dY !== -1) {
          gameSnake.dX = 0;
          gameSnake.dY = 1;
        }
      }
    }
    // reset values //
    xDown = null;
    yDown = null;
  }

  //game initializtion
  init();

  //gameloop
  let time = new Date();
  let timeMilli = time.getMilliseconds();

  function gameLoop() {
    if (state === gameStates.playing) {
      gameCanvas.draw();
      gameSnake.move(gameSnake.dir);
      gameSnake.eat();
      gameSnake.draw();
      gameApple.draw();
      pressed = false;
    } else if (state === gameStates.dead) {
      gameCanvas.draw();
      gameSnake.dead();
      gameSnake.draw();
      gameApple.draw();
      pressed = false;
    }
  }
  setInterval(gameLoop, 1000 / frameRate);
}

//starts the entire program
Engine();
