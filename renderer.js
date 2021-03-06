const { ipcRenderer, remote } = require("electron");

let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");
let closeBtn = document.getElementById("closeBtn");
let saveConfigBtn = document.getElementById("saveConfigBtn");
let pathBtn = document.getElementById("path");
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
pathBtn.addEventListener("change", function () {
  document.getElementById("showPath").innerHTML = `Path Saved: ${document.getElementById("path").files[0].path}`;
});

saveConfigBtn.addEventListener("click", function () {
  let config = {
    minLikes: document.getElementById("minLikes").value,
    maxLikes: document.getElementById("maxLikes").value,

    minFollows: document.getElementById("minFollows").value,
    maxFollows: document.getElementById("maxFollows").value,
    likeRate: document.getElementById("likeRate").value,
    followRate: document.getElementById("followRate").value,
    cooldown: document.getElementById("cooldown").value,
    likeToggle: document.getElementById("likeToggle").checked,
    followToggle: document.getElementById("followToggle").checked,
    commentToggle: document.getElementById("commentToggle").checked,
    pages: document.getElementById("pages").value,
    hashtags: document.getElementById("hashtags").value,
    comments: document.getElementById("comments").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    path: document.getElementById("path").files[0]
      ? document.getElementById("path").files[0].path
      : document.getElementById("showPath").innerHTML,
  };

  ipcRenderer.send("saveConfig", config);
});

function getPath() {
  var x = document.getElementById("myFile").files[0].path;
  console.log(x);
}

ipcRenderer.on("msgToFeed", function (err, data) {
  console.log(data);
  let feed = document.getElementsByClassName("feed")[0];

  let text = document.createElement("li");
  text.innerHTML = data.msg;
  text.style.color = data.color;
  feed.appendChild(text);
});

ipcRenderer.on("loadConfig", function (err, data) {
  for (let key in data) {
    console.log(key);
    if (document.getElementById(key).type == "checkbox") document.getElementById(key).checked = data[key];
    if (document.getElementById(key).type == "text") document.getElementById(key).value = data[key];
    if (document.getElementById(key).type == "password") document.getElementById(key).value = data[key];
  }

  if (data.path.length > 0) document.getElementById("showPath").innerHTML = `Path Saved: ${data.path}`;
  console.log(data);
});
