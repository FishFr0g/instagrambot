const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
const puppeteer = require("puppeteer");
const config = require("./config.json");
let webContents;
const fs = require("fs");
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    minWidth: 1280,
    minHeight: 900,

    frame: false,
  });

  if (!webContents) webContents = BrowserWindow.getAllWindows()[0].webContents;
  win.loadFile("index.html");
  win.webContents.openDevTools();
}
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  loadConfig();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let browser;
ipcMain.on("start", async function () {
  if (browser) return;
  browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    userDataDir: "./browserProfile",
  });
  const page = await browser.newPage();
  await page.goto("https://instagram.com", {
    waitUntil: "networkidle2",
  });
  await msgToFeed("Navigated to instagram");
  let checkLogin = await checkLogin(page);
  if (!checkLogin) return;
});

async function checkLogin(page) {
  let login = await page.$x('//*[contains(text(), "Sign up")]');
  if (login) {
  }
  return false;
  return true;
}
ipcMain.on("stop", async function () {
  if (browser) {
    await browser.close();

    browser = null;
  }
});

ipcMain.on("saveConfig", async function (err, data) {
  let check = checkConfig(data);

  if (!check) return;
  fs.writeFile("./config.json", JSON.stringify(data), async (err) => {
    if (err) {
      await msgToFeed("Could not save config!");
    } else {
      await msgToFeed("Config saved.", "green");
    }
  });
});

//Make html responsive, also add a choose file path for google chrome to work, add to see if theyre logged in to instagram, start reading and updating config json file
async function msgToFeed(msg, color) {
  await webContents.send("msgToFeed", { msg: msg, color: color ? color : "black" });
}
function loadConfig() {
  webContents.once("dom-ready", async () => {
    webContents.send("loadConfig", config);
  });
}

function checkConfig(config) {
  if (isNaN(config.minLikes)) {
    msgToFeed("Min Likes must be a number.", "red");
    return false;
  }
  if (isNaN(config.maxLikes)) {
    msgToFeed("Max Likes must be a number.", "red");
    return false;
  }

  if (isNaN(config.minFollows)) {
    msgToFeed("Min Follows must be a number.", "red");
    return false;
  }
  if (isNaN(config.maxFollows)) {
    msgToFeed("Max Follows must be a number.", "red");
    return false;
  }
  if (isNaN(config.likeRate)) {
    msgToFeed("Like Rate must be a number.", "red");
    return false;
  }
  if (isNaN(config.followRate)) {
    msgToFeed("Follow Rate must be a number.", "red");

    return false;
  }

  if (isNaN(config.cooldown)) {
    msgToFeed("Cooldown must be a number", "red");

    return false;
  }

  let pages = config.pages.split(",");

  if (pages.length > 20) {
    msgToFeed("Max pages: 20", "red");
    return false;
  }

  let hashtags = config.hashtags.split(",");
  if (hashtags.length > 20) {
    msgToFeed("Max hashtags: 20", "red");
    return false;
  }

  let comments = config.comments.split(",");

  if (comments.length > 20) {
    msgToFeed("Max comments: 20", "red");
    return false;
  }
  return true;
}
