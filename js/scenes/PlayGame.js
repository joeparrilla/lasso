import { constants } from '../constants.js'

export class PlayGame extends Phaser.Scene {
    constructor() { super('PlayGame'); }

    preload() {
        this.load.spritesheet('player', 'assets/sprites/cowboy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('enemy', 'assets/sprites/cows.png', { frameWidth: 24, frameHeight: 24 });
        this.load.image('enemyRoped', 'assets/sprites/enemyRoped.png');
        this.load.image('rope', 'assets/sprites/rope.png');
    }

    create() {

        this.playerDirection = 'up'
        this.maxEnemiesHeld  = 2;
        this.enemiesHeld     = [];

        //text
        this.heldText = this.add.text(16, 16, `held: ${this.enemiesHeld.length}`, { fontSize: '32px', fill: '#FFF' });
        this.timeRemainingText = this.add.text(300, 16, `Time:`, { fontSize: '32px', fill: '#FFF' });

        let cursors = this.input.keyboard.createCursorKeys(),
            player  = this.physics.add.sprite(game.canvas.width / 2, game.canvas.height / 2, 'player'),
            objects = [player];

        for (let key in objects) {
            objects[key].setCollideWorldBounds(true);
        }

        //PLAYER ANIMS
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });


        //COW ANIMS
        this.anims.create({
            key: 'cowLeft',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'cowDown',
            frames: this.anims.generateFrameNumbers('enemy', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'cowUp',
            frames: this.anims.generateFrameNumbers('enemy', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'cowRight',
            frames: this.anims.generateFrameNumbers('enemy', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = cursors;
        this.player  = player;
        this.rope    = this.physics.add.sprite(this.player.x, this.player.y, 'rope').setActive(false).setVisible(false);
        this.rope.body.setEnable(false);

        this.enemies = this.physics.add.group({
            key               : 'enemy',
            repeat            : 6,
            collideWorldBounds: true,
            immovable         : true
        });

        this.enemies.children.iterate((child) => {
            child.setData({ roped: false, dropped: false, ropedTimer: this.time.addEvent({delay: 10000, callback: this.ropeTimeout, args: [child], callbackScope: this, paused: true}) });
            child.setPosition(Math.floor(Math.random() * 401), Math.floor(Math.random() * 401));
        })

        //a default state in case the player uses the rope before making any movements. Once the player moves at least once, this is not needed
        this.rope.setPosition(this.player.x, this.player.y - 40);
        this.rope.setAngle(90);

        /* 
         * On Space press, we activate the rope sprite and then begin a .3 second timer. At the end of the timer, the rope is deactivated. This
         * is to create the lasso effect. The rope can only interact with objects while it is active
        */
        this.input.keyboard.on('keydown-SPACE', () => {
            this.rope.active      = true;
            this.rope.visible     = true;
            this.rope.body.enable = true;
            this.time.delayedCall(300, () => {
                this.rope.active      = false;
                this.rope.visible     = false;
                this.rope.body.enable = false;
            }, [], this)
        });

        /* 
        On D press, if we have any carried enemies, we drop them and activate their physics
        */
        this.input.keyboard.on('keydown-D', () => {
            if (this.enemiesHeld.length > 0) {
                let currentEnemy = this.enemiesHeld.pop();
                currentEnemy.setActive(true);
                currentEnemy.setVisible(true);
                currentEnemy.body.enable = true;
                currentEnemy.setPosition(this.player.x + 16, this.player.y + 16);
                currentEnemy.data.values.dropped = true;
                currentEnemy.data.values.ropedTimer.paused = false;
                this.heldText.setText(`held: ${this.enemiesHeld.length}`);
                if (this.checkWin()) {
                    alert('WINNER')
                };
            }
        });

        // enemies and players have collision, naturally
        this.physics.add.collider(this.enemies, this.player);

        /* Here we check to see if the rope and enemy overlaps, if it does we deactivate the enemy and add it to the carried list. We also
         * update its texture to prepare it to be dropped
         */
        this.physics.add.overlap(this.rope, this.enemies, (rope, enemy) => {
            if (this.enemiesHeld.length < this.maxEnemiesHeld) {
                enemy.visible           = false;
                enemy.active            = false;
                enemy.body.enable       = false;
                enemy.data.values.roped = true;
                enemy.data.values.dropped = false;
                enemy.setVelocity(0, 0);
                enemy.setTexture('enemyRoped');
                enemy.anims.stop();
                this.enemiesHeld.push(enemy);
                this.heldText.setText(`held: ${this.enemiesHeld.length}`);
                enemy.data.values.ropedTimer.remove();
                enemy.data.values.ropedTimer = this.time.addEvent({delay: 10000, callback: this.ropeTimeout, args: [enemy], callbackScope: this, paused: true});
            }
        }, null, this);

        //enemy movement
        this.time.addEvent({ delay: 2000, callback: this.moveEnemies, callbackScope: this, loop: true });

        this.levelTimer = this.time.delayedCall(constants.levelTime * 1000, this.levelTimeUp, [], this);

    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-constants.playerSpeed);
            this.playerDirection = 'left';
            this.rope.setPosition(this.player.x - 40, this.player.y);
            this.rope.setAngle(0);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(constants.playerSpeed);
            this.playerDirection = 'right';
            this.rope.setPosition(this.player.x + 40, this.player.y);
            this.rope.setAngle(0);
            this.player.anims.play('right', true);
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-constants.playerSpeed);
            this.playerDirection = 'up';
            this.rope.setPosition(this.player.x, this.player.y - 40);
            this.rope.setAngle(90);
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(constants.playerSpeed);
            this.playerDirection = 'down';
            this.rope.setPosition(this.player.x, this.player.y + 40);
            this.rope.setAngle(90);
            this.player.anims.play('down', true);
        }
        else {
            this.player.setVelocity(0, 0);
            this.player.anims.stop();
        }

        this.timeRemainingText.setText('Time: ' + (constants.levelTime - this.levelTimer.getElapsedSeconds()).toString().substr(0, 4));
    }

    moveEnemies() {
        this.enemies.children.iterate((child) => { 
            if (child.data.values.roped == false && child.data.values.dropped == false) {
                let rand = Math.round(Math.random());
                if (rand == 0) {
                    child.setVelocityX((Math.floor(Math.random() * 100)) * (Math.round(Math.random()) * 2 - 1));
                    child.setVelocityY(0);
                    if(child.body.velocity.x > 0) {
                        child.anims.play('cowRight', true);
                    }
                    else {
                        child.anims.play('cowLeft', true);
                    }
                }
                else {
                    child.setVelocityY((Math.floor(Math.random() * 100)) * (Math.round(Math.random()) * 2 - 1));
                    child.setVelocityX(0);
                    if(child.body.velocity.y > 0) {
                        child.anims.play('cowDown', true);
                    }
                    else {
                        child.anims.play('cowUp', true);
                    }
                }  
            }
        })
    }

    levelTimeUp() {
        alert('TIME UP');
    }

    checkWin() {
        let win = true;
        this.enemies.children.iterate((child) => {
            if (!child.data.values.dropped) {
                win = false;
            }
        })
        return win;
    }

    ropeTimeout(enemy) {
        enemy.setTexture('enemy');
        enemy.data.values.roped = false;
        enemy.data.values.dropped = false;
        enemy.data.values.ropedTimer.paused = true;
    }
}