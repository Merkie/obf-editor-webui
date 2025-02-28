import { JSX } from "solid-js";
import Icons from "./Icons";
import { activeGroup, setActiveGroup } from "../lib/global-state";

export function AppHeader({ children }: { children: JSX.Element }) {
  return (
    <div class="bg-[var(--ui-bg-color)] p-6 pb-0 flex flex-col gap-4">
      {children}
    </div>
  );
}

export function SentenceBuilder() {
  return (
    <div class="gap-3 grid-rows-1 grid grid-cols-10">
      <HeaderButton icon={<Icons.Home class="size-10" />} />
      <div class="bg-[var(--sentence-builder-bg-color)] border-1 border-[var(--sentence-builder-border-color)] h-full col-span-7 rounded-xl"></div>
      <HeaderButton icon={<Icons.Backspace class="size-10" />} />
      <HeaderButton icon={<Icons.Trash class="size-10" />} />
    </div>
  );
}

export function GroupTabsRow() {
  return (
    <div class="gap-3 grid-rows-1 grid grid-cols-10 overflow-hidden">
      <ButtonGroupTab group="pronouns" color="orange" />
      <ButtonGroupTab group="basic-verbs" color="pink" />
      <ButtonGroupTab group="action-verbs" color="rose" />
      <ButtonGroupTab group="prepositions" color="green" />
      <ButtonGroupTab group="adjectives" color="blue" />
      <ButtonGroupTab group="questions" color="grey" />
      <ButtonGroupTab group="conversation-management" color="purple" />
      <ButtonGroupTab group="nouns" color="yellow" />
      <ButtonGroupTab group="other" color="orange" />
    </div>
  );
}

function HeaderButton({ icon }: { icon: JSX.Element }) {
  return (
    <button class="p-4 cursor-pointer flex items-center justify-center bg-[var(--ui-button-bg-color)] text-[var(--ui-button-text-color)] rounded-xl border-b-[3px] border-[var(--ui-button-border-color)] active:brightness-95 active:border-b-0">
      {icon}
    </button>
  );
}

function ButtonGroupTab({ color, group }: { color: string; group: string }) {
  return (
    <button
      onClick={() => {
        if (activeGroup() === group) {
          setActiveGroup("");
        } else {
          setActiveGroup(group);
        }
      }}
      class="w-full h-[40px] cursor-pointer"
    >
      <div
        style={{
          background: `var(--button-bg-color-${color})`,
          transform: `translateY(${activeGroup() === group ? "20px" : "0"})`,
        }}
        class="w-full h-[40px] rounded-t-xl relative overflow-hidden"
      >
        <div
          style={{
            background: `var(--button-border-color-${color})`,
          }}
          class="pointer-events-none w-[70%] rounded-b-2xl absolute h-[10px] top-0 left-1/2 -translate-x-1/2"
        ></div>
      </div>
    </button>
  );
}
