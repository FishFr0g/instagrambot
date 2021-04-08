const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");

const puppeteer = require("puppeteer");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let browser;
ipcMain.on("start", async function () {
  if (browser) return;
  browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: false });
  const page = await browser.newPage();
  await page.goto("https://google.com");
});
ipcMain.on("stop", async function () {
  if (browser) {
    await browser.close();

    browser = null;
  }
});
