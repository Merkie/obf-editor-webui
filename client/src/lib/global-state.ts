// global-state.ts

import { createEffect, createSignal } from "solid-js";
import { OBFBoard } from "./types";
import JSZip from "jszip"; // Import JSZip here as loadBoard uses it

export const [activeGroup, setActiveGroup] = createSignal("");

export const [showDropzoneBorder, setShowDropzoneBorder] = createSignal(false);

// Replace boards with boardMetadata - stores lightweight info
export const [boardMetadata, setBoardMetadata] = createSignal<
  { id: string; filePath: string; name: string }[]
>([]);
export const [boardFilePaths, setBoardFilePaths] = createSignal<
  { filePath: string; boardId: string }[]
>([]);
export const [manifest, setManifest] = createSignal<any>(null);

// Function to find root board based on metadata
export const rootBoardMetadata = () =>
  boardMetadata().find(
    (board) =>
      board.id ===
      boardFilePaths().find((bfp) => bfp.filePath === manifest()?.root)?.boardId
  );

export const [projectFileName, setProjectFileName] = createSignal<
  string | null
>(null);

export const [showProjectFilesInExplorer, setShowProjectFilesInExplorer] =
  createSignal(false);

// activeBoard will now hold the FULL OBFBoard object when loaded
export const [activeBoard, setActiveBoard] = createSignal<OBFBoard | null>(
  null
); // Allow null initially
export const [openBoardIdsInExplorer, setOpenBoardIdsInExplorer] = createSignal<
  string[]
>([]);

createEffect(() => {
  if (!activeBoard() && rootBoardMetadata()) {
    // Use rootBoardMetadata
    // Initially set activeBoard by loading from metadata
    loadBoard(rootBoardMetadata()!.id); // Load root board on initial load
  }
});

export const [showProgressBar, setShowProgressBar] = createSignal(false);
export const [progressBarValue, setProgressBarValue] = createSignal(0);
export const [progressBarMessage, setProgressBarMessage] = createSignal("");

// Board Cache to store loaded OBFBoard objects
const boardCache = new Map<string, OBFBoard>();

// Function to load a board by ID (and cache it)
export const loadBoard = async (boardId: string) => {
  if (boardCache.has(boardId)) {
    setActiveBoard(boardCache.get(boardId)!); // Set from cache if available
    return;
  }

  setShowProgressBar(true);
  setProgressBarMessage(`Loading board ${boardId}...`);
  setProgressBarValue(0); // Reset progress for board loading

  const boardFilePathInfo = boardFilePaths().find(
    (bfp) => bfp.boardId === boardId
  );
  const zip = new JSZip(); // Create a new JSZip instance here as it's needed here for on demand board loading
  const file = await fetchProjectFile(); // You'll need to implement fetchProjectFile
  if (!file) {
    console.error("Project file not available.");
    setShowProgressBar(false);
    return;
  }
  try {
    const zipData = await zip.loadAsync(file);
    if (!boardFilePathInfo) {
      console.error(`Board file path info not found for boardId: ${boardId}`);
      setShowProgressBar(false);
      return;
    }

    const fileName = boardFilePathInfo.filePath;

    const content = await zipData.files[fileName].async("string");
    const board = JSON.parse(content) as OBFBoard;
    boardCache.set(boardId, board); // Cache the loaded board
    setActiveBoard(board);
    setShowProgressBar(false);
  } catch (e) {
    console.error(`Error parsing .obf file for boardId ${boardId}:`, e);
    setShowProgressBar(false);
  }
};

// Placeholder function to fetch the project file (you'll need to adapt this)
let currentProjectFile: File | null = null; // Keep track of the current project file

export const setProjectFile = (file: File) => {
  currentProjectFile = file;
};

const fetchProjectFile = async (): Promise<File | null> => {
  return currentProjectFile;
};
