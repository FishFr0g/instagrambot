const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
const puppeteer = require("puppeteer");
const config = require("./config.json");
const prompt = require("electron-prompt");
let webContents;
const fs = require("fs");
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    minWidth: 1280,
    minHeight: 960,

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
  if (browser) return msgToFeed("Bot is already running.", "red");

  browser = await puppeteer.launch({
    executablePath: config.path,
    headless: false,
    userDataDir: "./browserProfile",
  });
  const page = await browser.newPage();
  await page.goto("https://instagram.com", {
    waitUntil: "networkidle2",
  });

  await msgToFeed("Navigated to instagram");

  await login(page);
});

async function checkLogin(page) {}

async function login(page) {
  try {
    await page.waitForXPath('//*[contains(text(), "Sign up")]', { timeout: 8000 });
    let loginInput = await page.$x('//input[@name="username"]');
    let passwordInput = await page.$x('//input[@name="password"]');
    let loginButton = await page.$x('//button//div[text() = "Log In"]');
    if (loginInput.length <= 0 || passwordInput.length <= 0 || loginButton <= 0) {
      await msgToFeed("There was an error finding the login page", "red");
      return;
    }

    await msgToFeed("Typing username..");
    await loginInput[0].type(config.username, { delay: 250 });
    await msgToFeed("Typing password...");
    await passwordInput[0].type(config.password, { delay: 250 });
    await loginButton[0].click();
    await msgToFeed("Logging in...");

    await checkForCode(page);
  } catch {
    await msgToFeed("Already logged in.", "green");
    return;
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    await msgToFeed("Browser closed.", "red");
  }
}
async function checkForCode(page) {
  try {
    await page.waitForXPath('//input[@aria-label = "Security Code"]', { timeout: 8000 });
    await msgToFeed("Waiting for security code..");

    let code = await prompt({
      title: "Instagram SMS Code",
      label: "Enter the code to continue",
      value: "",
      inputAttrs: {
        type: "text",
      },
      type: "input",
      alwaysOnTop: true,
    });

    if (!code) {
      await msgToFeed("Invalid Code", "red");
      await closeBrowser();
      return;
    }
    console.log(code);
    let securityCodeInput = await page.$x('//input[@aria-label = "Security Code"]');

    await securityCodeInput[0].type(code, { delay: 250 });

    let confirmButton = page.$x('//button[text() = "Confirm"]');

    confirmButton[0].click();
  } catch (err) {
    await msgToFeed("Security code not required.");
    return;
  }
}

ipcMain.on("stop", async function () {
  await closeBrowser();
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

//Check if path works, check if logged in to instagram, if not then tell them to log in, add extra config save checks, navigate to hashtags/pages
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
