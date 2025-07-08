// /src/components/PostIt.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import {formatDate} from "@/utils/index.js";

const handlerMap = new Map();

export default function PostIt(props) {
  return createComponent({
    props,
    setup({createdAt, text}) {
      return {
        formattedCreatedAt: createdAt ? formatDate(createdAt) : "",
        isEditing: true,
        text,
        handleTextChange(e) {
          const newText = e.target.value;
          this.text = newText;
          // onTextChange(id, newText);
        },
        handleEscape(e) {
          console.log("e.type", e.type);

          if (e.type === "keydown" && e.key === "Escape") {
            this.isEditing = false;
          }

          if (e.type === "click" && !this.$refs.root.contains(e.target)) {
            this.isEditing = false;
          }
        },
      };
    },
    mount() {
      setTimeout(() => {
        const textarea = this.$refs.textarea;
        if (textarea) {
          textarea.focus();
          textarea.selectionStart = 0;
          textarea.selectionEnd = this.text.length;
        }

        const bound = this.handleEscape.bind(this);
        handlerMap.set(this, bound);
        window.addEventListener("keydown", bound);

        // ⚠️ click 이벤트는 다음 틱에 등록해야 현재 클릭을 무시함
        setTimeout(() => {
          window.addEventListener("click", bound);
        }, 0);
      }, 0);
    },
    watch: {
      isEditing(newVal) {
        if (!newVal) {
          const bound = handlerMap.get(this);
          if (bound) {
            window.removeEventListener("keydown", bound);
            window.removeEventListener("click", bound);
            handlerMap.delete(this); // 메모리 누수 방지
          }
        } else {
          const bound = this.handleEscape.bind(this);
          handlerMap.set(this, bound); // this 컴포넌트를 키로 저장
          window.addEventListener("keydown", bound);
          window.addEventListener("click", bound);
        }
      },
    },
    styles: ({x, y, width, height}) => ({
      "": {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        background: "#fffa75",
        padding: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        overflow: "hidden",
      },
      ".post-its": {
        height: "100%",
      },
      strong: {
        display: "block",
        marginBottom: "10px",
      },
      ".textarea-container": {
        position: "relative",
        height: "100%",
      },
      textarea: {
        width: "100%",
        height: "calc(100% - 32px)",
        resize: "none",
        overflow: "auto",
        fontFamily: "inherit",
        fontSize: "inherit",
        border: "none",
        outline: "none",
        background: "transparent",
        border: "1px solid #ccc",
      },
    }),
    template: `
      <div data-ref="root" class="post-its">
        <strong>메모 {{ id }} – {{ formattedCreatedAt }}</strong>
        <div data-if="isEditing" class="textarea-container">
          <textarea
            data-ref="textarea"
            maxlength="1000"
            data-oninput="handleTextChange"
          >{{ text }}</textarea>
        </div>
        <div data-if="!isEditing">
          <div>{{ text }}</div>
        </div>
      </div>
    `,
  });
}
