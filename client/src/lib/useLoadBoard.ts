import { onMount } from "solid-js";
import {
  loadRootBoard,
  setBoardNames,
  setCurrentProjectFileName,
  setCurrentProjectFileSize,
} from "./board";
import { getAllBoards } from "./db-ops";

export default function useLoadBoard() {
  onMount(async () => {
    const boardsMeta = await getAllBoards();
    setBoardNames(
      boardsMeta.map((b) => ({
        name: b.name,
        id: b.id,
      }))
    );

    const parsedProjectFileName = localStorage.getItem(
      "current_project_file_name"
    );
    if (parsedProjectFileName) {
      setCurrentProjectFileName(parsedProjectFileName);
    }

    const parsedProjectFileSize = localStorage.getItem(
      "current_project_file_size"
    );
    if (parsedProjectFileSize) {
      setCurrentProjectFileSize(parsedProjectFileSize);
    }

    loadRootBoard();
  });
}
