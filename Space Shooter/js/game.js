let player;
let enemies;
let leftKey, rightKey, spaceKey;
let lasers;
let lastFired = 0; // Stores the last time a laser was fired
let fireRate = 300; // Time in milliseconds between shots
let laserSound, explosionSound, coinSound, powerUpSound; // Variables for sounds
let background;
let coins;
let enemyLasers;
let hitSound;
let killsThisWave = 0;
let coinsThisWave = 0;
let killsCount = 0;  // Variable to track number of enemies killed
let coinsCount = 0;  // Variable to track number of coins collected
let killsText;       // Text object for kills count
let coinsText;       // Text object for coins count
let playerLives = 3;
let livesText;
let highScoreText;
const minFireRate = 100; // Minimum fire rate (in milliseconds)
let wave = 1;
let enemiesPerRow = 5;
let rows = 1;
let waveActive = false;
let bossHealth = 20;
let boss;
let bossHitCooldown = false;
let bossHealthBar;
let isTouching = false;
let isSpaceHeld = false;
let enemyHealth = 0;
let laserCount = 1;
const maxLaserCount = 8;
let scaleRatio = window.devicePixelRatio / 3;
// Variables to track touch input
let touchStartX = 0; // X position where the touch started
let touchStartY = 0; // Y position where the touch started
let touchOffsetX = 0; // Horizontal offset from the touch start position
let touchOffsetY = 0; // Vertical offset from the touch start position
let isShootingEnabled = true; // Flag to track if shooting is enabled
let gameStarted = false;
let miniBossLeft, miniBossRight;
let miniBossesSpawned = false;
let combinedBossHealth;
let isGameOver = false;
let playerSpeed = 1;
let inSettings = false;
let pausedLasers = [];
let pausedEnemies = [];
let pausedCoins = [];
let isSettingsOpen = false;
// Declare global variables for settings UI elements
let settingsBackground, settingsTitle, speedLabel, speedText;
let increaseButtonBg, increaseButton, decreaseButtonBg, decreaseButton;
let resumeButtonBg, resumeButton;
const desktopScaleFactor = isDesktop() ? 0.8 : 1; // Reduce size by 30% on desktop
let globalMovementDirection = 1; // 1 for right, -1 for left
let movementEvent = null; // Store the movement event
let highScore;
let waveScore = 0;
let previousTotalScore = 0;
let finalScoreToken = '';

const gameDetailsId = localStorage.getItem('gameDetailsId');


function isDesktop() {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


const config = {
    type: Phaser.CANVAS,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT, // Scale the game to fit the screen
      autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on the screen
    },
    render: {
        antialias: true, // Enable anti-aliasing
        pixelArt: false, // Set to true if using pixel art
        roundPixels: true,
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

const game = new Phaser.Game(config);

function preload() {

  const loadingText = this.add.text(config.width / 2, config.height / 2, 'Loading...', { fontSize: `${32 * desktopScaleFactor}px`, fill: '#fff' }).setOrigin(0.5);

  this.load.on('progress', (value) => {
    loadingText.setText(`Loading: ${Math.round(value * 100)}%`);
  });

  this.load.on('complete', () => {
    loadingText.destroy();
  });
  // Load assets
  this.load.image('background', 'assets/images/background.png'); // 🌌 Background image
  this.load.spritesheet('explosion', 'assets/images/explode.png', { frameWidth: 128, frameHeight: 128 });
  this.load.image('player', 'assets/images/player.png'); // 🚀 Player image
  this.load.image('laser', 'assets/images/laser.png'); // 🔫 Laser image
  this.load.spritesheet('enemy', 'assets/images/enemy.png', { frameWidth: 575, frameHeight: 500 }); // 👾 Enemy sprite sheet
  this.load.image('coin', 'assets/images/coin.png'); // 🪙 Coin image
  this.load.audio('laserSound', 'assets/sounds/laser.mp3'); // 🔊 Laser sound effect
  this.load.audio('explosionSound', 'assets/sounds/destroy1.mp3'); // 💥 Explosion sound effect
  this.load.audio('coinSound', 'assets/sounds/coin.mp3'); // 🪙 Coin collection sound
  this.load.audio('themeMusic', 'assets/sounds/background-song.mp3'); // 🪙 Coin collection sound
  this.load.audio('spawnEnemy', 'assets/sounds/spawnEnemy.mp3'); // 🪙 Coin collection sound
  this.load.spritesheet('enemyLaser', 'assets/images/enemylaser.png', { frameWidth: 496, frameHeight: 499 }); // Adjust frameWidth and frameHeight based on your sprite sheet
  this.load.audio('hitSound', 'assets/sounds/hitsound.mp3'); // Replace with your actual file path
//   this.load.image('powerup', 'assets/images/power-up.png'); // Powerup image
  this.load.audio('powerUpSound', 'assets/sounds/power-up.mp3'); // Replace with your actual file path
  this.load.spritesheet('powerup', 'assets/images/powerup1.png', { frameWidth: 600, frameHeight: 600 });


}

function create() {
    // Other setup code...    
    const desktopScaleFactor = isDesktop() ? 0.7 : 1; // Reduce size by 30% on desktop
   
    // 🌌 Create a scrolling background
    background = this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);

    // Show a hint for desktop users in the top-right corner
    if (isDesktop()) {
        const settingsHint = this.add.text(config.width - 10, 25, 'ESC for Settings', {
            fontSize: `${24 * desktopScaleFactor}px`,
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'right'
        }).setOrigin(1, 0.5); // Right-align the text
    }

     // Add a settings button to a fixed UI layer
     if (!isDesktop()){
        const settingsButton = this.add.text(config.width - 50, 30, '⚙️', {
            fontSize: `${48 * desktopScaleFactor}px`,
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive();

        // Make the button non-interactive with physics
        settingsButton.depth = 1000; // Ensure it's above other objects
        settingsButton.setScrollFactor(0); // Fix the button position relative to the camera

        // Open settings when the button is clicked
        settingsButton.on('pointerdown', () => {
            if (isSettingsOpen) {
                // Simulate clicking the "Resume" button
                resumeButtonBg.emit('pointerup');
            } else {
                openSettings.call(this);
            }
            isSettingsOpen = !isSettingsOpen; // Toggle the state
            
        });
    }

    // Add a key listener for the Escape key
    this.input.keyboard.on('keydown-ESC', () => {
        if (isGameOver) return;
        if (isSettingsOpen) {
            // Simulate clicking the "Resume" button
            resumeButtonBg.emit('pointerup');
        } else {
            openSettings.call(this);
        }
        isSettingsOpen = !isSettingsOpen; // Toggle the state
    });
    
    // 🚀 Player Setup
    const playerScale = 0.15 * desktopScaleFactor;
    this.scale.setParentSize(window.innerWidth, window.innerHeight);
    
    player = this.physics.add.sprite(config.width / 2, config.height - 80, 'player');
    player.setCollideWorldBounds(true);
    player.setScale(playerScale);

    // Adjust the player's hitbox to match the ship's shape
    const hitboxWidth = 832; // Adjust based on your ship's visual width
    const hitboxHeight = 400; // Adjust based on your ship's visual height
    const hitboxOffsetX = 0; // Adjust if the hitbox needs to be shifted horizontally
    const hitboxOffsetY = 0; // Adjust if the hitbox needs to be shifted vertically

    // Set custom hitbox size and offset
    player.body.setSize(hitboxWidth, hitboxHeight); // Set the size of the hitbox
    player.body.setOffset(hitboxOffsetX, hitboxOffsetY); // Adjust the position of the hitbox
    // 🔫 Laser Group Setup
    lasers = this.physics.add.group();
    // 👾 Enemies Group Setup
    enemies = this.physics.add.group();
  
    // 🪙 Coin Group Setup
    coins = this.physics.add.group();

    enemyLasers = this.physics.add.group();

     // Add kills and coins text
    const textSize = 35 * desktopScaleFactor; // Scale text size dynamically
    killsText = this.add.text(10, 10, 'Kills: 0', { fontSize: `${textSize}px`, fill: '#fff' });
    coinsText = this.add.text(250, 10, 'Coins: 0', { fontSize: `${textSize}px`, fill: '#fff' });
    livesText = this.add.text(490, 10, 'Lives: ' + playerLives, {fontSize: `${textSize}px`, fill: '#fff'});

    fetchAndDisplayHighScore(this);

    // 🎮 Input Setup
    leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP); // Add up key
    downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN); // Add down key
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Track spacebar hold state
    spaceKey.on('down', () => {
        isSpaceHeld = true;
    });

    spaceKey.on('up', () => {
        isSpaceHeld = false;
    });

    // Enable continuous firing when touching the player
    player.setInteractive(); // Make the player interactive for touch events

    // Enable touch input for movement control
    this.input.on('pointerdown', (pointer) => {
            if(!gameStarted){
                gameStarted = true;
                initializeAudio.call(this);
            }
            isTouching = true;
            touchStartX = pointer.x; // Record the initial touch position
            touchStartY = pointer.y; // Record the initial touch position

    
    });

    this.input.on('pointermove', (pointer) => {
        if(pointer.event instanceof TouchEvent && !inSettings){
            // Calculate the horizontal and vertical offsets from the initial touch position
            touchOffsetX = pointer.x - touchStartX;
            touchOffsetY = pointer.y - touchStartY;

            // Update the player's position based on the offsets
            player.x += touchOffsetX * playerSpeed;
            player.y += touchOffsetY * playerSpeed;

            // Update the touch start position to the current pointer position
            touchStartX = pointer.x;
            touchStartY = pointer.y;
        }else if(pointer.event instanceof MouseEvent && !inSettings){
            player.x = pointer.x;
            player.y = pointer.y;
        }
    });

    this.input.on('pointerup', (pointer) => {
    
        isTouching = false; // Stop the player when touch ends
        
    });

    this.input.setDefaultCursor('none');

    // 🔥 Enemy Animation
    this.anims.create({
        key: 'powerup1',
        frames: this.anims.generateFrameNumbers('powerup', { start: 0, end: 5 }), // Use all 21 frames
        frameRate: 6,
        repeat: -1,
      });

    // 🔥 Enemy Animation
    this.anims.create({
      key: 'enemy-animate',
      frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 20 }), // Use all 21 frames
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 14 }), // Adjust frames based on your sprite sheet
        frameRate: 10,
        repeat: 0,
    });

    this.anims.create({
        key: 'enemyLaserAnim',
        frames: this.anims.generateFrameNumbers('enemyLaser', { start: 0, end: 4 }), // Assuming it's a single-frame sprite for the laser
        frameRate: 10,
        repeat: -1
    });

    // Start the first wave
    spawnEnemies.call(this);
    
}

function initializeAudio(){
     // 🔊 Load Sounds
     laserSound = this.sound.add('laserSound');
     explosionSound = this.sound.add('explosionSound');
     coinSound = this.sound.add('coinSound');
     hitSound = this.sound.add('hitSound');  // Initialize the hit sound
     powerUpSound = this.sound.add('powerUpSound');
     themeMusic = this.sound.add('themeMusic', {loop:true});
     themeMusic.play().loop;
     spawnEnemySound = this.sound.add('spawnEnemy');
}

function calculateWaveScore(killsThisWave, coinsThisWave){
    let waveScore = killsThisWave + coinsThisWave;
    return waveScore;
}

function submitWaveScore(waveScore){
    const waveData = {
        score: waveScore,
        previousTotalScore: previousTotalScore
    };

    return new Promise((resolve, reject) => {
        fetch('https://crypto-playzone.com/api/score/submit-wave', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(waveData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.scoreToken) {
                finalScoreToken = data.scoreToken;
                resolve(); // Resolve once the token is updated
            } else {
                console.error("Failed to receive score token.");
                reject(new Error("Failed to receive score token"));
            }
        })
        .catch(error => {
            console.error("Error submitting wave score:", error);
            reject(error);
        });
    });
}

async function fetchHighScore() {
    // Get gameDetailsId from local storage
    if (!gameDetailsId) {
      console.error('gameDetailsId not found in local storage');
      return null;
    }
  
    const url = `https://crypto-playzone.com/api/score/get-score/${gameDetailsId}`; // Replace with your backend endpoint
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch high score');
      }
      const data = await response.json();
  
      return data; // Assuming the backend returns { highScore: 123 }
    } catch (error) {
      console.error('Error fetching high score:', error);
      return null;
    }
  }

async function fetchAndDisplayHighScore(scene) {
    const highScore = await fetchHighScore();
    if (highScore !== null) {
        if (highScoreText) {
            highScoreText.destroy(); // Remove the old high score text
        }
        highScoreText = scene.add.text(700, 10, `HiScore: ${highScore}`, {
            fontSize: `${35 * desktopScaleFactor}px`,
            fill: '#fff'
        });
    } else {
        if (highScoreText) {
            highScoreText.destroy(); // Remove the old high score text
        }
        highScoreText = scene.add.text(700, 10, 'HiScore: N/A', {
            fontSize: `${35 * desktopScaleFactor}px`,
            fill: '#fff'
        });
    }
}


function spawnEnemies() {
    if(waveActive) return;

    enemies.clear(true, true); // Clear existing enemies

    if (wave % 3 === 0){
        // Spawn boss
        spawnBoss.call(this);
        waveActive = true;
        return;
    }

    const isMobile = window.innerWidth <= 768; // Assume screens <= 768px wide are mobile

    let maxEnemiesPerRow;
    let maxRows;
    if(isMobile){
        maxEnemiesPerRow = 5;
        maxRows = 4;
    }else{
        maxEnemiesPerRow = 10;
        maxRows = 3;
    }

    if(wave > 1) {
        if(enemiesPerRow < maxEnemiesPerRow){
            enemiesPerRow++;
        }
        if(rows < maxRows){
            rows++;
        }
    }
    
    const enemyScale = 0.3 * desktopScaleFactor;
    const originalWidth = 575, originalHeight = 500; // Original enemy sprite size
    const enemyWidth = originalWidth * enemyScale;
    const enemyHeight = originalHeight * enemyScale;
    const padding = 40;

    const availableWidth = config.width - padding * 2;
    const spacing = (availableWidth - (enemiesPerRow * enemyWidth)) / (enemiesPerRow - 1); // Horizontal spacing
    const verticalSpacing = isDesktop() ? 10 : 50; // Vertical spacing between rows
    const startYOffset = 50;


    for (let row = 0; row < rows; row++) {
        for (let i = 0; i < enemiesPerRow; i++) {
            let xPosition = padding + (enemyWidth / 2) + i * (enemyWidth + spacing);
            let yPosition = startYOffset + 100 + row * (enemyHeight + verticalSpacing); // Adjust starting Y position

            let enemy = enemies.create(xPosition, yPosition, 'enemy');
            enemy.setScale(enemyScale);
            enemy.setVelocityY(0);
            enemy.anims.play('enemy-animate', true);
            const hitboxWidth = 550; // Adjust based on your ship's visual width
            const hitboxHeight = 220; // Adjust based on your ship's visual height
            const hitboxOffsetX = 15; // Adjust if the hitbox needs to be shifted horizontally
            const hitboxOffsetY = 100; // Adjust if the hitbox needs to be shifted vertically

            enemy.body.setSize(hitboxWidth, hitboxHeight);
            enemy.body.setOffset(hitboxOffsetX, hitboxOffsetY);
            enemy.health = enemyHealth;
            

            // Make the enemy shoot at random intervals
            // Base firing interval (decreases slightly with wave number)
            const baseFiringInterval = Math.max(1000, 3000 - (wave - 1) * 100); // Decreases by 100ms per wave, but never below 1000ms
            // Randomized firing interval for each enemy
            const randomOffset = Phaser.Math.Between(-500, 2000); // Random offset between -500ms and +500ms
            const firingInterval = baseFiringInterval + randomOffset; // No need for Math.max since baseFiringInterval is already capped

            enemy.shootEvent = this.time.addEvent({
                delay: firingInterval,
                callback: fireEnemyLaser,
                callbackScope: this,
                loop: true,
                args: [enemy] // Pass the enemy as an argument
            });
        }
    }

    if(!movementEvent) {
        movementEvent = this.time.addEvent({
            delay: 16,
            callback: moveEnemies,
            callbackScope: this,
            loop: true
        });
    }
    waveActive = true;
}

function spawnBoss() {
    enemyHealth--;
    const bossScale = 0.7 * desktopScaleFactor; // Boss is larger than regular enemies
    const originalWidth = 575, originalHeight = 530; // Original enemy sprite size
    const bossWidth = originalWidth * bossScale;
    const bossHeight = originalHeight * bossScale;

    const bossYPosition = isDesktop() ? 250 : 350;

    boss = enemies.create(config.width / 2, bossYPosition, 'enemy');
    boss.setScale(bossScale);
    boss.setVelocityY(0);
    boss.anims.play('enemy-animate', true);
    const hitboxWidth = 520; // Adjust based on your ship's visual width
    const hitboxHeight = 350; // Adjust based on your ship's visual height
    const hitboxOffsetX = 25; // Adjust if the hitbox needs to be shifted horizontally
    const hitboxOffsetY = 0; // Adjust if the hitbox needs to be shifted vertically

    boss.body.setSize(hitboxWidth, hitboxHeight);
    boss.body.setOffset(hitboxOffsetX, hitboxOffsetY);
    boss.setCollideWorldBounds(true); // Enable world bounds collision
    boss.body.onWorldBounds = true; // Enable world bounds event
    boss.body.bounce.x = 1; // Make the boss bounce off the edges
    // Set boss health
    boss.health = bossHealth;
    boss.isBoss = true;

    combinedBossHealth = bossHealth;

    // Calculate boss speed based on wave number
    const baseBossSpeed = 50; // Base speed for the boss
    const maxBossSpeed = 300; // Maximum speed for the boss
    const bossSpeed = Math.min(baseBossSpeed + (wave - 2) * 30, maxBossSpeed); // Increase speed by 50 per wave, capped at maxBossSpeed
    // Set initial random velocity
    // Set initial random direction (left or right)
    const initialDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Randomly choose -1 (left) or 1 (right)
    boss.setVelocityX(initialDirection * bossSpeed); // Apply speed with random direction

    // Create boss health bar
    bossHealthBar = this.add.graphics();
    updateBossHealthBar();

    // Timer to change boss direction randomly
    this.time.addEvent({
        delay: 2000, // Change direction every 2 seconds
        callback: changeBossDirection,
        callbackScope: this,
        loop: true
    });

    boss.shootEvent = this.time.addEvent({
        delay: 1000,
        callback: bossSpecialAttack,
        callbackScope: this,
        loop: true,
        args: [boss]
    });    

    // Reset mini-bosses spawned flag
    miniBossesSpawned = false;
}

function spawnMiniBosses() {
    if (miniBossesSpawned) return; // Prevent spawning mini-bosses multiple times

    // Calculate mini-boss hitbox properties based on boss hitbox
    const miniBossHitboxWidth = 520; // Adjust based on your ship's visual width
    const miniBossHitboxHeight = 350; // Adjust based on your ship's visual height
    const miniBossHitboxOffsetX = 25; // Adjust if the hitbox needs to be shifted horizontally
    const miniBossHitboxOffsetY = 0; // Adjust if the hitbox needs to be shifted vertically

    // Calculate the center position of the screen
    const centerX = config.width / 2;

    // Use a tween to smoothly move the boss to the center
    this.tweens.add({
        targets: boss,
        x: centerX,
        duration: 1000, // 1 second to reach the center
        ease: 'Linear',
        onComplete: () => {
            // Stop the boss's movement
            if(boss && boss.active){
                boss.setVelocityX(0);
            }
        }
    });

    const miniBossScale = 0.55 * desktopScaleFactor; // Mini-bosses are smaller than the main boss
    const spacing = 400;

    // Spawn mini-boss to the left of the main boss
    miniBossLeft = enemies.create(config.width/2 - spacing, boss.y, 'enemy');
    miniBossLeft.setScale(miniBossScale);
    miniBossLeft.setVelocityX(0); // Move left
    miniBossLeft.anims.play('enemy-animate', true);
    miniBossLeft.setCollideWorldBounds(true);
    miniBossLeft.body.onWorldBounds = true;
    miniBossLeft.body.setSize(miniBossHitboxWidth, miniBossHitboxHeight);
    miniBossLeft.body.setOffset(miniBossHitboxOffsetX, miniBossHitboxOffsetY);
    // Set mini-boss health to half of the boss's health
    miniBossLeft.health = Math.ceil(bossHealth / 2); // Round up to ensure at least 1 health
    combinedBossHealth += miniBossLeft.health;
    // Add shooting logic for the left mini-boss
    miniBossLeft.shootEvent = this.time.addEvent({
        delay: 2000, // Fire every 1.5 seconds
        callback: bossSpecialAttack,
        callbackScope: this,
        loop: true,
        args: [miniBossLeft] // Pass the mini-boss as an argument
    });
    // Spawn mini-boss to the right of the main boss
    miniBossRight = enemies.create(config.width/2 + spacing, boss.y, 'enemy');
    miniBossRight.setScale(miniBossScale);
    miniBossRight.setVelocityX(0); // Move right
    miniBossRight.anims.play('enemy-animate', true);
    miniBossRight.setCollideWorldBounds(true);
    miniBossRight.body.onWorldBounds = true;
    // Set mini-boss hitbox
    miniBossRight.body.setSize(miniBossHitboxWidth, miniBossHitboxHeight);
    miniBossRight.body.setOffset(miniBossHitboxOffsetX, miniBossHitboxOffsetY);

    // Set mini-boss health to half of the boss's health
    miniBossRight.health = Math.ceil(bossHealth / 2); // Round up to ensure at least 1 health
    combinedBossHealth += miniBossRight.health;
    // Add shooting logic for the right mini-boss
    miniBossRight.shootEvent = this.time.addEvent({
        delay: 2000, // Fire every 1.5 seconds
        callback: bossSpecialAttack,
        callbackScope: this,
        loop: true,
        args: [miniBossRight] // Pass the mini-boss as an argument
    });
    spawnEnemySound.play();

    updateBossHealthBar();
    // Set mini-bosses spawned flag
    miniBossesSpawned = true;
}

function moveEnemies() {
    if(waveActive){
        let leftMost = Math.min(...enemies.getChildren().map(e => e.x));
        let rightMost = Math.max(...enemies.getChildren().map(e => e.x));

        if(leftMost <= (575 * 0.3 * desktopScaleFactor)/2 || rightMost >= config.width - (575 * 0.3 * desktopScaleFactor)/2) {
            globalMovementDirection *= -1;
        }
        
        enemies.getChildren().forEach(enemy => {
            if(!enemy.isBoss){
                enemy.x += globalMovementDirection;
            }
            
            
            
        })
    }
}


function bossSpecialAttack(enemy) {
    if (!enemy || !enemy.active) return;

    // Calculate wave-based difficulty (boss appears every 5 waves)
    const waveTier = Math.floor(wave / 3);

    // PROJECTILE LIMITS (tweak these as needed)
    const MAX_SPREAD_SHOTS = 6;    // Maximum spread projectiles
    const MAX_TARGETED_SHOTS = 2;   // Maximum targeted shots
    const MAX_SPEED = 400;          // Maximum projectile speed
    

    // Calculate dynamic values (capped at maximums)
    const projectileCount = Math.min(1 + waveTier * 2, MAX_SPREAD_SHOTS);
    const projectileSpeed = Math.min(200 + waveTier * 40, MAX_SPEED);
    
    // Enhanced spread shot that scales with wave count
    for (let i = 0; i < projectileCount; i++) {
        const angle = (i / (projectileCount - 1) * 2 - 1) * 0.5; // 50° total spread
        
        const laser = enemyLasers.create(enemy.x, enemy.y, 'enemyLaser');
        laser.setScale(0.07 * desktopScaleFactor);
        laser.setVelocity(
            Math.sin(angle) * projectileSpeed, 
            Math.cos(angle) * projectileSpeed
        );
        laser.anims.play('enemyLaserAnim', true);

        laser.setCollideWorldBounds(true);
        laser.body.onWorldBounds = true;
        laser.body.world.on('worldbounds', function(body) {
            if (body.gameObject === laser) laser.destroy();
        });
    }

    // Add accurate targeted shot at player in higher waves
    if (waveTier >= 2 && player && player.active) {
        // Calculate direction to player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction and apply speed
        const vx = (dx / distance) * projectileSpeed * 1.3;
        const vy = (dy / distance) * projectileSpeed * 1.3;
        
        const targetedLaser = enemyLasers.create(enemy.x, enemy.y, 'enemyLaser');
        targetedLaser.setScale(0.07 * desktopScaleFactor);
        targetedLaser.setVelocity(vx, vy);
        targetedLaser.anims.play('enemyLaserAnim', true);
        
        targetedLaser.setCollideWorldBounds(true);
        targetedLaser.body.onWorldBounds = true;
        targetedLaser.body.world.on('worldbounds', function(body) {
            if (body.gameObject === targetedLaser) targetedLaser.destroy();
        });
    }
}

function changeBossDirection() {
    if (!boss || !boss.active || miniBossesSpawned) return;

    // Calculate boss speed based on wave number
    const baseBossSpeed = 100; // Base speed for the boss
    const maxBossSpeed = 500; // Maximum speed for the boss
    const bossSpeed = Math.min(baseBossSpeed + (wave - 2) * 30, maxBossSpeed); // Increase speed by 50 per wave, capped at maxBossSpeed

    const initialDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Randomly choose -1 (left) or 1 (right)
    boss.setVelocityX(initialDirection * bossSpeed); // Apply speed with random direction


}

function updateBossHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = config.width / 2 - barWidth / 2;
    const y = isDesktop() ? 60 : 120;

    bossHealthBar.clear();
    bossHealthBar.fillStyle(0xff0000, 1); // Red background
    bossHealthBar.fillRect(x, y, barWidth, barHeight);

    // Calculate the total possible health (boss + mini-bosses)
    const totalPossibleHealth = bossHealth + (miniBossLeft ? miniBossLeft.health : 0) + (miniBossRight ? miniBossRight.health : 0);

    const healthWidth = (combinedBossHealth / totalPossibleHealth) * barWidth;
    bossHealthBar.fillStyle(0x00ff00, 1); // Green health
    bossHealthBar.fillRect(x, y, healthWidth, barHeight);
}


function fireLaser() {
    if(!isShootingEnabled) return;
    let currentTime = this.time.now;

    if (currentTime - lastFired > fireRate) {
        lastFired = currentTime;

        // Calculate the spread angle dynamically based on the number of lasers
        const maxSpreadAngle = 0.3; // Maximum angle between lasers (in radians)
        const minSpreadAngle = 0.05; // Minimum angle between lasers (in radians)
        const spreadAngle = Math.max(minSpreadAngle, maxSpreadAngle - (laserCount * 0.05)); // Decrease angle as laserCount increases

        // Fire multiple lasers based on laserCount
        for (let i = 0; i < laserCount; i++) {
            let angleOffset = 0;

            // Calculate angle offset for spread (only if more than 1 laser)
            if (laserCount > 1) {
                angleOffset = (i - (laserCount - 1) / 2) * spreadAngle;
            }

            let laser = lasers.create(player.x, player.y - 30, 'laser');

            if (laser) {
                laser.setVelocityY(-400 * Math.cos(angleOffset));
                laser.setVelocityX(-400 * Math.sin(angleOffset));
                laser.setScale(0.6 * desktopScaleFactor);
                if(laserSound){
                    laserSound.play();
                }
                laser.setCollideWorldBounds(true);
                laser.body.onWorldBounds = true;
                laser.body.world.on('worldbounds', function(body) {
                    if (body.gameObject === laser) {
                        laser.destroy();
                    }
                });
            }
        }
    }
}


function hitEnemy(laser, enemy) {
    if(explosionSound){
        explosionSound.play(); // Play hit sound effect
    }
    

    // Shake the enemy when hit
    moveSpriteUp(enemy, 10, 50, this); // Shake with intensity 5 for 200ms
    if(enemy === boss || enemy === miniBossLeft || enemy === miniBossRight){
        // if(bossHitCooldown) return;
        // Handle boss hit
        enemy.health--;
        combinedBossHealth--;
        updateBossHealthBar();
        if(enemy.health <= 0){
            let explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
            explosion.setScale(2 * desktopScaleFactor);
            explosion.play('explode');
            if(explosionSound){
                explosionSound.play();
            }
            

            this.cameras.main.shake(500, 0.02);

            if(enemy.shootEvent){
                enemy.shootEvent.remove();
            }

            enemy.destroy()
            laser.destroy();
            if(enemy === boss){
            bossHealth += 20;
            }
            explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                explosion.destroy();
            });

            spawnPowerup(enemy.x, enemy.y);
            killsCount++;
            killsThisWave++;
            updateScoreText();

            // Check if all enemies (boss and mini-bosses) are defeated
            if (!boss.active && (!miniBossLeft || !miniBossLeft.active) && (!miniBossRight || !miniBossRight.active)) {
                // Destroy the health bar
                if (bossHealthBar) {
                    bossHealthBar.destroy();
                    
                }
            }

            
        }else{
            laser.destroy();
            if(explosionSound){
                explosionSound.play();
            }
            
            return;
        }
    }
    enemy.health--;
    if(enemy.health < 0){
        let explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
        explosion.play('explode');
        if(explosionSound){
            explosionSound.play();
        }
        

        // Stop the enemy's shooting timer event
        if (enemy.shootEvent) {
            enemy.shootEvent.remove(); // Stop the timer event
        }

        enemy.destroy();
        laser.destroy();
        
        explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            explosion.destroy();
        });
        
        spawnPowerup(enemy.x, enemy.y);
        // Increase kills count
        killsCount++;
        killsThisWave++;
        updateScoreText(); // Update the score text after each kill
    }
    laser.destroy();
}

function playerEnemyCollision(player, enemies){
    if(isGameOver) return;
    isGameOver = true;
    playerLives = 0;
    livesText.setText('Lives: ' + playerLives); // Destroy the enemy laser on impact
    gameOver.call(this);
}


function moveSpriteUp(sprite, distance, duration, scene) {

    if(sprite.isMovingUp) return;
    const originalY = sprite.y; // Store the original Y position

    sprite.isMovingUp = true;

    // Move the sprite upwards by the specified distance
    sprite.y = originalY - distance;

    // Reset the sprite's position after the duration is over
    scene.time.delayedCall(duration, () => {
        sprite.y = originalY; // Reset Y position
        sprite.isMovingUp = false;
    });
}

function spawnPowerup(x, y) {
    let randomChance = Phaser.Math.Between(1, 100); // Random number between 1 and 100
    let powerupOrCoin;

    if (randomChance <= 10) { // 10% chance to spawn a powerup
        powerupOrCoin = 'powerup1';
    } else { // 90% chance to spawn a coin
        powerupOrCoin = 'coin';
    }

    let item = coins.create(x, y, powerupOrCoin);
    item.setScale(0.09 * desktopScaleFactor);
    item.setVelocityY(200); // Make the item fall down
    if(powerupOrCoin === 'powerup1'){
        item.body.setSize(600, 600);
        item.body.setOffset(0, 0);
        item.anims.play('powerup1', true); // Play the laser animation
    }
    

    // Configure the item to be destroyed when it crosses the screen boundaries
    item.setCollideWorldBounds(true); // Enable world bounds collision
    item.body.onWorldBounds = true; // Enable world bounds event
    item.body.world.on('worldbounds', function(body) {
        if (body.gameObject === item) {
            item.destroy();
        }
    });
    
}




function collectCoin(player, item) {
    if (item.texture.key === 'coin') {
        if(coinSound){
            coinSound.play();
        }
        
        coinsCount++;  // Increment the coin count
        coinsThisWave++; // Increment the coins collected this wave
        updateScoreText(); // Update the score text after collecting a coin
    } else if (item.texture.key === 'powerup') {
        // Handle powerup logic here
        if(powerUpSound){
            powerUpSound.play();
        }
        console.log("Powerup collected!");
        activatePowerUp.call(this);
    }
    item.destroy();
}

function activatePowerUp() {
    if (laserCount < maxLaserCount) {
        // Increase the number of lasers fired at once
        laserCount++;
    } else if (fireRate > minFireRate) {
        // Once the maximum laser count is reached, increase fire speed
        fireRate -= 50; // Decrease fire rate (make it faster)
    }

    // Visual feedback (optional)
    // if (fireRate > minFireRate) {
    //     fireRate -= 50; // Decrease fire rate (make it faster)
    // }
    // player.setTint(0x00ff00); // Visual feedback

    // // Reset power-up after 10 seconds
    // this.time.delayedCall(10000, () => {
    //     fireRate = 300; // Reset to default fire rate
    //     player.clearTint(); // Remove visual feedback
    // }, [], this);
}

function fireEnemyLaser(enemy) {
    if (!enemy) {
        console.error("Enemy is null, cannot fire laser");
        return;
    }

    const angles = [0, 45, 90, 135, 180]; // Shoot in multiple directions

    // Check if the laser group is correctly initialized
    if (!enemyLasers) {
        console.error("Laser group not initialized");
        return;
    }

    // Create the laser sprite from the enemy's position

    angles.forEach(angle => {
        
    })
    const laser = enemyLasers.create(enemy.x, enemy.y, 'enemyLaser');

    if (!laser) {
        console.error("Failed to create laser for enemy at position", enemy.x, enemy.y);
        return;
    }

    laser.setScale(0.08 * desktopScaleFactor);
    laser.setVelocityY(400);  // Adjust speed as needed
    laser.anims.play('enemyLaserAnim', true); // Play the laser animation

    // Enable world bounds and listen for the worldbounds event
    laser.setCollideWorldBounds(true);
    laser.body.onWorldBounds = true; // Enable world bounds event
    laser.body.world.on('worldbounds', function(body) {
        if (body.gameObject === laser) {
            laser.destroy();
        }
    });
}





function hitByEnemyLaser(player, enemyLaser) {
    
    playerLives -= 1;
    livesText.setText('Lives: ' + playerLives);
    enemyLaser.destroy(); // Destroy the enemy laser on impact

    if(playerLives <= 0){
        gameOver.call(this);
        return;
    }
    if(!gameStarted){
        return;
    }
    hitSound.play();
}

function gameOver() {
    // Handle game over logic
    if(bossHealthBar){
        bossHealthBar.destroy();
        bossHealthBar = null;
    }
    this.time.removeAllEvents(); // Stop all Phaser timer events
    isShootingEnabled = false;
    player.setVisible(false);
    player.setActive(false);
    player.body.enable=false;
    enemyLasers.clear(true, true);
    coins.clear(true,true);
    lasers.clear(true, true);
    if(gameStarted){
        explosionSound.play();
    }
    let explosion = this.add.sprite(player.x, player.y, 'explosion');
    explosion.play('explode');
    explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        explosion.destroy();
        // Create a semi-transparent background for the game over screen
    sendScoreToBackend(killsCount, coinsCount);
    const gameOverBox = this.add.rectangle(
        config.width / 2, 
        config.height / 2, 
        config.width * 0.8, 
        config.height * 0.7, 
        0x000000, 
        0.8
    ).setOrigin(0.5);

    // Add "Game Over" text
    const gameOverText = this.add.text(config.width / 2, config.height / 2 - 100, 'Game Over', {
        fontSize: `${64 * desktopScaleFactor}px`,
        fill: '#ff0000',
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    const totalScore = killsCount + coinsCount;
    // Add total score text
    const totalScoreText = this.add.text(config.width / 2, config.height / 2, `Total Score: ${totalScore}`, {
        fontSize: `${60 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Add a "Restart" button
    const restartButton = this.add.text(config.width / 2, config.height / 2 + 150, 'Restart', {
        fontSize: `${60 * desktopScaleFactor}px`,
        fill: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive();

    // Add a "Quit" button
    const quitButton = this.add.text(config.width / 2, config.height / 2 + 250, 'Quit', {
        fontSize: `${60 * desktopScaleFactor}px`,
        fill: '#ff0000',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive();

    // Restart the game when the "Restart" button is clicked
    restartButton.on('pointerup', () => {
        // Destroy all game over UI elements
        if (gameOverBox) gameOverBox.destroy();
        if (gameOverText) gameOverText.destroy();
        if (totalScoreText) totalScoreText.destroy();
        if (restartButton) restartButton.destroy();
        if (quitButton) quitButton.destroy();
        // Prevent pointer events from affecting player position
        restartGame.call(this);
    });

    // Quit the game when the "Quit" button is clicked
    quitButton.on('pointerdown', () => {
        // Redirect to a different page or close the game window
        window.location.href = 'http://crypto-playzone.com/leaderboard'; // Replace with your desired URL
    });

    
    })

    

    // Show the mouse cursor on the game over screen
    this.input.setDefaultCursor('default');

}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendScoreToBackend(killsCount, coinsCount){
    let waveScore = calculateWaveScore(killsThisWave, coinsThisWave);
    await submitWaveScore(waveScore);
    const url = 'https://crypto-playzone.com/api/score/update-score';

    // Prepare the payload as a JSON object
    const payload = {
        gameDetailsId: gameDetailsId,
        coins: coinsCount,
        kills: killsCount,
        scoreToken: finalScoreToken
    };

    // Send the request
    return fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
    .then(async (response) => {
        const data = await response.json();
      
        if (!response.ok) {
          console.error("Error submitting final score:", data.error || data.message);
          return;
        }
      
        console.log("Final score submitted successfully:", data.message);
      })
      .catch((error) => {
        console.error("Network or parsing error:", error);
      });
    }

function createNextWaveUI() {
    // Disable shooting and clear lasers
    const isMobile = window.innerWidth <= 768;
    isShootingEnabled = false;
    enemyLasers.clear(true, true);
    lasers.clear(true, true);

    
    // Create a transparent black background for the "Wave Complete" and score texts
    const uiBox = this.add.rectangle(config.width / 2, config.height / 2, config.width * 0.6, config.height * 0.4, 0x000000, 0.7)
        .setOrigin(0.5);

    // Add "Wave Complete" text in green (no shadow)
    const waveCompleteText = this.add.text(config.width / 2, config.height / 2 - 60, 'Wave Complete', {
        fontSize: `${60 * desktopScaleFactor}px`,
        fill: '#00ff00', // Green color for the text
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // Add current score text with white color (no shadow)
    const currentScoreText = this.add.text(config.width / 2, config.height / 2 + 50, `Current Score: ${killsCount + coinsCount}`, {
        fontSize: `${60 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    let height =0;
    if(isMobile){
        height = config.height / 2 + 170;
    }else{
        height = config.height - 80;
    }
    // Create a green button background (rounded rectangle) at the **bottom center**
    const buttonBg = this.add.rectangle(config.width / 2, height, 230, 70, 0x22aa22, 1)  // Green color for the button
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1);

    // Add "Next Wave" text (no shadow) with white text color
    const nextWaveButton = this.add.text(config.width / 2, height, 'Next Wave', {
        fontSize: `${42 * desktopScaleFactor}px`,
        fill: '#ffffff', // White text color for better contrast
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Make the green button interactive
    buttonBg.on('pointerover', () => {
        buttonBg.setFillStyle(0x006400); // Darker green on hover
    });

    buttonBg.on('pointerout', () => {
        buttonBg.setFillStyle(0x22aa22); // Reset color to green
    });

    buttonBg.on('pointerdown', (pointer) => {
        const xPos = pointer.x;
        const yPos = pointer.y;

        isShootingEnabled = true;
        player.x = xPos;
        player.y = yPos;
        touchStartX = xPos;
        touchStartY = yPos;

        // Destroy UI elements
        uiBox.destroy(); // Remove the transparent black box
        waveCompleteText.destroy();
        currentScoreText.destroy();
        buttonBg.destroy();
        nextWaveButton.destroy();

        // Start the next wave
        spawnEnemies.call(this);
    });
}










function updateScoreText() {
    killsText.setText('Kills: ' + killsCount);
    coinsText.setText('Coins: ' + coinsCount);
}

function restartGame() {
    // Reset game variables

    isGameOver = false;
    // Reset touch input state
    isTouching = false;
    touchStartX = 0;
    touchStartY = 0;
    touchOffsetX = 0;
    touchOffsetY = 0;

    killsCount = 0;
    coinsCount = 0;
    killsThisWave = 0;
    coinsThisWave = 0;
    previousTotalScore = 0;
    waveScore = 0;
    finalScoreToken = '';
    playerLives = 3;
    wave = 1;
    enemiesPerRow = 5;
    rows = 1;
    waveActive = false;
    bossHealth = 30;
    miniBossesSpawned = false;
    combinedBossHealth = bossHealth;
    isShootingEnabled = true;
    laserCount = 1;
    fireRate = 300;
    enemyHealth = 0;
    bossHealthBar = null;
    miniBossLeft = null;
    miniBossRight = null;
    // Clear all game objects
    lasers.clear(true, true);
    enemies.clear(true, true);
    coins.clear(true, true);
    enemyLasers.clear(true, true);

    // Reset timers and events
    this.time.removeAllEvents(); // Stop all Phaser timer events

    // Reset player position and visibility
    player.setPosition(config.width / 2, config.height - 80);
    player.setVisible(true);
    player.setActive(true);
    player.body.enable = true;

    // Reset UI text
    updateScoreText();
    livesText.setText('Lives: ' + playerLives);

    fetchAndDisplayHighScore(this);

    // Reset input
    this.input.setDefaultCursor('none');

    // Start the first wave
    spawnEnemies.call(this);
    console.log("Player Position After Restart:", player.x, player.y);
}

// this.input.setDefaultCursor('default');
function openSettings() {
    if(isGameOver) return;
    posX = player.x;
    posY = player.y;
    inSettings = true;
    isShootingEnabled = false;
    isTouching = false;

    pausedLasers = [];
    // Pause player lasers
    lasers.children.iterate((laser) => {
        pausedLasers.push({
            laser: laser,
            velocityX: laser.body.velocity.x,
            velocityY: laser.body.velocity.y
        });
        laser.setVelocity(0, 0); // Stop the laser
    });

     // Pause enemy lasers
     enemyLasers.children.iterate((laser) => {
        pausedLasers.push({
            laser: laser,
            velocityX: laser.body.velocity.x,
            velocityY: laser.body.velocity.y
        });
        laser.setVelocity(0, 0); // Stop the laser
    });

    // Pause all enemies
    pausedEnemies = []; // Clear the array
    enemies.children.iterate((enemy) => {
        pausedEnemies.push({
            enemy: enemy,
            velocityX: enemy.body.velocity.x,
            velocityY: enemy.body.velocity.y
        });
        enemy.setVelocity(0, 0); // Stop the enemy
    });

    pausedCoins = [];
    coins.children.iterate((coin) => {
        pausedCoins.push({
            coin: coin,
            velocityX: coin.body.velocity.x,
            velocityY: coin.body.velocity.y
        });
        coin.setVelocity(0, 0); // Stop the enemy
    });

    this.input.setDefaultCursor('default');
    // Pause the game
    this.time.paused = true;
    

    // Create a semi-transparent background for the settings overlay
    settingsBackground = this.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        0x000000,
        0.8
    ).setOrigin(0.5).setInteractive();

    // Ensure the background is on top of everything
    settingsBackground.depth = 1000;

    // Add "Settings" title
    settingsTitle = this.add.text(config.width / 2, config.height / 2 - 150, 'Settings', {
        fontSize: `${64 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(1001);

    // Add Player Speed Label
    speedLabel = this.add.text(config.width / 2, config.height / 2 - 50, 'Player Speed', {
        fontSize: `${32 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1001);

    // Add Player Speed Value Display
    speedText = this.add.text(config.width / 2, config.height / 2, `Current Speed: ${playerSpeed}`, {
        fontSize: `${32 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1001);

    // Add Increase Speed Button with Background
    increaseButtonBg = this.add.rectangle(config.width / 2 - 60, config.height / 2 + 50, 80, 50, 0x00ff00, 0.5)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1001);
    increaseButton = this.add.text(config.width / 2 - 60, config.height / 2 + 50, '+', {
        fontSize: `${32 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(1002);

    // Add Decrease Speed Button with Background
    decreaseButtonBg = this.add.rectangle(config.width / 2 + 60, config.height / 2 + 50, 80, 50, 0xff0000, 0.5)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1001);
    decreaseButton = this.add.text(config.width / 2 + 60, config.height / 2 + 50, '-', {
        fontSize: `${32 * desktopScaleFactor}px`,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(1002);

    // Add Resume Button with Background
    resumeButtonBg = this.add.rectangle(config.width / 2, config.height / 2 + 150, 200, 60, 0xffffff, 0.5)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1001);
    resumeButton = this.add.text(config.width / 2, config.height / 2 + 150, 'Resume', {
        fontSize: `${32 * desktopScaleFactor}px`,
        fill: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(1002);

    // Increase Speed Logic
    increaseButtonBg.on('pointerdown', () => {
        console.log('Increase Speed Button Clicked');
        playerSpeed = Math.min(playerSpeed + 1, 10); // Cap speed at 10
        speedText.setText(`Current Speed: ${playerSpeed}`);
    });

    // Decrease Speed Logic
    decreaseButtonBg.on('pointerdown', () => {
        console.log('Decrease Speed Button Clicked');
        playerSpeed = Math.max(playerSpeed - 1, 1); // Minimum speed is 1
        speedText.setText(`Current Speed: ${playerSpeed}`);
    });

    // Resume Game Logic
    resumeButtonBg.on('pointerup', () => {
        console.log(player.x);
        touchStartX = 0; // X position where the touch started
        touchStartY = 0; // Y position where the touch started
        touchOffsetX = 0; // Horizontal offset from the touch start position
        touchOffsetY = 0; // Vertical offset from the touch start position
        player.x = posX;
        player.y = posY;
        inSettings = false;
        this.time.paused = false;
        if(enemies.getChildren().length>0){
            isShootingEnabled = true;
        }
        
        isTouching = false;
        
        // Resume all lasers
        pausedLasers.forEach((laserData) => {
            laserData.laser.setVelocity(laserData.velocityX, laserData.velocityY); // Restore velocity
        });

        // Resume all enemies
        pausedEnemies.forEach((enemyData) => {
            enemyData.enemy.setVelocity(enemyData.velocityX, enemyData.velocityY); // Restore velocity
        });

        pausedCoins.forEach((coinData) => {
            coinData.coin.setVelocity(coinData.velocityX, coinData.velocityY); // Restore velocity
        });
        // Clear the paused arrays
        pausedLasers = [];
        pausedEnemies = [];
        pausedCoins = [];
        settingsBackground.destroy();
        settingsTitle.destroy();
        speedLabel.destroy();
        speedText.destroy();
        increaseButtonBg.destroy();
        increaseButton.destroy();
        decreaseButtonBg.destroy();
        decreaseButton.destroy();
        resumeButtonBg.destroy();
        resumeButton.destroy();

        this.input.setDefaultCursor('none');
    });
}





function update() {
    // Check if the current wave is complete
    if(this.scene.isPaused()) return;
    if(waveActive && enemies.countActive(true) === 0 && (!boss || !boss.active) && coins.getChildren().length === 0 && playerLives>0){
        if(movementEvent){
            movementEvent.remove();
            movementEvent = null;
        }
        waveActive = false;
        wave++;
        let waveScore = calculateWaveScore(killsThisWave, coinsThisWave);
        submitWaveScore(waveScore);
        previousTotalScore += waveScore;
        killsThisWave = 0;
        coinsThisWave = 0;
        enemyHealth = enemyHealth + 1;
        createNextWaveUI.call(this); // Show the "Next Wave" UI
    }

    // Update boss movement and check health
    if (boss && boss.active) {
        // Check if boss health is at 50% and wave is 10 or above
        if (wave >= 9 && boss.health <= bossHealth / 2 && !miniBossesSpawned) {
            spawnMiniBosses.call(this);
        }
    }

    background.tilePositionY -= 6;
    

    if (leftKey.isDown) {
        player.setVelocityX(-600 * playerSpeed);
    } else if (rightKey.isDown) {
        player.setVelocityX(600 * playerSpeed);
    } else {
        player.setVelocityX(0);
    }

    if (upKey.isDown) {
        player.setVelocityY(-600 * playerSpeed); // Move up
    } else if (downKey.isDown) {
        player.setVelocityY(600 * playerSpeed); // Move down
    } else {
        player.setVelocityY(0);
    }


    // Continuous firing while touching the player
    if (isTouching || isSpaceHeld) {
        fireLaser.call(this);
    }

    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        fireLaser.call(this);
    }

    this.physics.overlap(lasers, enemies, hitEnemy, null, this);
    this.physics.overlap(player, coins, collectCoin, null, this);
    this.physics.overlap(player, enemyLasers, hitByEnemyLaser, null, this);
    this.physics.overlap(player, enemies, playerEnemyCollision, null, this);

}


