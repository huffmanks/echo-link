import { useEffect, useState } from "react";

export function useKeyboardVisible() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vc = window.visualViewport;
    if (!vc) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const isShrunk = vc.height < window.screen.height * 0.75;
        const isInputFocused =
          ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "") ||
          (document.activeElement as HTMLElement)?.isContentEditable;

        setIsOpen(!!(isShrunk && isInputFocused));
      }, 100);
    };

    vc.addEventListener("resize", handleResize);
    return () => {
      vc.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isOpen;
}
