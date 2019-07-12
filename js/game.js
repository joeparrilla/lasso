import {PlayGame} from './scenes/PlayGame.js';
 
///////////////////////////////////////////////////////////////// instantiation
var config = {
    type   : Phaser.AUTO,
    width  : 768,
    height : 600,
    physics: {
        default: 'arcade',
        arcade : {
            debug: false
        }
    },
    scene: PlayGame
};
 
self.game = new Phaser.Game(config);