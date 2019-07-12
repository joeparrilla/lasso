import { constants } from '../constants.js'

export class PlayGame extends Phaser.Scene {
    constructor() { super('PlayGame'); }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('enemy', 'assets/sprites/enemy.png');
        this.load.image('enemyRoped', 'assets/sprites/enemyRoped.png');
        this.load.image('rope', 'assets/sprites/rope.png');
    }

    create() {

        this.playerDirection = 'up'
        this.enemiesHeld = 0;
        this.maxEnemiesHeld = 2;

        //text
        this.heldText = this.add.text(16, 16, `held: ${this.enemiesHeld}`, { fontSize: '32px', fill: '#FFF' });

        let cursors = this.input.keyboard.createCursorKeys(),
            player  = this.physics.add.sprite(game.canvas.width / 2, game.canvas.height / 2, 'player'),
            objects = [player];

        for (let key in objects) {
            objects[key].setCollideWorldBounds(true);
        }

        this.cursors = cursors;
        this.player  = player;
        this.rope = this.physics.add.sprite(this.player.x, this.player.y, 'rope').setActive(false).setVisible(false);
        this.rope.body.setEnable(false);

        this.enemies = this.physics.add.group({
            key: 'enemy',
            repeat: 20,
            setXY: { x: Math.random() * 400, y:  Math.random() * 400, stepX: 45 }
        });

        this.enemies.children.iterate((enemy) => {
            enemy.setCollideWorldBounds(true);
            enemy.setImmovable(true);
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.rope.active = true;
            this.rope.visible = true;
            this.rope.body.enable = true;
            this.time.delayedCall(300, () => { 
                this.rope.active = false;
                this.rope.visible = false;
                this.rope.body.enable = false;
            }, [], this)
        });

        this.input.keyboard.on('keydown-D', () => {
            if (this.enemiesHeld > 0) {
                this.enemiesHeld--;
                this.physics.add.sprite(this.player.x + 16, this.player.y + 16, 'enemyRoped');
                this.heldText.setText(`held: ${this.enemiesHeld}`);
            }
        });

        this.physics.add.collider(this.enemies, this.player);

        this.physics.add.overlap(this.rope, this.enemies, (rope, enemy) => {
            if (this.enemiesHeld < this.maxEnemiesHeld) {
                enemy.visible = false;
                enemy.active = false;
                enemy.body.enable = false;
                this.enemiesHeld++;
                this.heldText.setText(`held: ${this.enemiesHeld}`);
            }
        }, null, this);


        
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-constants.playerSpeed);
            this.playerDirection = 'left';
            this.rope.setPosition(this.player.x - 40, this.player.y);
            this.rope.setAngle(0);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(constants.playerSpeed);
            this.playerDirection = 'right';
            this.rope.setPosition(this.player.x + 40, this.player.y);
            this.rope.setAngle(0);
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-constants.playerSpeed);
            this.playerDirection = 'up';
            this.rope.setPosition(this.player.x, this.player.y - 40);
            this.rope.setAngle(90);
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(constants.playerSpeed);
            this.playerDirection = 'down';
            this.rope.setPosition(this.player.x, this.player.y + 40);
            this.rope.setAngle(90);
        }
        else {
            this.player.setVelocity(0, 0);
        }
    }

    checkGameOver() {

    }

};