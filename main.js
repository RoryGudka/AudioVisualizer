const { app, BrowserWindow, desktopCapturer } = require("electron");
const path = require("path");
const url = require("url");

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.maximize();
  win.setFullScreen(true);

  desktopCapturer
    .getSources({ types: ["window", "screen"] })
    .then(async (sources) => {
      for (const source of sources) {
        if (source.name === "Screen 1") {
          win.webContents.send("SET_SOURCE", 1, source.id);
        } else if (source.name === "Screen 2") {
          win.webContents.send("SET_SOURCE", 2, source.id);
        }
      }
    });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
