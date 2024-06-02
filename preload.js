// In the preload script.
const { ipcRenderer } = require("electron");

ipcRenderer.on("SET_SOURCE", async (event, screen, sourceId) => {
  console.log(screen, sourceId);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      },
    });
    handleStream(stream);
  } catch (e) {
    handleError(e);
  }
});

function handleStream(stream) {
  console.log(stream);

  const audioTrack = stream.getAudioTracks()[0];

  // Create an AudioContext
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create a MediaStreamSource from the audio track
  const mediaStreamSource = audioContext.createMediaStreamSource(
    new MediaStream([audioTrack])
  );

  // Create an AnalyserNode
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 32;

  // Connect the media stream source to the analyser
  mediaStreamSource.connect(analyser);

  // Get the canvas element
  const canvas = document.getElementById("graph");
  const canvasCtx = canvas.getContext("2d");

  // Set up the canvas dimensions
  const WIDTH = document.documentElement.clientWidth;
  const HEIGHT = document.documentElement.clientHeight;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // Function to draw the audio data
  /*function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    dataArray = dataArray.toReversed();

    canvasCtx.fillStyle = "rgb(255, 255, 255)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    let lastX = 0;
    let lastY = centerY - (dataArray[0] / 255.0) * centerY;
    for (let i = 1; i < bufferLength; i++) {
      const value = (dataArray[i] / 255.0) * centerY;
      const x = (i / (bufferLength * 2 - 1)) * WIDTH;
      const y = centerY - value;

      canvasCtx.beginPath();
      canvasCtx.moveTo(lastX, lastY);
      canvasCtx.lineTo(x, y);
      canvasCtx.strokeStyle = `rgb(0, 0, 0)`;
      canvasCtx.stroke();

      lastX = x;
      lastY = y;
    }

    dataArray = dataArray.toReversed();
    for (let i = 1; i < bufferLength; i++) {
      const value = (dataArray[i] / 255.0) * centerY;
      const x = centerX + (i / (bufferLength * 2 - 1)) * WIDTH;
      const y = centerY - value;

      canvasCtx.beginPath();
      canvasCtx.moveTo(lastX, lastY);
      canvasCtx.lineTo(x, y);
      canvasCtx.strokeStyle = `rgb(0, 0, 0)`;
      canvasCtx.stroke();

      lastX = x;
      lastY = y;
    }
  }*/

  /* function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    const maxRadius = Math.min(WIDTH, HEIGHT) / 2;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255.0;
      const angle = (i / bufferLength) * 2 * Math.PI;
      const radius = value * maxRadius;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      canvasCtx.beginPath();
      canvasCtx.moveTo(centerX, centerY);
      canvasCtx.lineTo(x, y);
      canvasCtx.strokeStyle = `rgb(${dataArray[i]}, ${dataArray[i]}, ${dataArray[i]})`;
      canvasCtx.stroke();
    }
  }*/

  function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(255, 255, 255)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    function getStrengthFromDistance(dist) {
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255.0;
        const angle =
          (((i / bufferLength) * 2 * Math.PI * dist) / centerX) * 10;
        sum -= (value * Math.sin(angle) * 2) / ((2 - i / bufferLength) * 0.5);
      }
      return (sum / bufferLength) * 300; // scale the strength for better visibility
    }

    let lastStrength = getStrengthFromDistance(centerX);
    for (let x = 1; x < WIDTH; x++) {
      const dist = Math.abs(x - centerX);
      const strength = getStrengthFromDistance(dist);

      canvasCtx.beginPath();
      canvasCtx.moveTo(x - 1, centerY + lastStrength);
      canvasCtx.lineTo(x, centerY + strength);
      canvasCtx.strokeStyle = `rgb(0, 0, 0)`;
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.moveTo(x - 1, centerY - lastStrength);
      canvasCtx.lineTo(x, centerY - strength);
      canvasCtx.strokeStyle = `rgb(0, 0, 0)`;
      canvasCtx.stroke();

      lastStrength = strength;
    }
  }

  function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); // Clear the canvas

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    function getStrengthFromDistance(dist) {
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255.0;
        const angle =
          (((i / bufferLength) * 2 * Math.PI * dist) / centerX) * 7.5;
        sum -= (value * Math.sin(angle) * 2) / ((2 - i / bufferLength) * 0.5);
      }
      return (sum / bufferLength) * 300; // scale the strength for better visibility
    }

    const strengths = [];
    for (let x = 0; x < WIDTH; x++) {
      const dist = Math.abs(x - centerX);
      const strength = getStrengthFromDistance(dist);
      strengths.push(strength);
    }

    // Define number of bins
    const numBins = 64; // or any number of bins you want
    const binWidth = WIDTH / numBins;
    const binHeights = new Array(numBins).fill(0);
    const binPaddings = 13.5;

    // Calculate the average strength for each bin
    for (let i = 0; i < numBins; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.floor(i * binWidth); j < (i + 1) * binWidth; j++) {
        if (j < strengths.length) {
          sum += strengths[j];
          count++;
        }
      }
      binHeights[i] = count ? sum / count : 0;
    }

    // Set shadow properties for the glow effect
    canvasCtx.shadowBlur = 20;
    canvasCtx.shadowColor = "rgba(255, 255, 255, 1)";

    // Draw the bars
    for (let i = 0; i < numBins; i++) {
      const x = i * binWidth;
      const y = centerY - binHeights[i];
      const height = binHeights[i] * 2; // Scale the height for better visibility

      canvasCtx.fillStyle = "rgb(255, 255, 255)";
      canvasCtx.fillRect(
        x + binPaddings,
        y,
        binWidth - binPaddings * 2,
        height
      );
    }
  }

  /*function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); // Clear the canvas

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const avg = dataArray.reduce((a, c) => a + c, 0) / bufferLength;

    let lastX = 0;
    let lastY = centerY - (dataArray[0] / 255.0) * centerY;

    // Set shadow properties for the glow effect
    canvasCtx.shadowBlur = 20;
    canvasCtx.shadowColor = "rgba(255, 255, 255, 1)";

    for (let i = 0; i < bufferLength; i++) {
      const value = (dataArray[i] / 255.0) * centerY;
      const x = (i / (bufferLength - 1)) * WIDTH;
      const y = centerY - value + avg;

      canvasCtx.beginPath();
      canvasCtx.moveTo(lastX, lastY);
      canvasCtx.lineTo(x, y);
      canvasCtx.strokeStyle = `rgb(255, 255, 255)`;
      canvasCtx.stroke();

      lastX = x;
      lastY = y;
    }
  }*/

  draw();
}

function handleError(e) {
  console.log(e);
}
