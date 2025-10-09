import { useEffect } from "react";

/**
 * Load scripts in order. basePath typically "/js/"
 * scripts: array of filenames or paths relative to basePath.
 */
export default function useLoadScripts(scripts = [], basePath = "/js/") {
  useEffect(() => {
    const appended = [];

    // load sequentially to preserve order
    (async () => {
      for (const s of scripts) {
        await new Promise((resolve) => {
          const src = s.startsWith("/") ? s : basePath + s;
          const script = document.createElement("script");
          script.src = src;
          script.async = false; // preserve order
          script.onload = () => resolve();
          script.onerror = () => resolve(); // still resolve on error
          document.body.appendChild(script);
          appended.push(script);
        });
      }
    })();

    return () => {
      appended.forEach((sc) => sc.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
