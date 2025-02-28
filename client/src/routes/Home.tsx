import JSZip from "jszip";
import PreventZoom from "../components/PreventZoom";
import useDropzone from "../lib/useDropzone";
import {
  activeBoard,
  boards,
  openBoardIdsInExplorer,
  projectFileName,
  rootBoard,
  setActiveBoard,
  setBoardFilePaths,
  setBoards,
  setManifest,
  setOpenBoardIdsInExplorer,
  setProjectFileName,
  setShowDropzoneBorder,
  setShowProjectFilesInExplorer,
  showDropzoneBorder,
  showProjectFilesInExplorer,
} from "../lib/global-state";
import { OBFBoard, OBFManifest } from "../lib/types";
import { For, Index, Show } from "solid-js";
import { cn } from "../lib/cn";

export default function Home() {
  useDropzone({
    setIsDragging: setShowDropzoneBorder,
    onDrop: async (files) => {
      if (files.length > 1) {
        alert("Please drop only one image at a time");
        return;
      }

      const file = files[0];

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

        Object.keys(zipData.files).forEach((fileName) => {
          if (fileName.endsWith(".obf")) {
            zipData.files[fileName].async("string").then((content) => {
              try {
                const board = JSON.parse(content) as OBFBoard;
                setBoards((prev) => [...prev, board]);
                if (boards().length > 0) {
                  setShowProjectFilesInExplorer(true);
                }
                setBoardFilePaths((prev) => [
                  ...prev,
                  { filePath: fileName, boardId: board.id },
                ]);
              } catch (e) {}
            });
          }

          // if the file is manifest.json, read it as json
          if (fileName === "manifest.json") {
            zipData.files[fileName].async("string").then((content) => {
              try {
                const parsedManifest = JSON.parse(content) as OBFManifest;
                setManifest(parsedManifest);
              } catch (e) {}
            });
          }
        });
      }
    },
  });

  return (
    <>
      <PreventZoom />
      <main class="w-full h-full absolute top-0 left-0">
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
                  each={boards().sort((a, b) => {
                    if (a.id === rootBoard()?.id) return -1;
                    if (b.id === rootBoard()?.id) return 1;
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                  })}
                >
                  {(board) => (
                    <>
                      <div
                        onClick={() => {
                          setActiveBoard(board());
                          setOpenBoardIdsInExplorer((prev) => [
                            ...prev.filter((id) => id !== board().id),
                            board().id,
                          ]);
                        }}
                        style={{
                          "padding-left": "32px",
                        }}
                        class={cn(
                          "text-sm flex items-center gap-1 text-left px-2 pl-6 cursor-pointer p-1 text-slate-800 hover:bg-blue-500 hover:text-white rounded-md group",
                          {
                            "bg-blue-500 text-white":
                              activeBoard()?.id === board().id,
                          }
                        )}
                      >
                        <img
                          class={cn("group-hover:hidden block", {
                            hidden: activeBoard()?.id === board().id,
                          })}
                          src="/icons/grid.png"
                          width={16}
                          alt=""
                        />
                        <img
                          class={cn("group-hover:block hidden", {
                            block: activeBoard()?.id === board().id,
                          })}
                          src="/icons/grid-white.png"
                          width={16}
                          alt=""
                        />
                        <p class="truncate">{board().name}</p>
                      </div>
                    </>
                  )}
                </Index>
              </Show>
            </Show>
          </div>
        </div>
        <div class="text-xs h-full w-[calc(100%_-_300px)] absolute top-0 right-0">
          <Show when={activeBoard()}>
            <div class="absolute top-0 left-0 w-full bg-slate-100 flex border-b border-slate-200">
              <div class="bg-white flex items-center gap-2 px-4 p-2 translate-y-[1px] -translate-x-[1px] border border-b-0 border-slate-200">
                <img
                  class="group-hover:hidden block"
                  src="/icons/grid.png"
                  width={16}
                  alt=""
                />
                <p>{activeBoard()?.name}</p>
                <i class="bi bi-x ml-2"></i>
              </div>
            </div>
          </Show>
          <div
            style={{
              "aspect-ratio": "2 / 1",
              "grid-template-rows": `repeat(${
                activeBoard()?.grid?.rows || 1
              }, 1fr)`,
              "grid-template-columns": `repeat(${
                activeBoard()?.grid?.columns || 1
              }, 1fr)`,
            }}
            class="absolute grid top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100  h-[70%] max-w-[90%]"
          >
            <For
              each={Array.from({
                length:
                  (activeBoard()?.grid?.rows || 1) *
                  (activeBoard()?.grid?.columns || 1),
              })}
            >
              {(_, i) => {
                const rowIndex = () =>
                  Math.floor(i() / (activeBoard()?.grid?.columns || 1));
                const columnIndex = () =>
                  i() % (activeBoard()?.grid?.columns || 1);
                const order = () => activeBoard()?.grid?.order || [];

                const buttonId = () => order()[rowIndex()]?.[columnIndex()];
                const button = () =>
                  activeBoard()?.buttons?.find((b) => b.id === buttonId());
                const isEmpty = () => buttonId() === null;
                const backgroundImage = () =>
                  activeBoard()?.images?.find(
                    (img) => img.id === button()?.image_id
                  )?.url;

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
        </div>
      </main>
      <DropzoneBorder />
    </>
  );
}

function DropzoneBorder() {
  return (
    <div
      style={{
        opacity: showDropzoneBorder() ? 1 : 0,
      }}
      class="pointer-events-none w-full transition-all select-none h-full absolute top-0 left-0 border-4 border-dashed border-sky-500 text-sky-600 text-xl text-center grid place-items-center"
    >
      <p>Drop files here</p>
    </div>
  );
}
