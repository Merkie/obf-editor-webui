import { createEffect, createSignal } from "solid-js";
import { OBFBoard } from "./types";

export const [activeGroup, setActiveGroup] = createSignal("");

export const [showDropzoneBorder, setShowDropzoneBorder] = createSignal(false);

export const [boards, setBoards] = createSignal<OBFBoard[]>([]);
export const [boardFilePaths, setBoardFilePaths] = createSignal<
  { filePath: string; boardId: string }[]
>([]);
export const [manifest, setManifest] = createSignal<any>(null);

export const rootBoard = () =>
  boards().find(
    (board) =>
      board.id ===
      boardFilePaths().find((bfp) => bfp.filePath === manifest()?.root)?.boardId
  );

export const [projectFileName, setProjectFileName] = createSignal<
  string | null
>(null);

export const [showProjectFilesInExplorer, setShowProjectFilesInExplorer] =
  createSignal(false);

export const [activeBoard, setActiveBoard] = createSignal<OBFBoard>();
export const [openBoardIdsInExplorer, setOpenBoardIdsInExplorer] = createSignal<
  string[]
>([]);

createEffect(() => {
  if (!activeBoard() && rootBoard()) {
    setActiveBoard(rootBoard());
  }
});
