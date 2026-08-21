// PLAYER & HUD
const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreDisplay = document.getElementById("score");
const distanceDisplay = document.getElementById("distance");
const highScoreDisplay = document.getElementById("highScore");
const livesDisplay = document.getElementById("lives");

// SOUND SYSTEM

let audioContext = null;

function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.08,
    slideTo = null
) {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    if (slideTo !== null) {

        oscillator.frequency.linearRampToValueAtTime(
            slideTo,
            audioContext.currentTime + duration
        );
    }

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration +
        0.02
    );
}


// COIN SOUND


function playCoinSound() {

    if (!audioContext) return;

    playTone(
        700,
        0.08,
        "sine",
        0.07,
        1100
    );

    setTimeout(function() {

        playTone(
            1000,
            0.08,
            "sine",
            0.05,
            1400
        );

    }, 60);
}


// JUMP SOUND


function playJumpSound() {

    playTone(
        300,
        0.16,
        "triangle",
        0.06,
        650
    );
}


// CRASH SOUND

function playCrashSound() {

    if (!audioContext) return;

    playTone(
        150,
        0.25,
        "sawtooth",
        0.10,
        55
    );

    setTimeout(function() {

        playTone(
            70,
            0.18,
            "square",
            0.06,
            40
        );

    }, 80);
}


// SHIELD SOUND

function playShieldSound() {

    playTone(
        350,
        0.15,
        "sine",
        0.07,
        700
    );

    setTimeout(function() {

        playTone(
            700,
            0.18,
            "sine",
            0.06,
            1100
        );

    }, 100);
}


// MAGNET SOUND

function playMagnetSound() {

    playTone(
        450,
        0.12,
        "triangle",
        0.06,
        800
    );

    setTimeout(function() {

        playTone(
            800,
            0.12,
            "triangle",
            0.05,
            1200
        );

    }, 100);
}


// BOOST SOUND

function playBoostSound() {

    playTone(
        250,
        0.35,
        "sawtooth",
        0.07,
        1000
    );
}


// GAME OVER SOUND

function playGameOverSound() {

    playTone(
        300,
        0.25,
        "sawtooth",
        0.08,
        180
    );

    setTimeout(function() {

        playTone(
            180,
            0.35,
            "sawtooth",
            0.07,
            70
        );

    }, 220);
}


// BUTTON SOUND


function playClickSound() {

    playTone(
        500,
        0.07,
        "square",
        0.04,
        650
    );
}



// COMBO SOUND

function playComboSound(combo) {

    if (!audioContext) return;

    const base =
        500 + Math.min(combo, 10) * 55;

    playTone(
        base,
        0.09,
        "triangle",
        0.07,
        base + 180
    );

    if (combo >= 3) {

        setTimeout(function() {

            playTone(
                base + 250,
                0.10,
                "sine",
                0.06,
                base + 450
            );

        }, 70);
    }
}


// NEAR MISS SOUND

function playNearMissSound() {

    if (!audioContext) return;

    playTone(
        650,
        0.12,
        "triangle",
        0.08,
        1000
    );

    setTimeout(function() {

        playTone(
            900,
            0.10,
            "sine",
            0.06,
            1300
        );

    }, 70);
}


// GAME VARIABLES

let score = 0;
let distance = 0;
let lives = 4;

let playerX = 100;

let speed = 10;

let isJumping = false;

let gameOver = false;
let invincible = false;


// COMBO SYSTEM

let combo = 0;

let comboTimer = null;

let comboDisplay = null;

const COMBO_TIMEOUT = 2500;


// NEAR MISS SYSTEM

const nearMissedObstacles = new Set();


// OBSTACLE SETTINGS

const obstacles = [];

const MIN_OBSTACLE_GAP = 340;
const MAX_OBSTACLE_GAP = 460;


// MIXED OBSTACLE SYSTEM


const obstacleTypes = [

    {
        emoji: "🚧",
        width: 42,
        height: 42,
        fontSize: 42
    },

    {
        emoji: "🪨",
        width: 44,
        height: 42,
        fontSize: 42
    },

    {
        emoji: "🔥",
        width: 40,
        height: 50,
        fontSize: 42
    },

    {
        emoji: "🛸",
        width: 48,
        height: 42,
        fontSize: 40
    },

    {
        emoji: "☄️",
        width: 46,
        height: 46,
        fontSize: 42
    },

    {
        emoji: "👾",
        width: 44,
        height: 45,
        fontSize: 42
    },

    {
        emoji: "⚡",
        width: 40,
        height: 48,
        fontSize: 42
    }
];


let lastObstacleType = -1;
let sameObstacleCount = 0;


// CHOOSE MIXED OBSTACLE


function chooseObstacleType() {

    let availableTypes = [];

    if (distance < 100) {

        availableTypes = [0, 1];

    } else if (distance < 250) {

        availableTypes = [0, 1, 2];

    } else if (distance < 450) {

        availableTypes = [0, 1, 2, 3];

    } else if (distance < 700) {

        availableTypes = [0, 1, 2, 3, 4];

    } else if (distance < 1000) {

        availableTypes = [0, 1, 2, 3, 4, 5];

    } else {

        availableTypes = [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ];
    }


    let selected;

    do {

        selected =
            availableTypes[
                Math.floor(
                    Math.random() *
                    availableTypes.length
                )
            ];

    } while (
        selected === lastObstacleType &&
        sameObstacleCount >= 1 &&
        availableTypes.length > 1
    );


    if (
        selected === lastObstacleType
    ) {

        sameObstacleCount++;

    } else {

        sameObstacleCount = 0;
    }


    lastObstacleType =
        selected;


    return obstacleTypes[selected];
}



// CREATE OBSTACLE

function createObstacle(startX) {

    const type =
        chooseObstacleType();

    const obstacle =
        document.createElement("div");

    obstacle.className =
        "obstacle";

    obstacle.textContent =
        type.emoji;

    obstacle.style.position =
        "absolute";

    obstacle.style.left =
        startX + "px";

    obstacle.style.bottom =
        "20px";

    obstacle.style.width =
        type.width + "px";

    obstacle.style.height =
        type.height + "px";

    obstacle.style.fontSize =
        type.fontSize + "px";

    obstacle.style.lineHeight =
        type.height + "px";

    obstacle.style.textAlign =
        "center";

    obstacle.style.zIndex =
        "5";

    obstacle.style.userSelect =
        "none";

    game.appendChild(
        obstacle
    );

    obstacles.push({

        element: obstacle,

        x: startX,

        type: type
    });
}


// FIRST OBSTACLE


createObstacle(750);

// COINS

const coins = [];


function createCoin(
    startX,
    height
) {

    const coin =
        document.createElement("div");

    coin.className =
        "coin";

    coin.textContent =
        "🪙";

    coin.style.position =
        "absolute";

    coin.style.left =
        startX + "px";

    coin.style.bottom =
        height + "px";

    coin.style.fontSize =
        "35px";

    coin.style.zIndex =
        "6";

    game.appendChild(
        coin
    );

    coins.push({

        element: coin,

        x: startX,

        height: height,

        collected: false
    });
}


// SMART COIN PATTERNS

function createSmartCoinPattern(startX) {

    const pattern =
        Math.random();

    if (pattern < 0.35) {

        createCoin(startX, 90);
        createCoin(startX + 55, 135);
        createCoin(startX + 110, 175);
        createCoin(startX + 165, 135);
        createCoin(startX + 220, 90);

    } else if (pattern < 0.60) {

        createCoin(startX, 85);
        createCoin(startX + 60, 85);
        createCoin(startX + 120, 85);
        createCoin(startX + 180, 85);

    } else if (pattern < 0.80) {

        createCoin(startX, 150);
        createCoin(startX + 60, 190);
        createCoin(startX + 120, 220);
        createCoin(startX + 180, 190);
        createCoin(startX + 240, 150);

    } else {

        createCoin(startX, 100);
        createCoin(startX + 100, 150);
    }
}


createSmartCoinPattern(850);
createSmartCoinPattern(1200);
createSmartCoinPattern(1550);


// POWER-UPS

const powerUps = [];

let shieldActive = false;
let magnetActive = false;
let boostActive = false;

let shieldTimer = null;
let magnetTimer = null;
let boostTimer = null;

let nextShieldDistance = 250;
let nextMagnetDistance = 400;
let nextBoostDistance = 150;


// HIGH SCORE

let highScore =
    Number(
        localStorage.getItem(
            "astroDashHighScore"
        )
    ) || 0;


highScoreDisplay.textContent =
    "BEST: " + highScore;


// CREATE COMBO HUD

function createComboDisplay() {

    comboDisplay =
        document.createElement("div");

    comboDisplay.id =
        "comboDisplay";

    comboDisplay.style.position =
        "absolute";

    comboDisplay.style.top =
        "65px";

    comboDisplay.style.left =
        "50%";

    comboDisplay.style.transform =
        "translateX(-50%)";

    comboDisplay.style.fontSize =
        "24px";

    comboDisplay.style.fontWeight =
        "bold";

    comboDisplay.style.color =
        "#ffd700";

    comboDisplay.style.textShadow =
        "0 0 8px orange, 0 0 18px red";

    comboDisplay.style.zIndex =
        "50";

    comboDisplay.style.pointerEvents =
        "none";

    comboDisplay.style.display =
        "none";

    game.appendChild(
        comboDisplay
    );
}


function updateComboDisplay() {

    if (!comboDisplay) return;

    if (combo < 2) {

        comboDisplay.style.display =
            "none";

        return;
    }

    comboDisplay.style.display =
        "block";

    comboDisplay.textContent =
        "🔥 COMBO x" + combo;
}


// ADD COMBO

function addCombo() {

    combo++;

    updateComboDisplay();

    playComboSound(combo);

    clearTimeout(
        comboTimer
    );

    comboTimer =
        setTimeout(
            function() {

                combo = 0;

                updateComboDisplay();

            },
            COMBO_TIMEOUT
        );
}


// COMBO SCORE

function getComboMultiplier() {

    if (combo < 2) {
        return 1;
    }

    return Math.min(
        combo,
        5
    );
}


// BACKGROUND SYSTEM

let spaceBackground = null;
let currentEnvironment = 0;

const backgroundObjects = [];


function createSpaceBackground() {

    spaceBackground =
        document.createElement("div");

    spaceBackground.className =
        "space-background";

    game.insertBefore(
        spaceBackground,
        player
    );

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        createStar(true);
    }
}


function createStar(initial = false) {

    if (!spaceBackground) return;

    const star =
        document.createElement("div");

    star.className =
        "space-star";

    star.textContent =
        Math.random() > 0.7
            ? "✦"
            : "•";

    const size =
        2 + Math.random() * 4;

    star.style.fontSize =
        size + "px";

    star.style.top =
        (10 + Math.random() * 75) +
        "%";

    star.style.left =
        initial
            ? Math.random() * 800 + "px"
            : "800px";

    star.style.opacity =
        0.3 +
        Math.random() * 0.7;

    spaceBackground.appendChild(
        star
    );

    backgroundObjects.push({

        element: star,

        type: "star",

        x:
            parseFloat(
                star.style.left
            ) || 800
    });
}


function createPlanet() {

    if (!spaceBackground) return;

    const planet =
        document.createElement("div");

    planet.className =
        "space-planet";

    const planets = [
        "🪐",
        "🌕",
        "🌍",
        "🔴",
        "🟣"
    ];

    planet.textContent =
        planets[
            Math.floor(
                Math.random() *
                planets.length
            )
        ];

    planet.style.fontSize =
        (45 +
        Math.random() * 45) +
        "px";

    planet.style.left =
        "850px";

    planet.style.top =
        (30 +
        Math.random() * 40) +
        "%";

    spaceBackground.appendChild(
        planet
    );

    backgroundObjects.push({

        element: planet,

        type: "planet",

        x: 850
    });
}


function moveBackground() {

    backgroundObjects.forEach(
        function(object) {

            if (
                object.type === "star"
            ) {

                object.x -=
                    getObstacleSpeed() *
                    0.45;

                object.element.style.left =
                    object.x + "px";

                if (
                    object.x < -50
                ) {

                    object.x =
                        800 +
                        Math.random() * 100;

                    object.element.style.top =
                        (10 +
                        Math.random() * 75) +
                        "%";
                }
            }

            if (
                object.type === "planet"
            ) {

                object.x -=
                    getObstacleSpeed() *
                    0.18;

                object.element.style.left =
                    object.x + "px";

                if (
                    object.x < -150
                ) {

                    object.element.remove();

                    const index =
                        backgroundObjects.indexOf(
                            object
                        );

                    if (index !== -1) {

                        backgroundObjects.splice(
                            index,
                            1
                        );
                    }
                }
            }
        }
    );
}


// ENVIRONMENT EVERY 100m

function updateEnvironment() {

    const newEnvironment =
        Math.floor(
            distance / 100
        );

    if (
        newEnvironment ===
        currentEnvironment
    ) {

        return;
    }

    currentEnvironment =
        newEnvironment;

    const backgrounds = [

        "#171740",
        "#19345f",
        "#173d68",
        "#193f70",
        "#26345f",
        "#3c315f",
        "#4b315b",
        "#51304d",
        "#542d3d",
        "#642c39",
        "#702c38",
        "#752b43",
        "#63254e",
        "#59275c",
        "#4e2868",
        "#47266d",
        "#39216b",
        "#30206b",
        "#252064",
        "#201c59",
        "#34185c"
    ];

    const index =
        Math.min(
            newEnvironment,
            backgrounds.length - 1
        );

    game.style.background =
        backgrounds[index];

    if (
        newEnvironment % 2 === 0
    ) {

        createStar();
        createStar();
    }

    if (
        distance >= 500 &&
        Math.random() < 0.45
    ) {

        createPlanet();
    }
}


// PLAYER MOVEMENT

document.addEventListener(
    "keydown",
    function(event) {

        if (gameOver) return;

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === " "
        ) {

            event.preventDefault();
        }

        if (
            event.key === "ArrowRight"
        ) {

            playerX += speed;
        }

        if (
            event.key === "ArrowLeft"
        ) {

            playerX -= speed;
        }

        if (
            event.key === " " &&
            !isJumping
        ) {

            initAudio();

            isJumping = true;

            playJumpSound();

            jump();
        }

        if (playerX < 0) {
            playerX = 0;
        }

        if (playerX > 750) {
            playerX = 750;
        }

        player.style.left =
            playerX + "px";
    }
);


document.addEventListener(
    "keydown",
    function() {

        initAudio();

    },
    {
        once: true
    }
);


// JUMP

function jump() {

    let jumpHeight = 0;

    const jumpInterval =
        setInterval(function() {

            if (gameOver) {

                clearInterval(
                    jumpInterval
                );

                return;
            }

            jumpHeight += 18;

            player.style.bottom =
                (20 + jumpHeight) +
                "px";

            if (
                jumpHeight >= 200
            ) {

                clearInterval(
                    jumpInterval
                );

                const fallInterval =
                    setInterval(function() {

                        if (gameOver) {

                            clearInterval(
                                fallInterval
                            );

                            return;
                        }

                        jumpHeight -= 20;

                        player.style.bottom =
                            (20 + jumpHeight) +
                            "px";

                        if (
                            jumpHeight <= 0
                        ) {

                            clearInterval(
                                fallInterval
                            );

                            jumpHeight = 0;

                            player.style.bottom =
                                "20px";

                            isJumping =
                                false;
                        }

                    }, 25);
            }

        }, 25);
}


// OBSTACLE SPEED

function getObstacleSpeed() {

    let currentSpeed =
        5 +
        distance * 0.002;

    currentSpeed =
        Math.min(
            8.5,
            currentSpeed
        );

    if (boostActive) {

        currentSpeed *= 1.45;
    }

    return currentSpeed;
}


// COIN SPEED

function getCoinSpeed() {

    let currentSpeed =
        5 +
        distance * 0.002;

    currentSpeed =
        Math.min(
            8.5,
            currentSpeed
        );

    if (boostActive) {

        currentSpeed *= 1.45;
    }

    return currentSpeed;
}


// FARTHEST OBSTACLE

function getFarthestObstacle() {

    let farthestX = 750;

    obstacles.forEach(
        function(obstacle) {

            if (
                obstacle.x >
                farthestX
            ) {

                farthestX =
                    obstacle.x;
            }
        }
    );

    return farthestX;
}


// ==========================================
// SMART GAP
// ==========================================

function getSmartGap() {

    const difficulty =
        Math.min(
            distance / 1200,
            1
        );

    const minimum =
        MIN_OBSTACLE_GAP -
        difficulty * 20;

    const maximum =
        MAX_OBSTACLE_GAP -
        difficulty * 30;

    return (
        minimum +
        Math.random() *
        (maximum - minimum)
    );
}


// ==========================================
// SAFE OBSTACLE POSITION
// ==========================================

function getSafeObstaclePosition() {

    const farthest =
        getFarthestObstacle();

    return (
        farthest +
        getSmartGap()
    );
}


// ==========================================
// MOVE OBSTACLES
// ==========================================

function moveObstacles() {

    const obstacleSpeed =
        getObstacleSpeed();

    obstacles.forEach(
        function(obstacle) {

            obstacle.x -=
                obstacleSpeed;

            if (
                obstacle.x < -80
            ) {

                obstacle.x =
                    getSafeObstaclePosition();

                changeObstacleType(
                    obstacle
                );

                nearMissedObstacles.delete(
                    obstacle
                );
            }

            obstacle.element.style.left =
                obstacle.x + "px";
        }
    );
}


// ==========================================
// CHANGE OBSTACLE TYPE
// ==========================================

function changeObstacleType(obstacle) {

    const type =
        chooseObstacleType();

    obstacle.type =
        type;

    obstacle.element.textContent =
        type.emoji;

    obstacle.element.style.width =
        type.width + "px";

    obstacle.element.style.height =
        type.height + "px";

    obstacle.element.style.fontSize =
        type.fontSize + "px";

    obstacle.element.style.lineHeight =
        type.height + "px";
}


// ==========================================
// FIX OBSTACLE SPACING
// ==========================================

function fixObstacleSpacing() {

    if (
        obstacles.length < 2
    ) {

        return;
    }

    const sorted =
        [...obstacles].sort(
            function(a, b) {

                return a.x - b.x;
            }
        );

    for (
        let i = 1;
        i < sorted.length;
        i++
    ) {

        const previous =
            sorted[i - 1];

        const current =
            sorted[i];

        if (
            current.x -
            previous.x <
            MIN_OBSTACLE_GAP
        ) {

            current.x =
                previous.x +
                MIN_OBSTACLE_GAP;
        }
    }
}


// ==========================================
// NEAR MISS DETECTION
// ==========================================

function checkNearMiss() {

    if (gameOver) return;

    const playerRect =
        player.getBoundingClientRect();

    obstacles.forEach(
        function(obstacle) {

            if (
                nearMissedObstacles.has(
                    obstacle
                )
            ) {

                return;
            }

            const obstacleRect =
                obstacle.element
                    .getBoundingClientRect();


            // Obstacle must be close horizontally

            const horizontalDistance =
                Math.min(
                    Math.abs(
                        playerRect.right -
                        obstacleRect.left
                    ),
                    Math.abs(
                        obstacleRect.right -
                        playerRect.left
                    )
                );


            // Player must be safely above obstacle

            const playerIsAbove =
                playerRect.bottom <=
                obstacleRect.top + 15;


            // Obstacle is near player

            const obstacleIsNear =
                horizontalDistance >= 0 &&
                horizontalDistance < 28;


            if (
                obstacleIsNear &&
                playerIsAbove &&
                isJumping
            ) {

                nearMissedObstacles.add(
                    obstacle
                );

                score += 25;

                scoreDisplay.textContent =
                    "SCORE: " + score;

                playNearMissSound();

                addCombo();

                showFloatingText(
                    "🔥 NEAR MISS +25"
                );

                updateHighScore();
            }
        }
    );
}


// ==========================================
// FLOATING TEXT
// ==========================================

function showFloatingText(text) {

    const popup =
        document.createElement("div");

    popup.textContent =
        text;

    popup.style.position =
        "absolute";

    popup.style.left =
        "50%";

    popup.style.top =
        "40%";

    popup.style.transform =
        "translateX(-50%)";

    popup.style.fontSize =
        "22px";

    popup.style.fontWeight =
        "bold";

    popup.style.color =
        "#ffd700";

    popup.style.textShadow =
        "0 0 10px orange";

    popup.style.zIndex =
        "90";

    popup.style.pointerEvents =
        "none";

    game.appendChild(
        popup
    );


    let opacity = 1;

    let y = 0;


    const animation =
        setInterval(
            function() {

                y -= 1;

                opacity -= 0.035;

                popup.style.transform =
                    "translate(-50%, " +
                    y +
                    "px)";

                popup.style.opacity =
                    opacity;

                if (
                    opacity <= 0
                ) {

                    clearInterval(
                        animation
                    );

                    popup.remove();
                }

            },
            25
        );
}


// ==========================================
// MOVE COINS
// ==========================================

function moveCoins() {

    const coinSpeed =
        getCoinSpeed();

    coins.forEach(
        function(coin) {

            coin.x -=
                coinSpeed;

            if (
                magnetActive &&
                !coin.collected
            ) {

                const playerRect =
                    player.getBoundingClientRect();

                const coinRect =
                    coin.element
                        .getBoundingClientRect();

                const playerCenter =
                    playerRect.left +
                    playerRect.width / 2;

                const coinCenter =
                    coinRect.left +
                    coinRect.width / 2;

                const distanceFromPlayer =
                    Math.abs(
                        coinCenter -
                        playerCenter
                    );

                if (
                    distanceFromPlayer < 200
                ) {

                    if (
                        coinCenter >
                        playerCenter
                    ) {

                        coin.x -= 7;

                    } else {

                        coin.x += 7;
                    }
                }
            }

            if (
                coin.x < -60
            ) {

                resetCoin(coin);
            }

            coin.element.style.left =
                coin.x + "px";
        }
    );
}


// ==========================================
// RESET COIN
// ==========================================

function resetCoin(coin) {

    let farthestCoinX = 800;

    coins.forEach(
        function(other) {

            if (
                other !== coin &&
                other.x >
                farthestCoinX
            ) {

                farthestCoinX =
                    other.x;
            }
        }
    );

    coin.x =
        farthestCoinX +
        180 +
        Math.random() * 120;

    coin.height =
        85 +
        Math.random() * 120;

    coin.element.style.bottom =
        coin.height + "px";

    coin.collected =
        false;

    coin.element.style.display =
        "block";
}


// ==========================================
// CREATE POWER-UP
// ==========================================

function createPowerUp(
    startX,
    type
) {

    const powerUp =
        document.createElement("div");

    powerUp.className =
        "power-up";

    if (type === "shield") {
        powerUp.textContent =
            "🛡️";
    }

    if (type === "magnet") {
        powerUp.textContent =
            "🧲";
    }

    if (type === "boost") {
        powerUp.textContent =
            "⚡";
    }

    powerUp.style.position =
        "absolute";

    powerUp.style.left =
        startX + "px";

    powerUp.style.bottom =
        "130px";

    powerUp.style.fontSize =
        "38px";

    powerUp.style.zIndex =
        "8";

    powerUp.style.filter =
        "drop-shadow(0 0 7px white)";

    game.appendChild(
        powerUp
    );

    powerUps.push({

        element: powerUp,

        x: startX,

        type: type,

        collected: false
    });
}


// ==========================================
// MOVE POWER-UPS
// ==========================================

function movePowerUps() {

    const powerUpSpeed =
        getCoinSpeed();

    powerUps.forEach(
        function(powerUp) {

            powerUp.x -=
                powerUpSpeed;

            if (
                powerUp.x < -80
            ) {

                powerUp.element.style.display =
                    "none";

                powerUp.collected =
                    true;
            }

            powerUp.element.style.left =
                powerUp.x + "px";
        }
    );
}


// ==========================================
// OBSTACLE COLLISION
// ==========================================

function checkObstacleCollision() {

    if (invincible) return;

    const playerRect =
        player.getBoundingClientRect();

    obstacles.forEach(
        function(obstacle) {

            const obstacleRect =
                obstacle.element
                    .getBoundingClientRect();

            const playerPaddingX = 8;
            const playerPaddingY = 6;

            const obstaclePaddingX = 6;
            const obstaclePaddingY = 5;

            const collision =

                playerRect.left +
                    playerPaddingX
                <
                obstacleRect.right -
                    obstaclePaddingX

                &&

                playerRect.right -
                    playerPaddingX
                >
                obstacleRect.left +
                    obstaclePaddingX

                &&

                playerRect.top +
                    playerPaddingY
                <
                obstacleRect.bottom -
                    obstaclePaddingY

                &&

                playerRect.bottom -
                    playerPaddingY
                >
                obstacleRect.top +
                    obstaclePaddingY;

            if (collision) {

                loseLife(
                    obstacle
                );
            }
        }
    );
}


// ==========================================
// COIN COLLISION
// ==========================================

function checkCoinCollision() {

    const playerRect =
        player.getBoundingClientRect();

    coins.forEach(
        function(coin) {

            if (
                coin.collected
            ) {

                return;
            }

            const coinRect =
                coin.element
                    .getBoundingClientRect();

            const collected =

                playerRect.left <
                coinRect.right

                &&

                playerRect.right >
                coinRect.left

                &&

                playerRect.top <
                coinRect.bottom

                &&

                playerRect.bottom >
                coinRect.top;

            if (collected) {

                collectCoin(
                    coin
                );
            }
        }
    );
}


// ==========================================
// COLLECT COIN
// ==========================================

function collectCoin(coin) {

    coin.collected =
        true;

    coin.element.style.display =
        "none";


    // BUILD COMBO

    addCombo();


    // COMBO SCORE

    const multiplier =
        getComboMultiplier();


    const points =
        10 * multiplier;


    score +=
        points;


    scoreDisplay.textContent =
        "SCORE: " + score;


    playCoinSound();


    if (
        combo >= 2
    ) {

        showFloatingText(
            "🔥 x" +
            multiplier +
            " +" +
            points
        );
    }


    updateHighScore();


    setTimeout(
        function() {

            if (!gameOver) {

                resetCoin(
                    coin
                );
            }

        },
        300
    );
}


// ==========================================
// HIGH SCORE UPDATE
// ==========================================

function updateHighScore() {

    if (
        score > highScore
    ) {

        highScore =
            score;

        localStorage.setItem(
            "astroDashHighScore",
            highScore
        );

        highScoreDisplay.textContent =
            "BEST: " + highScore;
    }
}


// ==========================================
// POWER-UP COLLISION
// ==========================================

function checkPowerUpCollision() {

    const playerRect =
        player.getBoundingClientRect();

    powerUps.forEach(
        function(powerUp) {

            if (
                powerUp.collected
            ) {

                return;
            }

            const powerUpRect =
                powerUp.element
                    .getBoundingClientRect();

            const collected =

                playerRect.left <
                powerUpRect.right

                &&

                playerRect.right >
                powerUpRect.left

                &&

                playerRect.top <
                powerUpRect.bottom

                &&

                playerRect.bottom >
                powerUpRect.top;

            if (collected) {

                collectPowerUp(
                    powerUp
                );
            }
        }
    );
}


// ==========================================
// COLLECT POWER-UP
// ==========================================

function collectPowerUp(powerUp) {

    powerUp.collected =
        true;

    powerUp.element.style.display =
        "none";

    if (
        powerUp.type === "shield"
    ) {

        activateShield();
    }

    if (
        powerUp.type === "magnet"
    ) {

        activateMagnet();
    }

    if (
        powerUp.type === "boost"
    ) {

        activateBoost();
    }
}


// ==========================================
// SHIELD
// ==========================================

function activateShield() {

    shieldActive = true;

    clearTimeout(
        shieldTimer
    );

    playShieldSound();

    player.style.filter =
        "drop-shadow(0 0 14px cyan)";

    shieldTimer =
        setTimeout(
            function() {

                shieldActive =
                    false;

                player.style.filter =
                    "";

            },
            7000
        );
}


// ==========================================
// MAGNET
// ==========================================

function activateMagnet() {

    magnetActive = true;

    clearTimeout(
        magnetTimer
    );

    playMagnetSound();

    player.style.filter =
        "drop-shadow(0 0 14px gold)";

    magnetTimer =
        setTimeout(
            function() {

                magnetActive =
                    false;

                player.style.filter =
                    "";

            },
            6000
        );
}


// ==========================================
// BOOST
// ==========================================

function activateBoost() {

    boostActive = true;

    clearTimeout(
        boostTimer
    );

    playBoostSound();

    player.style.filter =
        "drop-shadow(0 0 16px orange)";

    boostTimer =
        setTimeout(
            function() {

                boostActive =
                    false;

                player.style.filter =
                    "";

            },
            4000
        );
}


// ==========================================
// POWER-UP SPAWNING
// ==========================================

function updatePowerUps() {

    if (
        distance >=
        nextBoostDistance
    ) {

        spawnPowerUpAhead(
            "boost"
        );

        nextBoostDistance +=
            280 +
            Math.random() * 100;
    }

    if (
        distance >=
        nextShieldDistance
    ) {

        spawnPowerUpAhead(
            "shield"
        );

        nextShieldDistance +=
            550 +
            Math.random() * 200;
    }

    if (
        distance >=
        nextMagnetDistance
    ) {

        spawnPowerUpAhead(
            "magnet"
        );

        nextMagnetDistance +=
            600 +
            Math.random() * 250;
    }
}


// ==========================================
// SPAWN POWER-UP
// ==========================================

function spawnPowerUpAhead(type) {

    let farthestX =
        1400;

    obstacles.forEach(
        function(obstacle) {

            if (
                obstacle.x >
                farthestX
            ) {

                farthestX =
                    obstacle.x;
            }
        }
    );

    powerUps.forEach(
        function(powerUp) {

            if (
                !powerUp.collected &&
                powerUp.x >
                farthestX
            ) {

                farthestX =
                    powerUp.x;
            }
        }
    );

    const spawnX =
        farthestX +
        500 +
        Math.random() * 300;

    createPowerUp(
        spawnX,
        type
    );
}


// ==========================================
// DIFFICULTY
// ==========================================

function updateDifficulty() {

    if (
        distance >= 40 &&
        obstacles.length < 2
    ) {

        createObstacle(
            getSafeObstaclePosition()
        );
    }

    if (
        distance >= 120 &&
        obstacles.length < 3
    ) {

        createObstacle(
            getSafeObstaclePosition()
        );
    }
}


// ==========================================
// LOSE LIFE
// ==========================================

function loseLife(
    hitObstacle
) {

    if (
        invincible ||
        gameOver
    ) {

        return;
    }


    // BREAK COMBO

    combo = 0;

    clearTimeout(
        comboTimer
    );

    updateComboDisplay();


    // SHIELD

    if (shieldActive) {

        shieldActive =
            false;

        clearTimeout(
            shieldTimer
        );

        player.style.filter =
            "";

        playCrashSound();

        invincible =
            true;

        if (hitObstacle) {

            hitObstacle.x =
                getSafeObstaclePosition();

            changeObstacleType(
                hitObstacle
            );
        }

        setTimeout(
            function() {

                invincible =
                    false;

            },
            800
        );

        return;
    }


    // NORMAL HIT

    lives--;

    updateLives();

    playCrashSound();

    invincible =
        true;

    player.style.opacity =
        "0.35";

    if (hitObstacle) {

        hitObstacle.x =
            getSafeObstaclePosition();

        changeObstacleType(
            hitObstacle
        );
    }

    setTimeout(
        function() {

            player.style.opacity =
                "1";

            invincible =
                false;

        },
        1200
    );

    if (
        lives <= 0
    ) {

        endGame();
    }
}


// ==========================================
// UPDATE LIVES
// ==========================================

function updateLives() {

    livesDisplay.textContent =
        "❤️ ".repeat(lives) +
        "🖤 ".repeat(4 - lives);
}


// ==========================================
// DISTANCE
// ==========================================

function updateDistance() {

    distance +=
        0.08;

    distanceDisplay.textContent =
        "DISTANCE: " +
        Math.floor(distance) +
        "m";
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameOver =
        true;

    clearTimeout(
        comboTimer
    );

    playGameOverSound();

    const screen =
        document.createElement("div");

    screen.style.position =
        "absolute";

    screen.style.inset =
        "0";

    screen.style.background =
        "rgba(0,0,0,0.88)";

    screen.style.display =
        "flex";

    screen.style.flexDirection =
        "column";

    screen.style.justifyContent =
        "center";

    screen.style.alignItems =
        "center";

    screen.style.zIndex =
        "100";

    screen.innerHTML = `

        <div style="
            font-size:42px;
            font-weight:bold;
            margin-bottom:20px;
        ">
            💥 GAME OVER
        </div>

        <div style="
            font-size:22px;
            margin-bottom:10px;
        ">
            SCORE: ${score}
        </div>

        <div style="
            font-size:22px;
            margin-bottom:25px;
        ">
            DISTANCE: ${Math.floor(distance)}m
        </div>

        <button id="restartButton" style="
            font-size:18px;
            padding:12px 28px;
            border:none;
            border-radius:10px;
            cursor:pointer;
        ">
            🚀 PLAY AGAIN
        </button>
    `;

    game.appendChild(
        screen
    );

    document
        .getElementById(
            "restartButton"
        )
        .addEventListener(
            "click",
            function() {

                initAudio();

                playClickSound();

                location.reload();
            }
        );
}


// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop() {

    if (gameOver) {

        return;
    }

    moveObstacles();

    fixObstacleSpacing();

    moveCoins();

    movePowerUps();

    moveBackground();

    checkObstacleCollision();

    checkNearMiss();

    checkCoinCollision();

    checkPowerUpCollision();

    updateDistance();

    updateDifficulty();

    updatePowerUps();

    updateEnvironment();

    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// START GAME
// ==========================================

createSpaceBackground();

createComboDisplay();

updateLives();

gameLoop();
// ==========================================
// 📱 MOBILE CONTROLS - ASTRO DASH
// ==========================================

(function setupMobileControls() {

    const mobileControls =
        document.createElement("div");

    mobileControls.id = "mobileControls";

    mobileControls.innerHTML = `
        <button id="mobileLeft">⬅️</button>
        <button id="mobileJump">🚀</button>
        <button id="mobileRight">➡️</button>
    `;

    document.body.appendChild(mobileControls);


    const leftButton =
        document.getElementById("mobileLeft");

    const rightButton =
        document.getElementById("mobileRight");

    const jumpButton =
        document.getElementById("mobileJump");


    // ==========================================
    // MOVE LEFT
    // ==========================================

    function moveLeft() {

        if (gameOver) return;

        playerX -= speed;

        if (playerX < 0) {
            playerX = 0;
        }

        player.style.left =
            playerX + "px";
    }


    // ==========================================
    // MOVE RIGHT
    // ==========================================

    function moveRight() {

        if (gameOver) return;

        playerX += speed;

        if (playerX > 750) {
            playerX = 750;
        }

        player.style.left =
            playerX + "px";
    }


    // ==========================================
    // JUMP
    // ==========================================

    function mobileJump() {

        if (
            gameOver ||
            isJumping
        ) {
            return;
        }

        initAudio();

        isJumping = true;

        playJumpSound();

        jump();
    }


    // ==========================================
    // UNIVERSAL MOBILE BUTTON
    // Supports phones + tablets + mouse
    // ==========================================

    function setupButton(button, action) {

        button.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                initAudio();

                action();

            },
            {
                passive: false
            }
        );


        button.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

            }
        );
    }


    setupButton(
        leftButton,
        moveLeft
    );

    setupButton(
        rightButton,
        moveRight
    );

    setupButton(
        jumpButton,
        mobileJump
    );


    // ==========================================
    // PHONE SCREEN SCALING
    // ==========================================

    function resizeGameForPhone() {

        const width =
            window.visualViewport
                ? window.visualViewport.width
                : window.innerWidth;

        const height =
            window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;


        // PC
        if (width > 600) {

            game.style.transform = "";
            game.style.transformOrigin = "";
            game.style.marginBottom = "";

            return;
        }


        // Space around the game
        const availableWidth =
            width - 10;


        // Scale 800px game to phone width
        let scale =
            availableWidth / 800;


        scale =
            Math.min(scale, 1);


        // Prevent extremely tiny game
        scale =
            Math.max(scale, 0.42);


        game.style.transform =
            "scale(" + scale + ")";

        game.style.transformOrigin =
            "top center";


        // Remove the unwanted blank area
        game.style.marginBottom =
            -(430 * (1 - scale)) + "px";


        // Keep game centered
        game.style.marginLeft =
            "auto";

        game.style.marginRight =
            "auto";
    }


    window.addEventListener(
        "resize",
        resizeGameForPhone
    );


    window.addEventListener(
        "orientationchange",
        function() {

            setTimeout(
                resizeGameForPhone,
                300
            );

        }
    );


    if (window.visualViewport) {

        window.visualViewport.addEventListener(
            "resize",
            resizeGameForPhone
        );
    }


    // Initial scaling
    resizeGameForPhone();


})();