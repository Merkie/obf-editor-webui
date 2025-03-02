// Home.tsx
import JSZip from "jszip";
import useDropzone from "../lib/useDropzone";
import {
  activeBoard,
  boardMetadata, // Renamed from boards
  progressBarMessage,
  progressBarValue,
  projectFileName,
  rootBoardMetadata, // Renamed from rootBoard
  setBoardFilePaths,
  setBoardMetadata, // Renamed from setBoards
  setManifest,
  setOpenBoardIdsInExplorer,
  setProgressBarMessage,
  setProgressBarValue,
  setProjectFileName,
  setShowProgressBar,
  setShowProjectFilesInExplorer,
  showProgressBar,
  showProjectFilesInExplorer,
  loadBoard, // Import the new loadBoard function
  setProjectFile, // Import setProjectFile
} from "../lib/global-state";
import { OBFManifest } from "../lib/types";
import { For, Index, Show } from "solid-js";
import { cn } from "../lib/cn";
import usePreventZoom from "../lib/usePreventZoom";

export default function Home() {
  useDropzone({
    onDrop: handleFileDrop,
  });
  usePreventZoom();

  return (
    <>
      <main class="w-full h-full absolute top-0 left-0">
        <Explorer />
        <PreviewCanvas />
      </main>
      <main
        style={{
          opacity: showProgressBar() ? 1 : 0,
          "pointer-events": showProgressBar() ? "all" : "none",
          "user-select": showProgressBar() ? "none" : "auto",
        }}
        class="w-full transition-all h-full absolute top-0 left-0 bg-black/[15%] grid place-items-center backdrop-blur-[2px]"
      >
        <div class="flex flex-col items-center gap-4 text-white">
          <p>{progressBarMessage()}</p>

          <div class="h-[30px] overflow-hidden relative w-[90vw] max-w-[500px] bg-white rounded-full">
            <div
              style={{
                width: `${progressBarValue()}%`,
              }}
              class="bg-blue-400 transition-all h-[30px] absolute top-0 left-0 rounded-r-full"
            ></div>
          </div>
        </div>
      </main>
    </>
  );
}

async function handleFileDrop(files: FileList) {
  if (files.length > 1) {
    alert("Please drop only one file at a time!");
    return;
  }

  const file = files[0];
  setProjectFile(file); // Store the project file in global state for later access in loadBoard

  if (!file.name.endsWith(".obf") && !file.name.endsWith(".obz")) {
    alert("Please drop a .obf or .obz file");
    return;
  }

  console.log(`Opening project ${file.name}...`);

  if (file.name.endsWith(".obz")) {
    console.log(`Extracting project content...`);

    setProjectFileName(file.name.split(".")[0].replace(/-/g, " "));

    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    const fileNames = Object.keys(zipData.files);
    let obfFiles = fileNames.filter((name) => name.endsWith(".obf"));
    let totalFiles =
      obfFiles.length + (fileNames.includes("manifest.json") ? 1 : 0);
    let processedFiles = 0;

    const promises: Promise<void>[] = [];
    const boardMetadataPromises: Promise<void>[] = []; // Promises for metadata extraction

    const updateLoadingStatus = (currentFileName: string) => {
      processedFiles++;
      if (processedFiles > 0 && totalFiles > 0 && !showProgressBar()) {
        setShowProgressBar(true);
      }
      setProgressBarMessage(
        `Loading ${currentFileName}... ${processedFiles}/${totalFiles}`
      );
      setProgressBarValue(Math.round((processedFiles / totalFiles) * 100));
    };

    obfFiles.forEach((fileName) => {
      const promise = zipData.files[fileName]
        .async("string")
        .then((content) => {
          try {
            // Parse just enough JSON to get id and name for metadata
            const boardPartial = JSON.parse(content) as {
              id: string;
              name?: string;
            }; // Partial parse
            const boardId = boardPartial.id;
            const boardName = boardPartial.name || fileName; // Use filename if name is missing

            setBoardMetadata((prev) => [
              // setBoardMetadata, not setBoards
              ...prev,
              { id: boardId, filePath: fileName, name: boardName }, // Store metadata
            ]);
            if (boardMetadata().length > 0) {
              // Check boardMetadata, not boards
              setShowProjectFilesInExplorer(true);
            }
            setBoardFilePaths((prev) => [
              ...prev,
              { filePath: fileName, boardId: boardId },
            ]);
            updateLoadingStatus(boardName);
          } catch (e) {
            console.error(
              `Error parsing .obf file (for metadata) ${fileName}:`,
              e
            );
            updateLoadingStatus(fileName);
          }
        });
      boardMetadataPromises.push(promise);
    });

    if (fileNames.includes("manifest.json")) {
      const promise = zipData.files["manifest.json"]
        .async("string")
        .then((content) => {
          try {
            const parsedManifest = JSON.parse(content) as OBFManifest;
            setManifest(parsedManifest);
            updateLoadingStatus("manifest.json");
          } catch (e) {
            console.error(`Error parsing manifest.json:`, e);
            updateLoadingStatus("manifest.json");
          }
        });
      promises.push(promise);
    }

    Promise.all([...boardMetadataPromises, ...promises]).then(() => {
      // Wait for both metadata and manifest promises
      console.log(`Finished loading project metadata for ${file.name}`);
      setShowProgressBar(false);
      // Initial active board is set via createEffect in global-state.ts now
    });
  } else {
    // Handle .obf files directly (if needed)
    alert(
      ".obf file type not handled directly in this optimized version. Please use .obz"
    );
    return;
  }
}

function Explorer() {
  return (
    <div class="absolute top-0 left-0 w-[300px] h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      <div class="text-sm flex items-center gap-2 p-2 border-b px-4 border-slate-200">
        <p class="text-slate-400 tracking-wide">Explorer</p>
      </div>
      <div class="flex flex-col overflow-y-auto p-2">
        <Show when={projectFileName()}>
          <div class="text-sm flex items-center gap-1 text-left px-2 cursor-pointer p-1 text-slate-800 hover:bg-blue-500 hover:text-white rounded-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProjectFilesInExplorer((prev) => !prev);
              }}
              class="cursor-pointer"
            >
              <i
                class={`bi bi-chevron-${
                  showProjectFilesInExplorer() ? "down" : "right"
                } text-[10px]`}
              ></i>
            </button>
            <img src="/icons/project.png" width={16} alt="" />
            <p class="capitalize">{projectFileName()}</p>
          </div>
          <Show when={showProjectFilesInExplorer()}>
            <Index
              each={boardMetadata().sort((a, b) => {
                // Iterate over boardMetadata
                if (a.id === rootBoardMetadata()?.id) return -1; // Use rootBoardMetadata
                if (b.id === rootBoardMetadata()?.id) return 1; // Use rootBoardMetadata
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              })}
            >
              {(
                boardMetadataItem // Rename board to boardMetadataItem
              ) => (
                <>
                  <div
                    onClick={() => {
                      // Load the board on demand when clicked
                      loadBoard(boardMetadataItem().id);
                      setOpenBoardIdsInExplorer((prev) => [
                        ...prev.filter((id) => id !== boardMetadataItem().id),
                        boardMetadataItem().id,
                      ]);
                    }}
                    style={{
                      "padding-left": "32px",
                    }}
                    class={cn(
                      "text-sm flex items-center gap-1 text-left px-2 pl-6 cursor-pointer p-1 text-slate-800 hover:bg-blue-500 hover:text-white rounded-md group",
                      {
                        "bg-blue-500 text-white":
                          activeBoard()?.id === boardMetadataItem().id, // Compare by ID
                      }
                    )}
                  >
                    <img
                      class={cn("group-hover:hidden block", {
                        hidden: activeBoard()?.id === boardMetadataItem().id,
                      })}
                      src="/icons/grid.png"
                      width={16}
                      alt=""
                    />
                    <img
                      class={cn("group-hover:block hidden", {
                        block: activeBoard()?.id === boardMetadataItem().id,
                      })}
                      src="/icons/grid-white.png"
                      width={16}
                      alt=""
                    />
                    <p class="truncate">{boardMetadataItem().name}</p>{" "}
                    {/* Use boardMetadataItem().name */}
                  </div>
                </>
              )}
            </Index>
          </Show>
        </Show>
      </div>
    </div>
  );
}

function PreviewCanvas() {
  return (
    <div class="text-xs h-full w-[calc(100%_-_300px)] absolute top-0 right-0">
      <PreviewCanvasTabs />
      <BoardPreview />
    </div>
  );
}

function PreviewCanvasTabs() {
  return (
    <Show when={activeBoard()}>
      {" "}
      {/* Show only when activeBoard is not null */}
      <div class="absolute top-0 left-0 w-full bg-slate-100 flex border-b border-slate-200">
        <div class="bg-white flex items-center gap-2 px-4 p-2 translate-y-[1px] -translate-x-[1px] border border-b-0 border-slate-200">
          <img
            class="group-hover:hidden block"
            src="/icons/grid.png"
            width={16}
            alt=""
          />
          <p>{activeBoard()?.name}</p>{" "}
          {/* Access name safely - activeBoard is guaranteed to be non-null within Show when */}
          <i class="bi bi-x ml-2"></i>
        </div>
      </div>
    </Show>
  );
}

function BoardPreview() {
  return (
    <div
      style={{
        "aspect-ratio": "2 / 1",
        "grid-template-rows": `repeat(${activeBoard()?.grid?.rows || 1}, 1fr)`, // Handle potentially null activeBoard
        "grid-template-columns": `repeat(${
          activeBoard()?.grid?.columns || 1 // Handle potentially null activeBoard
        }, 1fr)`,
      }}
      class="absolute grid top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100  h-[70%] max-w-[90%]"
    >
      <For
        each={Array.from({
          length:
            (activeBoard()?.grid?.rows || 1) * // Handle potentially null activeBoard
            (activeBoard()?.grid?.columns || 1), // Handle potentially null activeBoard
        })}
      >
        {(_, i) => {
          const rowIndex = () =>
            Math.floor(i() / (activeBoard()?.grid?.columns || 1)); // Handle potentially null activeBoard
          const columnIndex = () => i() % (activeBoard()?.grid?.columns || 1); // Handle potentially null activeBoard
          const order = () => activeBoard()?.grid?.order || []; // Handle potentially null activeBoard

          const buttonId = () => order()[rowIndex()]?.[columnIndex()];
          const button = () =>
            activeBoard()?.buttons?.find((b) => b.id === buttonId()); // Handle potentially null activeBoard
          const isEmpty = () => buttonId() === null;
          const backgroundImage = () =>
            activeBoard()?.images?.find((img) => img.id === button()?.image_id) // Handle potentially null activeBoard
              ?.url;

          return (
            <Show when={!isEmpty() && buttonId() !== undefined}>
              <div
                data-key={buttonId}
                style={{
                  "grid-row": `${rowIndex() + 1} / ${rowIndex() + 2}`,
                  "grid-column": `${columnIndex() + 1} / ${columnIndex() + 2}`,
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
  );
}
