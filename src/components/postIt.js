// /src/components/PostIt.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import {formatDate} from "@/utils/index.js";
import {NOTE_COLOR_OPTIONS} from "@/constants/index.js";

const handlerMap = new Map();

export default function PostIt(props) {
  return createComponent({
    props,
    setup({
      createdAt,
      text,
      onUpdateText,
      onDuplicate,
      onRemove,
      onChangeColor,
      id,
      color,
    }) {
      return {
        formattedCreatedAt: createdAt ? formatDate(createdAt) : "",
        isEditing: true,
        text,
        menuOpen: false,
        colorList: NOTE_COLOR_OPTIONS.map((item) => {
          return {
            ...item,
            isSelected: item.value === color ? 1 : 0.5, // JS에서 비교
          };
        }),
        colorPickerOpen: false,
        isCollapsed: false,
        toggleMenu() {
          this.menuOpen = !this.menuOpen;
        },
        changeColor() {
          // 색상 변경 로직 (예: 랜덤 색상 또는 순환)
        },
        isEdit() {
          this.isEditing = true;
          this.menuOpen = false;
        },
        duplicate() {
          onDuplicate(id);
          this.menuOpen = false;
        },
        remove() {
          onRemove(id);
          this.menuOpen = false;
        },
        toggleColorPicker() {
          this.colorPickerOpen = !this.colorPickerOpen;
          this.menuOpen = false;
        },
        handleColorChange(e) {
          const selectedColor = e.currentTarget.dataset.color;
          console.log("선택된 색상:", selectedColor);

          // const selectedColor = e.target.value;
          onChangeColor(id, selectedColor);
          // this.colorPickerOpen = false;
        },
        handleTextChange(e) {
          const newText = e.target.value;
          onUpdateText(id, newText);
        },
        handleEscape(e) {
          e.stopPropagation();
          if (e.type === "keydown" && e.key === "Escape") {
            this.isEditing = false;
          }

          if (e.type === "click" && !this.$refs.root.contains(e.target)) {
            this.isEditing = false;
          }
        },
        toggleCollapse() {
          this.isCollapsed = !this.isCollapsed;
        },
      };
    },
    mount() {
      setTimeout(() => {
        const textarea = this.$refs.textarea;
        if (textarea) {
          textarea.focus();
          textarea.selectionStart = this.text.length;
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
        const prevBound = handlerMap.get(this);
        if (prevBound) {
          window.removeEventListener("keydown", prevBound);
          window.removeEventListener("click", prevBound);
          handlerMap.delete(this);
        }

        if (newVal) {
          const bound = this.handleEscape.bind(this);
          handlerMap.set(this, bound);

          window.addEventListener("keydown", bound);

          // 다음 틱에서 클릭 이벤트 등록 (현재 클릭이벤트 무시)
          setTimeout(() => {
            window.addEventListener("click", bound);
          }, 0);
        }
      },
      color(newVal) {
        console.log(newVal);
      },
    },
    styles: ({x, y, width, height, color}) => ({
      "": {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        background: `${color}`,
        padding: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      },
      ".post-its": {
        height: "100%",
      },
      ".post-it-header": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        marginBottom: "10px",
      },
      ".dropdown-menu": {
        position: "absolute",
        top: "100%",
        left: "100%",
        width: "150px",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 10,
      },
      ".dropdown-menu > div": {
        padding: "6px 12px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
      },
      ".dropdown-menu > div:last-child": {
        borderBottom: "none",
      },
      ".color-dialog": {
        position: "absolute",
        width: "80%",
        height: "50%",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "8px",
        background: "rgba(0, 0, 0, 0.5)",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 20,
        gap: "8px",
        textAlign: "center",
      },
      ".close-button-wrapper": {
        display: "flex",
        justifyContent: "end",
        width: "100%",
      },
      ".close-button": {
        color: "#fff",
      },
      ".color-option": {
        width: "100%",
        borderRadius: "5px",
        background: "#fff",
        border: "1px solid #aaa",
        cursor: "pointer",
      },
      ".post-it-header strong": {
        display: "block",
      },
      ".textarea-container": {
        position: "relative",
        height: "100%",
      },
      textarea: {
        width: "100%",
        height: `calc(${height}px - 32px)`,
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
        <div class="post-it-header">
          <button data-onclick="toggleCollapse">
            {{ isCollapsed ? '▼ 펼치기' : '▲ 접기' }}
          </button>
          <strong>메모 {{ id }} – {{ formattedCreatedAt }}</strong>
          <button data-ref="menuBtn" data-onclick="toggleMenu">⋯</button>
          <div data-if="menuOpen" class="dropdown-menu">
            <div data-onclick="isEdit">수정</div>
            <div data-onclick="toggleColorPicker">색상변경</div>
            <div data-onclick="duplicate">복제</div>
            <div data-onclick="remove">삭제</div>
          </div>
        </div>
        <div data-if="colorPickerOpen" class="color-dialog">
          <div class="close-button-wrapper">
            <button class="close-button" data-onclick="toggleColorPicker">✕</button>
          </div>
          <div data-for="color in colorList" class="color-option">
            <button style="background:{{value}}; display:block; width:100%;opacity:{{isSelected}}" data-color="{{ name }}" data-onclick="handleColorChange">{{label}}</button>
          </div>
        </div>
        <div data-if="!isCollapsed && isEditing">
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
      </div>
    `,
  });
}
