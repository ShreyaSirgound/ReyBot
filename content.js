console.log("Mini Me content script running");

const miniWrapper = document.createElement("div");
miniWrapper.id = "mini-wrapper";
document.body.appendChild(miniWrapper);

const mini = document.createElement("div");
mini.id = "mini-me";
miniWrapper.appendChild(mini);

const heartsContainer = document.createElement("div");
heartsContainer.id = "hearts-container";
miniWrapper.appendChild(heartsContainer);

const msg_box = document.createElement("div");
msg_box.id = "msg_box";
miniWrapper.appendChild(msg_box);

msg_box.style.position = "absolute";
msg_box.style.bottom = "90%";
msg_box.style.left = "50%";
msg_box.style.transform = "translateX(-50%)";
msg_box.style.transformOrigin = "top center";
msg_box.style.marginBottom = "8px";
msg_box.style.padding = "6px 8px";
msg_box.style.borderRadius = "12px";
msg_box.style.fontSize = "12px";
msg_box.style.fontWeight = 100;
msg_box.style.fontFamily = "sans-serif";
msg_box.style.fontStyle = "italic";
msg_box.style.whiteSpace = "nowrap";
msg_box.style.display = "block";
msg_box.style.zIndex = "1000000";

//creating and updating the theme
/*function applyTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  console.log(isDark);

  if (!isDark) {
    msg_box.style.backgroundColor = "#FAFAF5";
    msg_box.style.color = "#3B2E15";
    msg_box.style.border = "1px solid #3B2E15";
    msg_box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)"; 
  } else {
    msg_box.style.backgroundColor = "#737CBA";
    msg_box.style.color = "#FAFAF5";
    msg_box.style.border = "1px solid #272C4F";
    msg_box.style.boxShadow = "0 2px 6px rgba(255,255,255,0.25)";
  }
}

applyTheme();
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applyTheme);
*/

msg_box.style.backgroundColor = "#737CBA";
msg_box.style.color = "#FAFAF5";
msg_box.style.border = "1px solid #272C4F";
msg_box.style.boxShadow = "0 2px 6px rgba(255,255,255,0.25)";

const animations = {
  idle: {
    sheet: "assets/idle.png",
    frames: 2,
    frameWidth: 64,
    frameHeight: 55,
    speed: 500,
    scale: 2,
    loop: true,
    message: ["hey twin!", "bello", "wassup shawty", "HYDRATE!!!", "..."]
  },
  dance: {
    sheet: "assets/dance.png",
    frames: 5,
    frameWidth: 64,
    frameHeight: 55,
    speed: 150,
    scale: 2,
    loop: true,
    message: ["dance wit me", "╰( ^o^)╮╰( ^o^)╮", "♪₊°♬˚.⁺♪°•♡•°♪﹆"]
  },
  popcorn: {
    sheet: "assets/popcorn.png",
    frames: 2,
    frameWidth: 128,
    frameHeight: 110,
    speed: 800,
    scale: 1,
    loop: true,
    message: ["yum yum"]
  },
  sit_front: {
    sheet: "assets/sit-front.png",
    frames: 2,
    frameWidth: 64,
    frameHeight: 55,
    speed: 4000,
    scale: 2,
    loop: true
  },
  sit_side: {
    sheet: "assets/sit-side.png",
    frames: 2,
    frameWidth: 64,
    frameHeight: 55,
    speed: 4000,
    scale: 2,
    loop: true,
    message: ["hey twin!", "bello", "wassup shawty", "HYDRATE!!!", "..."]
  },
  reading: {
    sheet: "assets/reading.png",
    frames: 2,
    frameWidth: 128,
    frameHeight: 110,
    speed: 2000,
    scale: 1,
    loop: true,
    message: ["study wit me", "let's get that bread", "its grind time", "u got dis shawty", "..."]
  },
  jump: {
    sheet: "assets/jump.png",
    frames: 3,
    frameWidth: 64,
    frameHeight: 55,
    speed: 200,
    scale: 2,
    loop: true,
    message: ["HAIII"]
  },
   sleeping: {
    sheet: "assets/sleeping.png",
    frames: 4,
    frameWidth: 128,
    frameHeight: 110,
    speed: 1000,
    scale: 1,
    loop: true,
    message: ["go to sleep", "take a break twin", "its too late", "..."]
  }
};

const idleAnimations = ["sit_side", "sit_front", "idle"];

let currentAnimation = null;
let animationInterval = null;
let messageInterval = null;
let previousAnimation = null;
let idleRotationInterval = null;

function spawnHearts() {
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "💖";

    heart.style.left = Math.random() * 40 - 20 + "px";
    heart.style.animationDelay = (i * 0.1) + "s";

    heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1200);
  }
}

async function sendMessageToDiscord() {
  const webhookURL = DiscordWebHook;

  await fetch(webhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: "💖 Your mini just sent you love!"
    })
  });
}

function playAnimation(name, maxLoops = null) {
  const anim = animations[name];

  if (!anim) return;

  clearInterval(animationInterval);
  clearInterval(messageInterval);

  currentAnimation = name;

  // constructing the sprite
  mini.style.width = anim.frameWidth * anim.scale + "px";
  mini.style.height = anim.frameHeight * anim.scale + "px";
  mini.style.transform = "none";

  mini.style.transformOrigin = "bottom center";

  mini.style.backgroundImage = `url("${chrome.runtime.getURL(anim.sheet)}")`;
  mini.style.backgroundRepeat = "no-repeat";

  mini.style.backgroundSize = `${anim.frameWidth * anim.frames * anim.scale}px ${anim.frameHeight * anim.scale}px`;

  let frame = 0;
  let loopCount = 0;

  function updateFrame() {
    mini.style.backgroundPosition =
      `-${frame * anim.frameWidth * anim.scale}px 0px`;

    frame++;

    if (frame >= anim.frames) {
      frame = 0;
      loopCount++;

      if (maxLoops !== null && loopCount >= maxLoops) {
        clearInterval(animationInterval);
        playAnimation(previousAnimation || "idle");
      }
    }
  }
  updateFrame();
  animationInterval = setInterval(updateFrame, anim.speed);


  // constructing the message box
  if (anim.message && anim.message.length > 0) {
    function showRandomMessage() {
      const randomMsg =
        anim.message[Math.floor(Math.random() * anim.message.length)];
      msg_box.textContent = randomMsg;
    }
    showRandomMessage();
    messageInterval = setInterval(showRandomMessage, 30000);
  } else {
    msg_box.textContent = "...";
  }
}

function playRandomIdle() {
  const random =
    idleAnimations[Math.floor(Math.random() * idleAnimations.length)];

  playAnimation(random);
}

function checkSiteAndPlay() {
    const host = window.location.hostname;
    const hour = new Date().getHours();

    if (hour >= 23 || hour < 5) {
      playAnimation("sleeping");
      return;
    }

    if (host.includes("youtube.com")) {
      playAnimation("popcorn");
    } else if (host.includes("spotify.com")) {
      playAnimation("dance");
    } else if(host.includes("classroom.google.com")) {
      playAnimation("reading");
    } else {
      playRandomIdle();
      clearInterval(idleRotationInterval);
      idleRotationInterval = setInterval(() => {
        playRandomIdle();
      }, 120000);
    }
}

// Interaction on hover
mini.addEventListener("mouseenter", () => {
  clearInterval(idleRotationInterval);

  if (currentAnimation !== "jump") {
    previousAnimation = currentAnimation;
    playAnimation("jump", 4);
  }

  // Restart idle rotation after jump finishes
  idleRotationInterval = setInterval(() => {
    playRandomIdle();
  }, 120000);
});

//Animation + ping on click
let heartsCooldown = false;

mini.addEventListener("click", () => {
  if (heartsCooldown) return;

  heartsCooldown = true;

  spawnHearts();
  sendMessageToDiscord();

  setTimeout(() => {
    heartsCooldown = false;
  }, 20000); // 10 sec cooldown
});



checkSiteAndPlay();

