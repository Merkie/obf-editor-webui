import { onMount } from "solid-js";
import { loadRootBoard, setBoardNames } from "./board";
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

    loadRootBoard();
  });
}
