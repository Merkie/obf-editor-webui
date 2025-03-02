import { createSignal, onMount, For, Show, createEffect } from "solid-js";
import JSZip from "jszip";
import {
  storeManifest,
  storeBoards,
  getAllBoards,
  storeImages,
  clearDB,
  getBoard,
  getImageBlob,
} from "../lib/db-ops";
import { BoardMetadataRecord } from "../lib/db";
import { cn } from "../lib/cn";

export default function Home() {
  let inputRef: HTMLInputElement | undefined;
  const [manifestRoot, setManifestRoot] = createSignal<string>("");
  const [boardNames, setBoardNames] = createSignal<BoardMetadataRecord[]>([]);
  const [currentBoard, setCurrentBoard] = createSignal<any>(null);

  onMount(async () => {
    // Now getAllBoards() returns BoardMetadataRecord[]
    const boardsMeta = await getAllBoards();
    setBoardNames(
      boardsMeta.map((b) => ({
        name: b.name,
        id: b.id,
      }))
    );

    // Load the root board if it exists
    const rootBoardId = localStorage.getItem("root_board_id");
    if (rootBoardId) {
      setManifestRoot(rootBoardId);
      const rootBoard = await getBoard(rootBoardId);
      if (rootBoard) {
        setCurrentBoard(JSON.parse(rootBoard.data));
      }
    }
  });

  async function handleFileInput(event: Event) {
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
      setManifestRoot(manifestJson.root);
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
        setManifestRoot(rootBoardId);
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

  async function handleClearStorage() {
    await clearDB();
    setManifestRoot("");
    setBoardNames([]);
    setCurrentBoard(null);
    console.log("IndexedDB cleared!");
  }

  return (
    <div class="p-8 flex flex-col gap-4">
      <input
        ref={inputRef}
        class="hidden"
        type="file"
        multiple={false}
        accept=".obz"
        onInput={handleFileInput}
      />

      <div class="flex items-center gap-2">
        <button
          onClick={() => inputRef?.click()}
          class="bg-orange-600 w-fit text-white p-2 px-6 border-b-2 border-orange-700 rounded-sm"
        >
          Upload .obz file
        </button>
        <button
          onClick={handleClearStorage}
          class="bg-red-600 w-fit text-white p-2 px-6 border-b-2 border-red-700 rounded-sm"
        >
          Clear All IndexedDB Data
        </button>
      </div>

      <Show when={manifestRoot()}>
        <p>Manifest root board: {manifestRoot()}</p>
      </Show>

      <h3>Boards Found:</h3>

      <select
        onInput={async (e) => {
          let parsedBoard = null;
          try {
            parsedBoard = JSON.parse(
              (await getBoard((e.target as HTMLSelectElement).value))?.data + ""
            );
          } catch {}

          if (!parsedBoard) {
            alert("Failed to parse board data");
          }
          setCurrentBoard(parsedBoard);
        }}
        class="border rounded-md w-fit p-2 px-4"
      >
        <For each={boardNames()}>
          {({ name, id }) => <option value={id}>{name}</option>}
        </For>
      </select>

      <Show when={currentBoard()}>
        {/* <pre>{JSON.stringify(currentBoard(), null, 2)}</pre> */}
        <div
          style={{
            "aspect-ratio": "2 / 1",
            "grid-template-rows": `repeat(${
              currentBoard()?.grid?.rows || 1
            }, 1fr)`, // Handle potentially null currentBoard
            "grid-template-columns": `repeat(${
              currentBoard()?.grid?.columns || 1 // Handle potentially null currentBoard
            }, 1fr)`,
          }}
          class="relative grid bg-slate-100 h-[70%] max-w-[90%]"
        >
          <For
            each={Array.from({
              length:
                (currentBoard()?.grid?.rows || 1) * // Handle potentially null currentBoard
                (currentBoard()?.grid?.columns || 1), // Handle potentially null currentBoard
            })}
          >
            {(_, i) => {
              const rowIndex = () =>
                Math.floor(i() / (currentBoard()?.grid?.columns || 1)); // Handle potentially null currentBoard
              const columnIndex = () =>
                i() % (currentBoard()?.grid?.columns || 1); // Handle potentially null currentBoard
              const order = () => currentBoard()?.grid?.order || []; // Handle potentially null currentBoard

              const buttonId = () => order()[rowIndex()]?.[columnIndex()];
              const button = () =>
                currentBoard()?.buttons?.find((b) => b.id === buttonId()); // Handle potentially null currentBoard
              const isEmpty = () => buttonId() === null;
              // const backgroundImage = () => getImageBlob(button()?.image_id); // Handle potentially null currentBoard
              const [backgroundImage, setBackgroundImage] =
                createSignal<string>("");
              createEffect(async () => {
                const path = currentBoard()?.images?.find(
                  (img) => img.id === button()?.image_id
                )?.path;

                if (!path) return;

                const imageBlob = await getImageBlob(path);

                if (imageBlob) {
                  // Instead of returning the raw Blob from getImageBlob, or after you get it:
                  const ext = path
                    .slice(path.lastIndexOf(".") + 1)
                    .toLowerCase();
                  let mimeType = "application/octet-stream";
                  if (ext === "svg") mimeType = "image/svg+xml";
                  if (ext === "png") mimeType = "image/png";
                  // etc.

                  const typedBlob = new Blob([imageBlob], { type: mimeType });
                  const url = URL.createObjectURL(typedBlob);
                  setBackgroundImage(url);
                }
              });

              return (
                <Show when={!isEmpty() && buttonId() !== undefined}>
                  <div
                    data-key={buttonId}
                    style={{
                      "grid-row": `${rowIndex() + 1} / ${rowIndex() + 2}`,
                      "grid-column": `${columnIndex() + 1} / ${
                        columnIndex() + 2
                      }`,
                      "background-color": button()?.background_color,
                      "border-color": button()?.border_color,
                      "grid-template-rows": backgroundImage()
                        ? "1fr 26px"
                        : undefined,
                    }}
                    class={cn("w-full h-full border grid text-xs relative", {
                      "place-items-center": !backgroundImage(),
                      "grid-cols-1": backgroundImage(),
                    })}
                  >
                    <Show when={backgroundImage()}>
                      <>
                        <div class="w-full h-full relative">
                          <img
                            class="absolute top-0 left-0 scale-90 w-full h-full object-contain"
                            src={backgroundImage()}
                            alt=""
                          />
                        </div>
                        <div class="w-full h-full text-center flex items-center justify-center">
                          <p
                            style={{
                              "font-size": "0.8vw",
                            }}
                            class="truncate"
                          >
                            {button()?.label}
                          </p>
                        </div>
                      </>
                    </Show>
                    <Show when={!backgroundImage()}>
                      <p
                        style={{
                          "font-size": "1vw",
                        }}
                        class="truncate"
                      >
                        {button()?.label}
                      </p>
                    </Show>

                    <Show when={button()?.load_board}>
                      <div class="absolute top-4 right-4">Folder*</div>
                    </Show>
                  </div>
                </Show>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
