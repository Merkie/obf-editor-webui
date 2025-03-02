import { createSignal } from "solid-js";
import {
  clearDB,
  getAllBoards,
  getBoard,
  storeBoards,
  storeImages,
  storeManifest,
} from "./db-ops";
import { BoardMetadataRecord } from "./db";
import JSZip from "jszip";

export const [boardNames, setBoardNames] = createSignal<BoardMetadataRecord[]>(
  []
);
export const [currentBoard, setCurrentBoard] = createSignal<any>(null);

export async function loadBoard(boardId: string, noScroll = false) {
  const board = await getBoard(boardId);
  if (board) {
    setCurrentBoard(JSON.parse(board.data));

    if (!noScroll) {
      const element = document.getElementById(`board-${boardId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
}

export function loadRootBoard() {
  const rootBoardId = localStorage.getItem("root_board_id");
  if (rootBoardId) {
    loadBoard(rootBoardId);
  }
}

export async function handleClearStorage() {
  await clearDB();
  setBoardNames([]);
  setCurrentBoard(null);
  localStorage.removeItem("root_board_id");
}

export async function handleObzFileInput(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) {
    console.error("No files selected");
    return;
  }

  const file = files[0];
  if (!file) {
    console.error("No file selected");
    return;
  }

  try {
    handleClearStorage();

    const zip = new JSZip();
    const zipFile = await zip.loadAsync(file);

    // 1. Parse manifest.json
    const manifestFile = zipFile.file("manifest.json");
    if (!manifestFile) {
      console.error("manifest.json not found in zip");
      return;
    }
    const manifestRaw = await manifestFile.async("string");
    const manifestJson = JSON.parse(manifestRaw);

    await storeManifest(manifestJson.root);
    localStorage.setItem("root_board_id", manifestJson.root);

    // 2. Process .obf boards
    const obfFiles = Object.keys(zipFile.files).filter((f) =>
      f.endsWith(".obf")
    );
    const boardsToStore = [];

    for (const obfPath of obfFiles) {
      const obfContent = await zipFile.file(obfPath)!.async("string");
      const boardJson = JSON.parse(obfContent);

      if (`board_${boardJson.id}.obf` === manifestJson.root) {
        boardJson.ext_root = true;
        localStorage.setItem("root_board_id", boardJson.id);
      }

      boardsToStore.push({
        id: boardJson.id,
        name: boardJson.name ?? "Untitled Board",
        data: JSON.stringify(boardJson),
      });
    }

    await storeBoards(boardsToStore);
    // Refresh our local UI list using metadata
    const boardsMeta = await getAllBoards();
    setBoardNames(
      boardsMeta.map((b) => ({
        name: b.name,
        id: b.id,
      }))
    );

    // 3. Process images
    const imagesToStore = [];
    for (const filename of Object.keys(zipFile.files)) {
      if (filename.startsWith("images/")) {
        const fileBlob = await zipFile.file(filename)!.async("blob");
        imagesToStore.push({
          path: filename,
          file: fileBlob,
        });
      }
    }
    await storeImages(imagesToStore);

    // set the current board to the root
    const rootBoardId = localStorage.getItem("root_board_id");
    if (rootBoardId) {
      const rootBoard = await getBoard(rootBoardId);
      if (rootBoard) {
        setCurrentBoard(JSON.parse(rootBoard.data));
      }
    }

    console.log("All data stored in IndexedDB!");
  } catch (err) {
    console.error("Error reading zip file:", err);
  }
}
