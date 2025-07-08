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
      isNew,
      onUpdateText,
      onDuplicate,
      onRemove,
      onChangeColor,
      onMove,
      id,
      color,
      x,
      y,
    }) {
      return {
        formattedCreatedAt: createdAt ? formatDate(createdAt) : "",
        isEditing: isNew,
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
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragOriginX: 0,
        dragOriginY: 0,
        dragDeltaX: 0,
        dragDeltaY: 0,
        toggleMenu() {
          this.menuOpen = !this.menuOpen;
        },
        isEdit() {
          this.isEditing = true;
          this.menuOpen = false;
          setTimeout(() => {
            const textarea = this.$refs.textarea;
            if (textarea) {
              textarea.focus();
              textarea.selectionStart = this.text.length;
              textarea.selectionEnd = this.text.length;
            }
          }, 0);
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

          // const selectedColor = e.target.value;
          onChangeColor(id, selectedColor);
          // this.colorPickerOpen = false;
        },
        handleTextChange(e) {
          const newText = e.target.value;
          onUpdateText(id, newText);
        },
        handleEscape(e) {
          // e.stopPropagation();
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
        handleHeaderMouseDown(e) {
          this.isDragging = true;
          this.dragStartX = e.clientX;
          this.dragStartY = e.clientY;
          this.dragOriginX = x;
          this.dragOriginY = y;
          this.dragDeltaX = 0;
          this.dragDeltaY = 0;
          const mousemoveBind = this.handleHeaderMouseMove.bind(this);
          const mouseUpBind = this.handleHeaderMouseUp.bind(this);
          const header = this.$refs.root;
          header.addEventListener("mousemove", mousemoveBind);
          header.addEventListener("mouseup", mouseUpBind);
        },
        handleHeaderMouseMove(e) {
          if (!this.isDragging) return;
          this.dragDeltaX = e.clientX - this.dragStartX;
          this.dragDeltaY = e.clientY - this.dragStartY;
        },
        handleHeaderMouseUp(e) {
          if (!this.isDragging) return;
          this.isDragging = false;
          document.body.style.userSelect = "";

          const finalX = this.dragOriginX + this.dragDeltaX;
          const finalY = this.dragOriginY + this.dragDeltaY;

          if (
            (this.dragDeltaX !== 0 || this.dragDeltaY !== 0) &&
            typeof onMove === "function"
          ) {
            onMove(id, finalX, finalY);
          }

          this.dragStartX = 0;
          this.dragStartY = 0;
          this.dragOriginX = 0;
          this.dragOriginY = 0;
          this.dragDeltaX = 0;
          this.dragDeltaY = 0;
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

        setTimeout(() => {
          window.addEventListener("click", bound);
          const header = this.$refs.root;
          const mousedownBinding = this.handleHeaderMouseDown.bind(this);
          header.addEventListener("mousedown", mousedownBinding);
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
    styles: ({x, y, width, height, color, zIndex}) => ({
      "": {},
      ".post-its": {
        position: "absolute",
        left: `${x + (this.isDragging ? this.dragDeltaX : 0)}px`,
        top: `${y + (this.isDragging ? this.dragDeltaY : 0)}px`,
        width: `${width}px`,
        background: `${color}`,
        padding: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: zIndex || 0,
        opacity: this.isDragging ? 0.9 : 1,
        transition: this.isDragging ? "none" : "left 0.2s, top 0.2s",
        cursor: this.isDragging ? "grabbing" : "grab",
      },
      ".post-its.on": {height: `${height}px`},
      ".post-its.off": {height: `auto`},
      ".post-it-header": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        cursor: this.isDragging ? "grabbing" : "grab",
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
      ".text-wrapper": {
        height: "calc(100% - 50px)",
        marginTop: "10px",
      },
      ".textarea-container": {
        position: "relative",
        height: "100%",
      },
      textarea: {
        width: "100%",
        height: "100%",
        resize: "none",
        overflow: "auto",
        fontFamily: "inherit",
        fontSize: "inherit",
        border: "none",
        outline: "none",
        background: "transparent",
        border: "1px solid #ccc",
      },
      ".text-container": {
        width: "100%",
        height: "100%",
        resize: "none",
        overflow: "auto",
      },
      ".text-length": {
        display: "flex",
        justifyContent: "end",
      },
    }),
    template: `
      <div data-ref="root" draggable="true" class="post-its {{ isCollapsed ? 'off' : 'on' }}">
        <div class="post-it-header">
          <button data-onclick="toggleCollapse">
            {{ isCollapsed ? "▼" : "▲" }}
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
          <div data-for="color in colorList" data-key="color.label" class="color-option">
            <button style="background:{{color.value}}; display:block; width:100%;opacity:{{color.isSelected}}" data-color="{{ color.name }}" data-onclick="handleColorChange">{{color.label}}</button>
          </div>
        </div>
        <div data-if="!isCollapsed" class="text-wrapper">
          <div data-if="isEditing" class="textarea-container">
            <textarea
              data-ref="textarea"
              maxlength="1000"
              data-oninput="handleTextChange"
            >{{ text }}</textarea>
          </div>
          <div data-if="!isEditing" class="text-container">
            <div>{{ text }}</div>
          </div>
          <div class="text-length">${props.text.length || 0}/1000</div>
        </div>
      </div>
    `,
  });
}
