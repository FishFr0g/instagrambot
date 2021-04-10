const { ipcRenderer, remote } = require("electron");

let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");
let closeBtn = document.getElementById("closeBtn");

startBtn.addEventListener("click", function () {
  console.log("yo");
  ipcRenderer.send("start", {});
});

stopBtn.addEventListener("click", function () {
  console.log("yo");
  ipcRenderer.send("stop", {});
});
closeBtn.addEventListener("click", function () {
  remote.getCurrentWindow().close();
});

function getPath() {
  var x = document.getElementById("myFile").files[0].path;
  console.log(x);
}
