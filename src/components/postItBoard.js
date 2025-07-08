/* /src/components/PostItBoard.js */
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import PostIt from "@/components/postIt.js";
import {NOTE_COLORS} from "@/constants/index.js"; // 색상 옵션 가져오기

export default function PostItBoard() {
  return createComponent({
    setup: () => {
      let nextId = 1;
      return {
        notes: [],
        createNote() {
          const now = new Date();
          const newId = nextId++;
          const length = this.notes.length;
          this.notes = [
            ...this.notes,
            {
              id: newId,
              text: "",
              createdAt: now,
              x: 20 * newId + length * 300,
              y: 20,
              width: 300,
              height: 400,
              color: NOTE_COLORS.yellow.value,
            },
          ];
        },
        duplicateNote(id) {
          const target = this.notes.find((n) => n.id === id);
          if (!target) return;
          const now = new Date();
          const newId = nextId++;
          const length = this.notes.length;

          const newNote = {
            ...structuredClone(target),
            id: newId,
            createdAt: now,
            text: target.text, // 텍스트 유지
            x: 20 * newId + length * 300, // ⬅️ 위치 계산 로직 재사용
            y: 20,
            width: 300,
            height: 400,
          };

          this.notes = [...this.notes, newNote];
        },
        removePostIt(id) {
          this.notes = this.notes.filter((note) => note.id !== id);
        },
        updateNoteColor(id, newColor) {
          const note = this.notes.find((n) => n.id === id);
          if (note) note.color = newColor;
        },
        updateNoteText(id, newText) {
          const note = this.notes.find((n) => n.id === id);
          if (note) note.text = newText; // 객체 내부 속성만 변경
        },
      };
    },
    components: {PostIt},
    styles: {
      "": {
        display: "flex",
        flexDirection: "column",
        height: "100%",
      },
      ".control-bar": {
        padding: "16px",
        flex: "0 0 auto",
      },
      ".board-area": {
        position: "relative",
        flex: "1 1 auto",
        overflow: "auto",
        background: "#f0f0f0",
        height: "100vh",
      },
      button: {
        cursor: "pointer",
      },
    },
    template: `
      <div>
        <div class="control-bar">
          <button data-onclick="createNote">➕ 새 메모 추가</button>
        </div>
        <div class="board-area">
          <postit
            data-for="note in notes"
            :id="id"
            :created-at="createdAt"
            :text="text"
            :x="x"
            :y="y"
            :width="width"
            :height="height"
            :color="color"
            :on-update-text="updateNoteText"
            :on-remove="removePostIt"
            :on-duplicate="duplicateNote"
            :on-change-color="updateNoteColor"
          ></postit>
        </div>
      </div>
    `,
  });
}
