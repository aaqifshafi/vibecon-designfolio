"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useTransform, motion, MotionValue, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

type TextOpacityEnum = "none" | "soft" | "medium";
type ViewTypeEnum = "word" | "letter";

type TextGradientScrollType = {
  text: string;
  type?: ViewTypeEnum;
  className?: string;
  textOpacity?: TextOpacityEnum;
};

type LetterType = {
  children: React.ReactNode | string;
  progress: MotionValue<number>;
  range: number[];
};

type WordType = {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: number[];
};

type CharType = {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: number[];
};

type TextGradientScrollContextType = {
  textOpacity?: TextOpacityEnum;
  type?: ViewTypeEnum;
};

const TextGradientScrollContext = createContext<TextGradientScrollContextType>(
  {}
);

function useGradientScroll() {
  const context = useContext(TextGradientScrollContext);
  return context;
}

function TextGradientScroll({
  text,
  className,
  type = "letter",
  textOpacity = "soft",
}: TextGradientScrollType) {
  const progress = useMotionValue(0);

  useEffect(() => {
    // Automatically animate the text over 3 seconds when the component mounts
    const controls = animate(progress, 1, { 
      duration: 3, 
      ease: "easeInOut",
      delay: 0.2
    });
    return controls.stop;
  }, [progress]);

  // Split by double newline to maintain paragraphs
  const paragraphs = text.split("\n\n");
  
  let totalWords = 0;
  const paragraphWords = paragraphs.map(p => {
    const words = p.split(/\s+/).filter(w => w.length > 0);
    totalWords += words.length;
    return words;
  });

  let currentWordIndex = 0;

  return (
    <TextGradientScrollContext.Provider value={{ textOpacity, type }}>
      <div className={cn("", className)}>
        {paragraphWords.map((words, pIndex) => (
          <p key={pIndex} className={pIndex < paragraphWords.length - 1 ? "mb-8" : "m-0"}>
            {words.map((word, i) => {
              const start = currentWordIndex / totalWords;
              const end = (currentWordIndex + 1) / totalWords;
              currentWordIndex++;
              return (
                <span key={i}>
                  {type === "word" ? (
                    <Word progress={progress} range={[start, end]}>
                      {word}
                    </Word>
                  ) : (
                    <Letter progress={progress} range={[start, end]}>
                      {word}
                    </Letter>
                  )}
                  {i < words.length - 1 && " "}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </TextGradientScrollContext.Provider>
  );
}

export { TextGradientScroll };

const Word = ({ children, progress, range }: WordType) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative inline-block">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity: opacity }}>
        {children}
      </motion.span>
    </span>
  );
};

const Letter = ({ children, progress, range }: LetterType) => {
  if (typeof children === "string") {
    const amount = range[1] - range[0];
    const step = amount / children.length;

    return (
      <span className="relative inline-block">
        {children.split("").map((char: string, i: number) => {
          const start = range[0] + i * step;
          const end = range[0] + (i + 1) * step;
          return (
            <Char key={`c_${i}`} progress={progress} range={[start, end]}>
              {char}
            </Char>
          );
        })}
      </span>
    );
  }
};

const Char = ({ children, progress, range }: CharType) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const { textOpacity } = useGradientScroll();

  return (
    <span>
      <span
        className={cn("absolute", {
          "opacity-0": textOpacity == "none",
          "opacity-10": textOpacity == "soft",
          "opacity-30": textOpacity == "medium",
        })}
      >
        {children}
      </span>
      <motion.span
        style={{
          opacity: opacity,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};
