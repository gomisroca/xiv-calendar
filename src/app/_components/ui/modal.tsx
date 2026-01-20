"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ComponentRef<"dialog">>(null);

  useEffect(() => {
    const body = document.body;
    if (dialogRef.current?.open) {
      body.classList.add("overflow-hidden");
    }

    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  return createPortal(
    <div className="absolute top-0 right-0 bottom-0 left-0 z-1000 flex items-center justify-center bg-black/70">
      <dialog
        ref={dialogRef}
        className="max-height-[500px] relative m-auto flex w-[80%] max-w-125 items-center justify-center rounded-lg bg-white p-4 dark:bg-black"
        onClose={onDismiss}
      >
        {children}
        <button
          aria-label="Close"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 h-6 w-6 cursor-pointer rounded-full bg-zinc-950 transition hover:bg-zinc-900"
        >
          X
        </button>
      </dialog>
    </div>,
    document.getElementById("modal-root")!,
  );
}
