import { For, JSX, onMount, Show } from "solid-js";
import usePreventZoom from "../lib/usePreventZoom";

export default function Main() {
  usePreventZoom();

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
        <UIPanel moveable={true} label="Project">
          <div></div>
        </UIPanel>
        <UIPanel moveable={true} label="Explorer">
          <div></div>
        </UIPanel>
      </div>
      <UIPanel label="Preview">
        <div class="w-full h-full flex flex-col">
          <div class="flex-1 bg-neutral-800"></div>
          <div class="flex gap-1 items-center text-sm p-2 px-3">
            <Select
              options={["150%", "125%", "100%", "75%", "50%"]}
              value="100%"
              onInput={() => {}}
            />
            <button class="bg-neutral-800 w-6 h-6 border border-neutral-900/[50%] rounded-xs flex items-center justify-center cursor-pointer">
              <i class="bi bi-tablet-landscape text-sky-400"></i>
            </button>
            <button class="w-6 h-6 border border-transparent rounded-xs flex items-center justify-center cursor-pointer">
              <i class="bi bi-folder-symlink text-white"></i>
            </button>
          </div>
        </div>
      </UIPanel>
      <UIPanel moveable={true} label="Properties">
        <div></div>
      </UIPanel>
    </main>
  );
}

function Select({
  options,
  value,
  onInput,
}: {
  options: string[];
  value: string;
  onInput: (e: Event) => void;
}) {
  return (
    <div class="bg-neutral-800 cursor-pointer relative border text-xs border-neutral-900/[50%] rounded-xs focus-within:border-neutral-600 group focus-within:ring-1 ring-sky-500">
      <select
        onInput={onInput}
        class="h-6 px-2 pr-6 rounded-xs flex outline-none items-center justify-center cursor-pointer"
      >
        <For each={options}>
          {(option) => (
            <option value={option} selected={option === value}>
              {option}
            </option>
          )}
        </For>
      </select>
      <div class="absolute pointer-events-none text-white bg-neutral-800 top-0 items-center left-0 w-[calc(100%_-_14px)] h-6 flex px-2 pr-6">
        {value}
      </div>
      <div class="flex text-center text-white pointer-events-none absolute right-0 w-[14px] h-6 top-0 border-l border-neutral-900 group-focus-within:border-neutral-600 flex-col items-center justify-center">
        <i class="bi bi-chevron-down text-[8px]"></i>
      </div>
    </div>
  );
}

function UIPanel({
  label,
  children,
  moveable,
}: {
  label: string;
  children: JSX.Element;
  moveable?: boolean;
}) {
  return (
    <div class="bg-neutral-700/[30%] border-neutral-900/[50%] border w-full h-full flex flex-col">
      <div class="flex items-center justify-between text-xs p-2 px-3">
        <p class="font-semibold text-neutral-300">{label}</p>
        <Show when={moveable}>
          <i class="bi bi-list text-white"></i>
        </Show>
      </div>
      <div class="flex-1 relative">
        <div class="absolute top-0 left-0 w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
