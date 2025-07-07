import App from "./App.js";

const root = document.getElementById("app"); // index.html에 있는 #app
const appElement = App();

root.appendChild(appElement);
