// components/sections/HoshloopTextAnimation.js

import { useEffect, useState } from "react";

const HoshloopTextAnimation = () => {
  const [hoshText, setHoshText] = useState("Hosh");
  const hoshVariants = ["Fast", "Smart", "Service", "Perfect", "Hosh"];
  let hoshIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setHoshText(hoshVariants[hoshIndex % hoshVariants.length]);
      hoshIndex++;

      if (hoshIndex >= hoshVariants.length) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="flex justify-center items-center space-x-2 text-4xl font-bold">
      <div className="text-green-500 overflow-hidden relative">{hoshText}</div>
      <div className="text-white">loop</div>
    </div>
  );
};

export default HoshloopTextAnimation;
