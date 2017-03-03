/**
 * Created by kornelia on 02.03.17.
 */
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');
var ball,
    player,
    cursors,
    bricks,
    score = 0,
    lives = 3,
    ballOnPaddle = true,
    scoreText,
    startText,
    livesText;

const game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update
});

function preload() {
    game.load.image('background', 'assets/background.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('ball', 'assets/ball.png');
    game.load.image('brick', 'assets/brick.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    game.add.sprite(0, 0, 'background');

    bricks = game.add.group();
    bricks.enableBody = true;
    for (var i = 0; i < 11; i++) {
        for (var j = 0; j < 5; j++) {
            var brick = bricks.create(i * 70 + 20, 40 + j * 40, 'brick');
            brick.body.bounce.set(1);
            brick.body.immovable = true;
        }

    }
    game.physics.arcade.enable(bricks);

    player = game.add.sprite(game.world.centerX, 500, 'player');
    player.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, player.y - 22, 'ball');
    ball.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(ball);
    ball.body.collideWorldBounds = true;
    ball.checkWorldBounds = true;
    ball.body.bounce.set(1);
    ball.events.onOutOfBounds.add(death, this);

    cursors = game.input.keyboard.createCursorKeys();

    scoreText = game.add.text(20, 10, 'Score: ' + score, {
        fontSize: '20px',
        fill: '#fff'
    });
    livesText = game.add.text(700, 10, 'Lives: ' + lives, {
        fontSize: '20px',
        fill: '#fff'
    });
    startText = game.add.text(game.world.centerX, game.world.centerY, 'click To Start', {
        fontSize: '50px',
        fill: '#fff'
    });
    startText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(release, this);
}

function update() {

    player.x = game.input.x;
    /* game control with arrow keys
    if (cursors.left.isDown) {
        player.body.velocity.x = -300;
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 300;
    } else {
        player.body.velocity.x = 0;
    }*/
    if (player.x < 75) {
        player.x = 75;
    } else if (player.x > game.width - 75) {
        player.x = game.width - 75;
    }
    if (ballOnPaddle) {
        // Setting the ball on the paddle when player has it
        ball.body.x = player.x;
    } else {
        // Check collisions
        game.physics.arcade.collide(ball, player, collidePlatform, null, this);
        game.physics.arcade.collide(ball, bricks, collectBricks, null, this);
    }
}

function collectBricks(ball, brick) {
    brick.kill();
    score += 10;
    scoreText.text = 'Score: ' + score;
    if (brick.countLiving <= 0) {
        score += 1000;
        startText.text = "- Next Level -";
        startText.visible = true;
        bricks.callAll("revive");
        ballOnPaddle = true;
    }
}

function collidePlatform(ball, player) {
    if (ball.x < player.x) {
        ball.body.velocity.x = -10 * (player.x - ball.x);
    } else if (ball.x > player.x) {
        ball.body.velocity.x = 10 * (ball.x - player.x);
    } else {
         ball.body.velocity.x = 2 + Math.random() * 8;
    }
}

function release() {
    if (ballOnPaddle) {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        startText.visible = false;
    }
}

function death() {
    lives--;
    livesText.text = "lives: " + lives;

    if (lives === 0) {
        gameOver();
    } else {
        ballOnPaddle = true;
        ball.reset(player.body.x, player.y - 16);
    }
}

function gameOver() {
    ball.body.velocity.setTo(0, 0);
    startText.text = "Game Over!";
    startText.visible = true;
}
