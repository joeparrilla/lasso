import {PlayGame} from '../src/scenes/PlayGame.js.js';
 
///////////////////////////////////////////////////////////////// instantiation
var config = {
    type   : Phaser.AUTO,
    width  : 800,
    height : 800,
    physics: {
        default: 'arcade',
        arcade : {
            debug: false
        }
    },
    scene: PlayGame
};
 
self.game = new Phaser.Game(config);