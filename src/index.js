import App from "./App.js";
import {setTheme} from "@/lib/ui-kit/core/createComponent.js";

// 전역 Reset 스타일을 객체 매핑으로 전달
setTheme({
  "html, body": {
    fontWeight: "300",
    letterSpacing: "-0.5px",
  },
  "*": {
    boxSizing: "border-box",
    margin: "0",
    padding: "0",
    border: "0",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    fontFamily: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
      system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
      "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol", sans-serif`,
    fontSize: "inherit",
    letterSpacing: "inherit",
  },
  "article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section, main":
    {
      display: "block",
    },
  form: {
    boxSizing: "border-box",
  },
  "table, tbody, tr, td, th": {
    borderCollapse: "collapse",
    borderSpacing: "0",
  },
  "h1, h2, h3, h4, h5, h6": {
    lineHeight: "1.2",
    fontSize: "inherit",
  },
  "ol, ul": {
    listStyle: "none",
  },
  a: {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
  },
  "a:link, a:visited, a:hover, a:active": {
    color: "inherit",
  },
  "button, input, optgroup, select, textarea": {
    fontFamily: "inherit",
    fontSize: "100%",
    lineHeight: "1.15",
    margin: "0",
    outline: "none",
  },
  "button, input, select": {
    overflow: "visible",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    background: "transparent",
  },
  "button, select": {
    textTransform: "none",
  },
  'button, [type="button"], [type="reset"], [type="submit"]': {
    WebkitAppearance: "button",
  },
  button: {
    cursor: "pointer",
    userSelect: "none",
    border: "none",
  },
});

const root = document.getElementById("app"); // index.html에 있는 #app
const appElement = App();

root.appendChild(appElement);
