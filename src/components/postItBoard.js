/* /src/components/PostItBoard.js */
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import PostIt from "@/components/postIt.js";

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
            },
          ];
        },
        // updateNoteText(id, newText) {
        //   const note = this.notes.find((n) => n.id === id);
        //   if (note) note.text = newText; // 객체 내부 속성만 변경
        //   console.log(this);
        // },
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
          ></postit>
        </div>
      </div>
    `,
  });
}
