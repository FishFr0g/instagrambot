const { ipcRenderer } = require("electron");

let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", function () {
  console.log("yo");
  ipcRenderer.send("start", {});
});

stopBtn.addEventListener("click", function () {
  console.log("yo");
  ipcRenderer.send("stop", {});
});
