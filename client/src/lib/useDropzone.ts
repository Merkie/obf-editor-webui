import { onCleanup, onMount, Setter } from "solid-js";

export default function useDropzone({
  onDrop,
  setIsDragging,
}: {
  onDrop: (files: FileList) => void;
  setIsDragging: Setter<boolean>;
}) {
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onDrop(files);
    }
  };

  onMount(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
  });

  onCleanup(() => {
    document.removeEventListener("dragenter", handleDragEnter);
    document.removeEventListener("dragover", handleDragOver);
    document.removeEventListener("dragleave", handleDragLeave);
    document.removeEventListener("drop", handleDrop);
  });
}
