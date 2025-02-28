import { onCleanup, onMount } from "solid-js";

export default function PreventZoom() {
  const handleGestureStart = (event: Event) => {
    event.preventDefault();
  };

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevents zooming via Ctrl + Scroll
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.ctrlKey &&
      (event.key === "+" ||
        event.key === "=" ||
        event.key === "-" ||
        event.key === "0")
    ) {
      event.preventDefault(); // Prevents zooming via Ctrl + Plus/Minus/0
    }
  };

  const handleResize = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  };

  onMount(() => {
    addEventListener("gesturestart", handleGestureStart);
    addEventListener("wheel", handleWheel, { passive: false });
    addEventListener("keydown", handleKeyDown);
    addEventListener("resize", handleResize);
  });

  onCleanup(() => {
    removeEventListener("gesturestart", handleGestureStart);
    removeEventListener("wheel", handleWheel);
    removeEventListener("keydown", handleKeyDown);
    removeEventListener("resize", handleResize);
  });

  return null; // This component doesn't render anything
}
