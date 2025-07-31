import { useState, useEffect } from "react";

type WindowDimensions = {
  width: number;
  height: number;
};

/**
 * Custom hook that provides the current width and height of the browser window.
 *
 * This hook listens for the window resize event and updates its state accordingly,
 * providing real-time dimensions of the window. It returns an object containing
 * `width` and `height` properties which represent the current pixel dimensions of
 * the window.
 *
 * @returns {WindowDimensions} An object containing the current
 * window width and height in pixels.
 */
export const useWindowDimensions = (): WindowDimensions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};
