let video, detector;
let poses = [];
let img; // 用來儲存圖片

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

function preload() {
  // 預加載圖片
  img = loadImage('upload_9fe25d6f9e04fbad0e1a036edc97e38c.gif', img => {
    console.log("Image loaded successfully");
  }, () => {
    console.error("Failed to load image");
  });
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // flip horizontal
  let cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // shoulder to wrist
    for (let j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        let partA = pose.keypoints[j];
        let partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
    // shoulder to shoulder
    let partA = pose.keypoints[5];
    let partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // shoulders to hips
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // hip to foot
    for (let j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        let partA = pose.keypoints[j];
        let partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }

    // 在左肘和右肘顯示圖片
    let leftElbow = pose.keypoints[7];
    let rightElbow = pose.keypoints[8];
    if (leftElbow.score > 0.1) {
      image(img, leftElbow.x - img.width / 2, leftElbow.y - img.height / 2, 50, 50); // 調整圖片大小
    }
    if (rightElbow.score > 0.1) {
      image(img, rightElbow.x - img.width / 2, rightElbow.y - img.height / 2, 50, 50); // 調整圖片大小
    }
  }
}
