const { ipcRenderer } = require("electron");

let startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", function () {
  console.log("yo");
  ipcRenderer.send("yo", {});
});
