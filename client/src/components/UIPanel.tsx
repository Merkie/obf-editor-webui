import { Accessor, For, JSX, Show } from "solid-js";
import { cn } from "../lib/cn";

export function UIPanel({
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
      <div class="flex items-center justify-between text-xs p-2 px-3 border-b border-neutral-900/[50%]">
        <p class="font-semibold text-neutral-300">{label}</p>
        <Show when={moveable}>
          <i class="bi bi-list text-white"></i>
        </Show>
      </div>
      <div class="flex-1 relative">
        <div class="absolute top-0 left-0 w-full h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

export function UIPanelFooter({ children }: { children: JSX.Element }) {
  return (
    <div class="flex gap-1 items-center text-sm p-1 border-t border-neutral-900/[50%]">
      {children}
    </div>
  );
}

export function UIPanelFooterButton({
  children,
  toggled,
  onClick,
}: {
  children: JSX.Element;
  toggled?: Accessor<boolean>;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      class={cn(
        "w-6 h-6 active:opacity-100 text-white border border-transparent rounded-xs flex items-center justify-center cursor-pointer",
        {
          "bg-neutral-800 text-sky-400 border-neutral-900/[50%]": toggled?.(),
          "hover:opacity-70": !toggled?.(),
        }
      )}
    >
      {children}
    </button>
  );
}

export function UIPanelFooterSelect({
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
