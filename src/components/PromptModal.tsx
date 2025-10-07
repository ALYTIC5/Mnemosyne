// src/components/PromptModal.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect } from "react";

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  lines: string[];
}

export default function PromptModal({ open, onClose, title, lines }: PromptModalProps) {
  // close with Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 bg-surface text-text rounded-2xl shadow-lg border border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-primary">{title}</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-400 hover:text-primary" />
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((l, i) => (
              <p key={i} className="text-sm leading-relaxed">{l}</p>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-primary text-white rounded-xl py-2 font-medium hover:bg-primaryDark transition"
          >
            Close
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
