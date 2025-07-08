import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import PostIt from "@/components/postIt.js";
import {NOTE_COLORS} from "@/constants/index.js";
import {saveNotes, loadNotes, loadNotesByColor} from "@/utils/indexed/index.js";

export default function PostItBoard() {
  return createComponent({
    setup: () => {
      const state = {
        nextId: 1,
        notes: [],
        selectedColor: null,
        createNote() {
          const now = new Date();
          const newId = this.nextId++;
          const noteWidth = 300;
          const noteHeight = 400;
          const margin = 20;

          let x = margin;
          let y = margin;

          if (this.notes.length > 0) {
            const last = this.notes[this.notes.length - 1];
            x = last.x + noteWidth + margin;
            y = last.y;

            if (x + noteWidth > window.innerWidth) {
              x = margin;
              y += noteHeight + margin;
            }
          }

          this.notes = [
            ...this.notes,
            {
              id: newId,
              text: "",
              createdAt: now,
              x,
              y,
              width: noteWidth,
              height: noteHeight,
              color: NOTE_COLORS.yellow.value,
              isNew: true,
            },
          ];
          saveNotes(this.notes);
        },
        duplicateNote(id) {
          const target = this.notes.find((n) => n.id === id);
          if (!target) return;
          const now = new Date();
          const newId = this.nextId++;
          const length = this.notes.length;
          const newNote = {
            ...structuredClone(target),
            id: newId,
            createdAt: now,
            text: target.text,
            x: 20 * newId + length * 300,
            y: 20,
            width: 300,
            height: 400,
            isNew: true,
          };
          this.notes = [...this.notes, newNote];
          saveNotes(this.notes);
        },
        async removePostIt(id) {
          this.notes = this.notes.filter((note) => note.id !== id);
          await saveNotes(this.notes);
        },
        async updateNoteColor(id, newColor) {
          const note = this.notes.find((n) => n.id === id);
          if (note) note.color = NOTE_COLORS[newColor].value;
          this.notes = [...this.notes];
          await saveNotes(this.notes);
        },

        async updateNoteText(id, newText) {
          const note = this.notes.find((n) => n.id === id);
          if (note) {
            note.text = newText;
            note.isNew = false;
          }
          this.notes = [...this.notes];
          await saveNotes(this.notes);
        },
        sortByCreatedAt() {
          this.notes = [...this.notes].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        },
        async setFilterColor(e) {
          const color = e.currentTarget.dataset.color;
          if (!color) {
            const all = await loadNotes();
            this.notes = all;
          } else {
            const filtered = await loadNotesByColor(NOTE_COLORS[color].value);
            this.notes = filtered;
          }
        },
        moveNote(id, newX, newY) {
          const note = this.notes.find((n) => n.id === id);
          if (note) {
            note.x = newX;
            note.y = newY;
            this.notes = [...this.notes];
            saveNotes(this.notes);
          }
        },
      };
      return state;
    },
    async mount() {
      const loaded = await loadNotes();
      this.nextId = Math.max(0, ...loaded.map((n) => n.id)) + 1;
      this.notes = loaded;
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
        display: "flex",
        gap: "20px",
      },
      ".board-area": {
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        flex: "1 1 auto",
        overflow: "auto",
        background: "#f0f0f0",
        minHeight: "500px",
        height: "calc(100vh - 52px - 53px)",
        width: "100vw",
      },
      button: {
        cursor: "pointer",
      },
    },
    template: `
      <div>
        <div class="control-bar">
          <button data-onclick="createNote">➕ 새 메모</button>
          <button data-onclick="sortByCreatedAt">🗂 생성순 정렬</button>
          <div class="filter-bar">
            <span>색상 필터:</span>
            <button data-color="" data-onclick="setFilterColor">전체</button>
            <button data-color="yellow" data-onclick="setFilterColor">노랑</button>
            <button data-color="green" data-onclick="setFilterColor">초록</button>
          </div>
        </div>
        <div class="board-area">
          <postit
            data-for="note in notes"
            :is-new="isNew"
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
            :on-move="moveNote"
          ></postit>
        </div>
      </div>
    `,
  });
}
