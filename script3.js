let gameOver = true;
let score = 0;
let highScore = 0;
let audioJump = document.getElementById("audioJump");
let audioFall = document.getElementById("audioFall");

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// // width and height of each platform and where platforms start
const platformWidth = 65;
const platformHeight = 20;
const platformStart = canvas.height - 50;

// // player physics
const gravity = 0.33;
const drag = 0.3;
const bounceVelocity = -12.5;

// // minimum and maximum vertical space between each platform
let minPlatformSpace = 30;
let maxPlatformSpace = 50;

// // information about each platform. the first platform starts in the
// // bottom middle of the screen
let platforms = [
  {
    x: canvas.width / 2 - platformWidth / 2,
    y: platformStart,
  },
];

// // get a random number between the min (inclusive) and max (exclusive)
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// // fill the initial screen with platforms
let y = platformStart;
while (y > 0) {
  // the next platform can be placed above the previous one with a space
  // somewhere between the min and max space
  y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

  // a platform can be placed anywhere 25px from the left edge of the canvas
  // and 25px from the right edge of the canvas (taking into account platform
  // width).
  // however the first few platforms cannot be placed in the center so
  // that the player will bounce up and down without going up the screen
  // until they are ready to move
  let x;
  do {
    x = random(25, canvas.width - 25 - platformWidth);
  } while (
    y > canvas.height / 2 &&
    x > canvas.width / 2 - platformWidth * 1.5 &&
    x < canvas.width / 2 + platformWidth / 2
  );

  platforms.push({ x, y });
}

// // the doodle jumper
const doodle = {
  width: 50,
  height: 60,
  x: canvas.width / 2 - 20,
  y: platformStart - 60,

  // velocity
  dx: 0,
  dy: 0,
};

// // keep track of player direction and actions
let playerDir = 0;
let keydown = false;
let prevDoodleY = doodle.y;

function startMenu() {
  const bgstart = new Image();
  bgstart.onload = drawbgstart;
  bgstart.src = "background.png";

  function drawbgstart() {
    const ctx = document.querySelector("canvas").getContext("2d");
    ctx.drawImage(bgstart, 0, 0, 400, 667);
    context.font = "60px Comic Sans MS";
    context.fillText("Start", canvas.width / 3, 275);
    context.font = "30px Comic Sans MS";
    context.fillText("Score: " + score, canvas.width / 3, 325);
    context.font = "20px Comic Sans MS";
    context.fillText("High Score: " + highScore, canvas.width / 3, 360);
    context.font = "25px Comic Sans MS";
    context.fillText("Right Click To Start Game!", canvas.width / 6, 500);
    context.fillStyle = "black";
  }
  drawbgstart();
}

// fill the screen with platforms
function setupPlatforms() {
  platforms = [{ x: canvas.width / 2 - platformWidth / 2, y: platformStart }];

  let y = platformStart;
  while (y > 0) {
    y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

    let x;
    do {
      x = random(25, canvas.width - 25 - platformWidth);
    } while (
      y > canvas.height / 2 &&
      x > canvas.width / 2 - platformWidth * 1.5 &&
      x < canvas.width / 2 + platformWidth / 2
    );

    platforms.push({ x, y });
  }
}

setupPlatforms();

function restart() {
  // Reset variables
  gameOver = false;
  score = 0;
  minPlatformSpace = 30;
  maxPlatformSpace = 50;
  doodle.x = canvas.width / 2 - 20;
  doodle.y = platformStart - 70;
  doodle.dx = 0;
  doodle.dy = 0; // reset doodle velocity

  setupPlatforms();

  // Start game loop
  loop();
}

function removeClickListener() {
  document.removeEventListener("click", clickHandler);
}

function clickHandler() {
  if (gameOver == true) {
    restart();
  }
}

document.addEventListener("click", clickHandler);

// game loop
function loop() {
  if (gameOver == false) {
    removeClickListener();
    //Setup and Start Game
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // draw bg while playing
    const bgplay = new Image();
    bgplay.onload = drawBgPlay;
    bgplay.src = "bgsky.jpeg";

    function drawBgPlay() {
      const ctx = document.querySelector("canvas").getContext("2d");
      ctx.drawImage(bgplay, 0, 0, 400, 667);
      context.font = "25px Comic Sans MS";
      context.fillStyle = "white";
      context.fillText("Score: " + score, 10, 25);
    }
    drawBgPlay();
    // apply gravity to doodle
    doodle.dy += gravity;

    // if doodle reaches the middle of the screen, move the platforms down
    // instead of doodle up to make it look like doodle is going up
    if (doodle.y < canvas.height / 2 && doodle.dy < 0) {
      platforms.forEach(function (platform) {
        platform.y += -doodle.dy;
      });

      // add more platforms to the top of the screen as doodle moves up
      while (platforms[platforms.length - 1].y > 0) {
        score++;
        platforms.push({
          x: random(25, canvas.width - 25 - platformWidth),
          y:
            platforms[platforms.length - 1].y -
            (platformHeight + random(minPlatformSpace, maxPlatformSpace)),
        });

        // add a bit to the min/max platform space as the player goes up
        minPlatformSpace += 0.5;
        maxPlatformSpace += 0.5;

        // cap max space
        maxPlatformSpace = Math.min(maxPlatformSpace, canvas.height / 2);
      }
    } else {
      doodle.y += doodle.dy;
    }

    // only apply drag to horizontal movement if key is not pressed
    if (!keydown) {
      if (playerDir < 0) {
        doodle.dx += drag;

        // don't let dx go above 0
        if (doodle.dx > 0) {
          doodle.dx = 0;
          playerDir = 0;
        }
      } else if (playerDir > 0) {
        doodle.dx -= drag;

        if (doodle.dx < 0) {
          doodle.dx = 0;
          playerDir = 0;
        }
      }
    }

    doodle.x += doodle.dx;

    // make doodle wrap the screen
    if (doodle.x + doodle.width < 0) {
      doodle.x = canvas.width;
    } else if (doodle.x > canvas.width) {
      doodle.x = -doodle.width;
    }

    // draw platforms
    platforms.forEach(function (platform) {
      const imgplatform = new Image();
      imgplatform.onload = drawDoodler;
      imgplatform.src = "platform.png";

      function drawPlatforms() {
        const ctxp = document.querySelector("canvas").getContext("2d");
        ctxp.drawImage(
          imgplatform,
          platform.x,
          platform.y,
          platformWidth,
          platformHeight
        );
      }
      drawPlatforms();

      // make doodle jump if it collides with a platform from above
      if (
        // doodle is falling
        doodle.dy > 0 &&
        // doodle was previous above the platform
        prevDoodleY + doodle.height <= platform.y &&
        // doodle collides with platform
        // (Axis Aligned Bounding Box [AABB] collision check)
        doodle.x < platform.x + platformWidth &&
        doodle.x + doodle.width > platform.x &&
        doodle.y < platform.y + platformHeight &&
        doodle.y + doodle.height > platform.y
      ) {
        // reset doodle position so it's on top of the platform
        doodle.y = platform.y - doodle.height;
        doodle.dy = bounceVelocity;
        audioJump.play();
      }
    });

    // draw doodle
    const img = new Image();
    img.onload = drawDoodler;
    img.src = "doodler-guy.png";

    function drawDoodler() {
      const ctx = document.querySelector("canvas").getContext("2d");
      ctx.drawImage(img, doodle.x, doodle.y, doodle.width, doodle.height);
    }
    drawDoodler();

    prevDoodleY = doodle.y;

    // remove any platforms that have gone offscreen
    platforms = platforms.filter(function (platform) {
      return platform.y < canvas.height;
    });

    if (doodle.dy > platformHeight) {
      audioFall.play();
      if (score > highScore) {
        highScore = score;
      }
      gameOver = true;
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  } else if (gameOver == true) {
    // Create Start Menu
    document.addEventListener("click", clickHandler);
    startMenu();
  }
}
requestAnimationFrame(loop);

// listen to keyboard events to move doodle
document.addEventListener("keydown", function (e) {
  // left arrow key
  if (e.key === "ArrowLeft") {
    keydown = true;
    playerDir = -1;
    doodle.dx = -3;
  }
  // right arrow key
  else if (e.key === "ArrowRight") {
    keydown = true;
    playerDir = 1;
    doodle.dx = 3;
  }
});

document.addEventListener("keyup", function (e) {
  keydown = false;
});
