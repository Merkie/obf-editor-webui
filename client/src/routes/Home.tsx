import { createSignal, For, Show, createEffect } from "solid-js";
import { getImageBlob } from "../lib/db-ops";
import { cn } from "../lib/cn";
import usePreventZoom from "../lib/usePreventZoom";
import useLoadBoard from "../lib/useLoadBoard";
import {
  boardNames,
  currentBoard,
  currentProjectFileName,
  currentProjectFileSize,
  handleClearStorage,
  handleObzFileInput,
  loadBoard,
  loadRootBoard,
} from "../lib/board";
import {
  UIPanel,
  UIPanelFooter,
  UIPanelFooterButton,
  UIPanelFooterSelect,
} from "../components/UIPanel";

const [showTabletMockup, setShowTabletMockup] = createSignal(true);
const [enableNavigations, setEnableNavigations] = createSignal(false);

export default function Home() {
  usePreventZoom();
  useLoadBoard();

  return (
    <main
      style={{
        "grid-template-rows": "1fr",
        "grid-template-columns": "300px 1fr 300px",
      }}
      class="w-full h-full gap-[1px] p-[2px] absolute top-0 left-0 bg-neutral-800 grid"
    >
      <div
        style={{
          "grid-template-columns": "1fr",
          "grid-template-rows": "300px 1fr",
        }}
        class="w-full h-full grid gap-[1px]"
      >
        <ProjectPanel />
        <ExplorerPanel />
      </div>
      <PreviewPanel />
      <UIPanel moveable={true} label="Properties">
        <div></div>
      </UIPanel>
    </main>
  );
}

function ProjectPanel() {
  let inputRef: HTMLInputElement | undefined;

  return (
    <UIPanel moveable={true} label="Project">
      <div class="flex-1 p-2 flex flex-col">
        <div class="flex items-center gap-2">
          <span class="font-bold text-neutral-400 text-xs tracking-wide">
            File Name:
          </span>
          <span class="text-neutral-100 -translate-y-[1px] text-sm font-light">
            {currentProjectFileName()}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-neutral-400 text-xs tracking-wide">
            File Size:
          </span>
          <span class="text-neutral-100 -translate-y-[1px] text-sm font-light">
            {currentProjectFileSize()}
          </span>
        </div>
      </div>
      <UIPanelFooter>
        <UIPanelFooterButton>
          <i class="bi bi-plus-lg"></i>
        </UIPanelFooterButton>
        <UIPanelFooterButton
          onClick={() => {
            inputRef?.click();
          }}
        >
          <i class="bi bi-file-earmark-arrow-up"></i>
        </UIPanelFooterButton>
        <UIPanelFooterButton onClick={handleClearStorage}>
          <i class="bi bi-trash"></i>
        </UIPanelFooterButton>
        <div class="flex-1"></div>
        <UIPanelFooterButton>
          <i class="bi bi-gear"></i>
        </UIPanelFooterButton>
        <input
          ref={inputRef}
          class="hidden"
          type="file"
          multiple={false}
          accept=".obz"
          onInput={handleObzFileInput}
        />
      </UIPanelFooter>
    </UIPanel>
  );
}

function ExplorerPanel() {
  return (
    <UIPanel moveable={true} label="Explorer">
      <div class="border-b border-neutral-900/[50%]">
        <div class="bg-neutral-700 text-neutral-400 border-y border-neutral-600 text-xs p-[1px] px-3 flex items-center">
          <p>Name</p>
        </div>
      </div>
      <div class="flex-1 relative mt-1">
        <div
          id="explorer-scrollable"
          class="flex flex-col absolute top-0 left-0 w-full h-full overflow-y-auto custom-scrollbar"
        >
          <For each={boardNames()}>
            {({ name, id }) => (
              <button
                id={`board-${id}`}
                onClick={() => loadBoard(id, true)}
                class={cn(
                  "text-left cursor-pointer border-b border-neutral-900/[50%]",
                  {
                    "bg-neutral-800": currentBoard()?.id === id,
                    "hover:bg-neutral-700": currentBoard()?.id !== id,
                  }
                )}
              >
                <p class="truncate pl-[12px] py-[1px] text-sm font-light text-neutral-100">
                  {name}
                </p>
              </button>
            )}
          </For>
        </div>
      </div>
    </UIPanel>
  );
}

function PreviewPanel() {
  return (
    <UIPanel label="Preview">
      <div class="w-full h-full flex flex-col">
        <div class="flex-1 bg-neutral-800 relative overflow-hidden">
          <Show when={currentBoard()}>
            <div
              class={cn("absolute flex flex-col", {
                "bg-neutral-950 border-2 border-neutral-700/[80%] shadow-xl p-8 rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-fit max-h-[90%]":
                  showTabletMockup(),
                "top-0 left-0 w-full h-full": !showTabletMockup(),
              })}
            >
              <div
                style={{
                  "grid-template-columns": "1fr",
                  "grid-template-rows": showTabletMockup()
                    ? "12% 81% 7%"
                    : "1fr",
                }}
                class={cn("overflow-hidden flex-1 grid w-full", {
                  "rounded-lg border-2 border-neutral-800": showTabletMockup(),
                })}
              >
                <Show when={showTabletMockup()}>
                  <div class="w-full h-full bg-white gap-2 p-4 flex border-b border-neutral-300"></div>
                </Show>
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
                  class="relative grid bg-neutral-100 w-full h-full p-4 gap-2 overflow-hidden"
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

                      const buttonId = () =>
                        order()[rowIndex()]?.[columnIndex()];
                      const button = () =>
                        currentBoard()?.buttons?.find(
                          (b: any) => b.id === buttonId()
                        ); // Handle potentially null currentBoard
                      const isEmpty = () => buttonId() === null;
                      // const backgroundImage = () => getImageBlob(button()?.image_id); // Handle potentially null currentBoard
                      const [backgroundImage, setBackgroundImage] =
                        createSignal<string>("");
                      createEffect(async () => {
                        const path = currentBoard()?.images?.find(
                          (img: any) => img.id === button()?.image_id
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

                          const typedBlob = new Blob([imageBlob], {
                            type: mimeType,
                          });
                          const url = URL.createObjectURL(typedBlob);
                          setBackgroundImage(url);
                        }
                      });

                      return (
                        <Show when={!isEmpty() && buttonId() !== undefined}>
                          <button
                            data-key={buttonId}
                            style={{
                              "grid-row": `${rowIndex() + 1} / ${
                                rowIndex() + 2
                              }`,
                              "grid-column": `${columnIndex() + 1} / ${
                                columnIndex() + 2
                              }`,
                              "background-color": button()?.background_color,
                              "border-color": button()?.border_color,
                              "grid-template-rows": backgroundImage()
                                ? "1fr 26px"
                                : undefined,
                            }}
                            class={cn(
                              "w-full pointer-events-auto h-full border-2 grid text-xs relative rounded-sm cursor-pointer",
                              {
                                "place-items-center": !backgroundImage(),
                                "grid-cols-1": backgroundImage(),
                              }
                            )}
                            onClick={() => {
                              if (enableNavigations()) {
                                if (button()?.load_board) {
                                  loadBoard(button()?.load_board.id);
                                }
                              }
                            }}
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
                                      "font-size": "0.7vw",
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
                              <div
                                style={{
                                  "background-color":
                                    button()?.background_color,
                                  "border-color": button()?.border_color,
                                }}
                                class="absolute -top-[6px] -left-[2px] h-[10px] border-2 border-b-0 rounded-t-sm w-[50%]"
                              ></div>
                            </Show>
                          </button>
                        </Show>
                      );
                    }}
                  </For>
                </div>
                <Show when={showTabletMockup()}>
                  <button
                    onClick={loadRootBoard}
                    class="text-2xl w-full h-full cursor-pointer text-center flex items-center justify-center bg-neutral-950 gap-2 border-t border-neutral-900 text-white"
                  >
                    <i class="bi bi-house"></i>
                  </button>
                </Show>
              </div>
            </div>
          </Show>
        </div>
        <UIPanelFooter>
          <UIPanelFooterSelect
            options={["150%", "125%", "100%", "75%", "50%"]}
            value="100%"
            onInput={() => {}}
          />
          <UIPanelFooterButton
            onClick={() => {
              setShowTabletMockup((prev) => !prev);
            }}
            toggled={showTabletMockup}
          >
            <i class="bi bi-tablet-landscape"></i>
          </UIPanelFooterButton>
          <UIPanelFooterButton
            onClick={() => {
              setEnableNavigations((prev) => !prev);
            }}
            toggled={enableNavigations}
          >
            <i class="bi bi-folder-symlink"></i>
          </UIPanelFooterButton>
        </UIPanelFooter>
      </div>
    </UIPanel>
  );
}

// function Old() {
//   usePreventZoom();

//   return (
//     <main class="w-full h-full absolute top-0 left-0">
//       <div class="p-8 flex flex-col gap-4">

//         <div class="flex items-center gap-2">
//           <button
//             onClick={() => inputRef?.click()}
//             class="bg-orange-600 w-fit text-white p-2 px-6 border-b-2 border-orange-700 rounded-sm"
//           >
//             Upload .obz file
//           </button>
//           <button
//             onClick={handleClearStorage}
//             class="bg-red-600 w-fit text-white p-2 px-6 border-b-2 border-red-700 rounded-sm"
//           >
//             Clear All IndexedDB Data
//           </button>
//         </div>

//         <h3>Boards Found:</h3>

//         <select
//           value={currentBoard()?.id}
//           onInput={async (e) => {
//             let parsedBoard = null;
//             try {
//               parsedBoard = JSON.parse(
//                 (await getBoard((e.target as HTMLSelectElement).value))?.data +
//                   ""
//               );
//             } catch {}

//             if (!parsedBoard) {
//               alert("Failed to parse board data");
//             }
//             setCurrentBoard(parsedBoard);
//           }}
//           class="border rounded-md w-fit p-2 px-4"
//         >
//           <For each={boardNames()}>
//             {({ name, id }) => <option value={id}>{name}</option>}
//           </For>
//         </select>
//       </div>

//     </main>
//   );
// }
