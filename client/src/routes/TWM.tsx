import { onCleanup, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

type MosaicItem = {
  direction: "row" | "column";
  splitPercentage: number;
  children: Array<string | MosaicItem>;
};

const [mosaicState, setMosaicState] = createStore<MosaicItem>({
  direction: "row",
  splitPercentage: 20,
  children: [
    {
      direction: "column",
      splitPercentage: 50,
      children: ["foo", "bar"],
    },
    {
      direction: "row",
      splitPercentage: 70,
      children: ["baz", "qux"],
    },
  ],
});

function Mosaic(props: { path: any[] }) {
  const getMosaicItem = (path: any[]): MosaicItem => {
    return path.reduce((acc, key) => acc[key], mosaicState);
  };

  // Derived State
  const split = () => getMosaicItem(props.path).splitPercentage;
  const setSplit = (newSplit: number) => {
    // @ts-ignore
    setMosaicState(...props.path, "splitPercentage", newSplit);
  };

  const direction = () => getMosaicItem(props.path).direction;
  const children = () => getMosaicItem(props.path).children;
  const hasTwoChildren = () => children().length === 2;

  // Derived flex properties
  const flexDir = () => (direction() === "row" ? "row" : "column");
  const child1Flex = () => split() / 100;
  const child2Flex = () => (100 - split()) / 100;
  const dividerCursor = () =>
    direction() === "row" ? "col-resize" : "row-resize";

  let containerRef: HTMLDivElement | undefined;
  let dragging = false;
  const dividerSize = 8; // Fixed size for divider

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    dragging = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    let newPercentage: number;

    if (direction() === "row") {
      newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
    }

    setSplit(Math.min(Math.max(newPercentage, 5), 95));
  };

  const handleMouseUp = () => {
    dragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  onMount(() => {
    onCleanup(() => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    });
  });

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        "flex-direction": flexDir(),
        position: "absolute",
        inset: "0",
      }}
    >
      <Show when={children().length > 0}>
        {typeof children()[0] === "string" ? (
          <div
            style={{
              flex: child1Flex(),
              "background-color": "#e5e7eb",
              padding: "1rem",
              overflow: "auto",
              position: "relative",
            }}
          >
            {children()[0]}
          </div>
        ) : (
          <div class="relative" style={{ flex: child1Flex() }}>
            <Mosaic path={[...props.path, "children", 0]} />
          </div>
        )}
      </Show>

      <Show when={hasTwoChildren()}>
        <div
          style={{
            cursor: dividerCursor(),
            "flex-shrink": 0,
            width: direction() === "row" ? `${dividerSize}px` : "100%",
            height: direction() === "row" ? "100%" : `${dividerSize}px`,
            "background-color": "#d1d5db",
          }}
          onMouseDown={handleMouseDown}
        />
      </Show>

      <Show when={children().length === 2}>
        {typeof children()[1] === "string" ? (
          <div
            style={{
              flex: child2Flex(),
              "background-color": "#e5e7eb",
              padding: "1rem",
              overflow: "auto",
              position: "relative",
            }}
          >
            {children()[1]}
          </div>
        ) : (
          <div class="relative" style={{ flex: child2Flex() }}>
            <Mosaic path={[...props.path, "children", 1]} />
          </div>
        )}
      </Show>
    </div>
  );
}

export default function DraggableMosaic() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: "0",
        left: "0",
      }}
    >
      <Mosaic path={[]} />
    </main>
  );
}
