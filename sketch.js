let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = ""; // 儲存手勢類型

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 Facemesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture(); // 偵測手勢
  });
}

function modelReady() {
  console.log("Model Loaded!");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let targetPoint;
    if (gesture === "rock") {
      // 石頭 -> 額頭
      targetPoint = keypoints[10]; // 額頭點
    } else if (gesture === "scissors") {
      // 剪刀 -> 左右眼睛
      targetPoint = keypoints[159]; // 左眼
    } else if (gesture === "paper") {
      // 布 -> 左右臉頰
      targetPoint = keypoints[234]; // 左臉頰
    } else {
      // 未偵測到手勢 -> 鼻子
      targetPoint = keypoints[1]; // 鼻子點
    }

    if (targetPoint) {
      const [x, y] = targetPoint;
      noFill();
      stroke(255, 0, 0);
      strokeWeight(2); // 縮小圈圈的邊框粗細
      ellipse(x, y, 50, 50); // 縮小圈圈的大小
    }
  }
}

// 偵測手勢
function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 偵測簡單的剪刀石頭布手勢
    const thumbTip = landmarks[4]; // 大拇指尖端
    const indexTip = landmarks[8]; // 食指尖端
    const middleTip = landmarks[12]; // 中指尖端

    const distanceThumbIndex = dist(
      thumbTip[0],
      thumbTip[1],
      indexTip[0],
      indexTip[1]
    );
    const distanceIndexMiddle = dist(
      indexTip[0],
      indexTip[1],
      middleTip[0],
      middleTip[1]
    );

    if (distanceThumbIndex < 30 && distanceIndexMiddle < 30) {
      gesture = "rock"; // 石頭
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle > 50) {
      gesture = "paper"; // 布
    } else {
      gesture = "scissors"; // 剪刀
    }
  }
}
