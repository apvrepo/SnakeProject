
/**********************************************************************************
* Name             LWCArcade
* Author          Andres Pereyra
* Date            26/08/24
* Description     This is a Parent LWC responsable for rendering a similar cellphone game called Snake 2 on a Salesforce page. 
                   It implements wire services with an Apex Class called 'UserWireClass'. It also uses conditional 
                   load templates and imperatively renders the child LWC and child components depending on the circunstance.
                   *** Credits: 
                   Original Game: Snake II™ - ©1998 NOKIA CORPORATION - Developer: Taneli Armanto.
                   Game Sounds Source: PAC-MAN™ & ©1980 BANDAI NAMCO Entertainment Inc.
                   Cellphone Image: NOKIA 1100 - NOKIA CORPORATION.
***********************************************************************************
* MODIFICATION LOG
* Version            Developer          Date               Description
* ------------------------------------------------------------------------------
* 1.0                Andres Pereyra     26 August 2024           Initial Creation 
* *********************************************************************************/

import { LightningElement, track, wire, api } from 'lwc';
import dot from "@salesforce/resourceUrl/dot";
import snakeLogo from "@salesforce/resourceUrl/snakeLogo";
import cellFrame from "@salesforce/resourceUrl/cellFrame";
import gameOverLogo from "@salesforce/resourceUrl/gameOverLogo";
import eaten from "@salesforce/resourceUrl/eaten";
import intro from "@salesforce/resourceUrl/intro";
import Id from "@salesforce/user/Id";
import updateUsers from "@salesforce/apex/UserWireClass.updateUsers";

export default class LWCArcade extends LightningElement {

    dotSound = new Audio(dot);
    loseSound = new Audio(eaten);
    introSound = new Audio(intro);
    snakeLogo = snakeLogo;
    cellFrame = cellFrame;
    gameOverLogo = gameOverLogo;

    @track individualUser;
    @api userId = Id;
    @track hasRendered = false;
    @track score = 0;
    @track snake = [{ x: 5, y: 5 }];
    @track direction = { x: 0, y: 0 };
    @track food = { x: 10, y: 10 };
    @track canvas;
    @track ctx;
    @track blockSize = 15;  // Smaller block size to simulate pixelated look
    @track speed = 150;     // Slightly faster to match the Nokia 1100 game
    @track gameInterval;

    // WIRE SERVICES
    async handleUpdate() {
        try {
            this.individualUser = await updateUsers({ id: this.userId, gameScore: this.score });
            this.error = undefined;
            this.template.querySelector("c-l-w-c-arcade-child").setMessage(true);
          console.log('PARENT - handleUpdate(): ');
        } catch (error) {
            this.error = error;
            this.individualUser = undefined;
            console.log('Error - handleUpdate(): ' + error);
        }
    }

    // LIFECYCLE HOOKS:
    connectedCallback() {
        //  console.log('FLAG01 - connectedCallback()');
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        this.loaded = true;
    }
    renderedCallback() {
        this.template.querySelector("c-l-w-c-arcade-child").setMessage(true);
        if (!this.canvas && this.hasRendered == false) {
            //   console.log('FLAG02 - renderedCallback()');
            this.canvas = this.template.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 500;  // Smaller canvas size to match the Nokia 1100 screen
            this.canvas.height = 310;
            this.hasRendered = true;
            this.template.querySelector(".game-canvas").style = "display:none";
            this.template.querySelector(".score").style = "display:none";
            this.template.querySelector(".snakeImg").style = "display:block";
            this.template.querySelector(".gameOver").style = "display:none";
        }
    }

    //GAME METHODS
    startGame() {
        //  console.log('FLAG03 - startGame()');
        this.resetGame();
        this.introSound.play();
        this.gameInterval = setInterval(this.updateGame.bind(this), this.speed);
    }

    resetGame() {
        //  console.log('FLAG04 - resetGame()');
        clearInterval(this.gameInterval);
        this.score = 0;
        this.snake = [{ x: 5, y: 5 }];
        this.direction = { x: 0, y: 0 };
        this.food = this.getRandomPosition();
        this.template.querySelector(".snakeImg").style = "display:none";
        this.template.querySelector(".gameOver").style = "display:none";
        this.template.querySelector(".game-canvas").style = "display:block";
        this.template.querySelector(".score").style = "display:block";
    }

    updateGame() {
        //  console.log('FLAG05 - updateGame()');
        this.moveSnake();
        if (this.checkCollision()) {
            // alert('Game Over!');
            clearInterval(this.gameInterval);
            this.handleUpdate();
            this.loseSound.play();
            this.template.querySelector("c-l-w-c-arcade-child").setMessage(false);
            this.template.querySelector(".snakeImg").style = "display:none";
            this.template.querySelector(".game-canvas").style = "display:none";
            this.template.querySelector(".score").style = "display:none";
            this.template.querySelector(".gameOver").style = "display:block";
        } else {
            if (this.snakeEatsFood()) {
                this.score++;
                this.dotSound.play();
                this.snake.push({ ...this.snake[this.snake.length - 1] });
                this.food = this.getRandomPosition();
            }
            this.drawGame();
        }
    }

    moveSnake() {
        //  console.log('FLAG06 - moveSnake()');
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        this.snake.unshift(head);
        this.snake.pop();
    }

    checkCollision() {
        //  console.log('FLAG07 - checkCollision()');
        const head = this.snake[0];
        if (head.x < 0 || head.y < 0 || head.x >= this.canvas.width / this.blockSize || head.y >= this.canvas.height / this.blockSize) {
            return true;
        }
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        return false;
    }

    snakeEatsFood() {
        //   console.log('FLAG08 - snakeEatsFood()');
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }

    drawGame() {
        // console.log('FLAG09 - drawGame()');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSnake();
        this.drawFood();
    }

    drawSnake() {
        //   console.log('FLAG10 - drawSnake()');
        this.ctx.fillStyle = '#000';  // Black color to simulate monochrome display
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x * this.blockSize, segment.y * this.blockSize, this.blockSize, this.blockSize);
        });
    }

    drawFood() {
        //   console.log('FLAG11 - drawFood()');
        this.ctx.fillStyle = '#6B6874';  // Grey color to simulate monochrome display
        this.ctx.fillRect(this.food.x * this.blockSize, this.food.y * this.blockSize, this.blockSize, this.blockSize);
    }

    getRandomPosition() {
        //   console.log('FLAG12 - getRandomPosition()');
        const x = Math.floor(Math.random() * (this.canvas.width / this.blockSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.blockSize));
        return { x, y };
    }

    handleKeydown(event) {
        //    console.log('FLAG13 - handleKeydown()');
        switch (event.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.direction = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.direction = { x: 1, y: 0 };
                }
                break;
        }
    }
}





