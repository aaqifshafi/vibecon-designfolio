import * as React from "react";
import { LayoutGroup, motion, useAnimate } from "motion/react";
import type { Transition } from "motion/react";

export interface OrbitItem {
  id: number;
  name: string;
  src: string;
}

interface RadialIntroProps {
  orbitItems: OrbitItem[];
  stageSize?: number;
  imageSize?: number;
}

const spring: Transition = {
  delay: 0,
  stiffness: 300,
  damping: 35,
  type: "spring",
  restSpeed: 0.01,
  restDelta: 0.01,
};

const spinConfig = {
  duration: 28,
  ease: "linear" as const,
  repeat: Infinity,
};

const revealEase = [0.22, 1, 0.36, 1] as const; // ease-out-quint

const qsa = (root: Element, sel: string) => Array.from(root.querySelectorAll(sel));
const angleOf = (el: Element) => Number((el as HTMLElement).dataset.angle || 0);
const armOfImg = (img: Element) =>
  (img as HTMLElement).closest("[data-arm]") as HTMLElement | null;

export function RadialIntro({
  orbitItems,
  stageSize = 500,
  imageSize = 48,
}: RadialIntroProps) {
  const step = 360 / orbitItems.length;
  const [scope, animate] = useAnimate();

  React.useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const arms = qsa(root, "[data-arm]");
    const imgs = qsa(root, "[data-arm-img]");
    const stops: Array<() => void> = [];

    // Fan arms to their orbit angles; counter-rotate images to stay upright.
    // Images stay invisible (opacity 0) during this phase.
    const seq = [
      ...arms.map((el) => [el, { rotate: angleOf(el) }, { ...spring, at: 0 }]),
      ...imgs.map((img) => [
        img,
        { rotate: -angleOf(armOfImg(img)!) },
        { ...spring, at: 0 },
      ]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;
    setTimeout(() => animate(seq), 200);

    // Staggered blur-in + slide-up reveal after arms have settled
    setTimeout(() => {
      imgs.forEach((img, idx) => {
        setTimeout(() => {
          animate(
            img,
            { opacity: 1, filter: "blur(0px)", y: 0 },
            { duration: 0.55, ease: revealEase },
          );
        }, idx * 70);
      });
    }, 700);

    // Begin continuous slow rotation
    setTimeout(() => {
      arms.forEach((el) => {
        const a = angleOf(el);
        const ctrl = animate(el, { rotate: [a, a + 360] }, spinConfig);
        stops.push(() => ctrl.cancel());
      });
      imgs.forEach((img) => {
        const arm = armOfImg(img);
        const a = arm ? angleOf(arm) : 0;
        const ctrl = animate(img, { rotate: [-a, -a - 360] }, spinConfig);
        stops.push(() => ctrl.cancel());
      });
    }, 1100);

    return () => stops.forEach((s) => s());
  }, []);

  return (
    <LayoutGroup>
      <motion.div
        ref={scope}
        className="relative overflow-visible pointer-events-none select-none"
        style={{ width: stageSize, height: stageSize }}
        initial={false}
      >
        {orbitItems.map((item, i) => (
          <motion.div
            key={item.id}
            data-arm
            className="will-change-transform absolute inset-0"
            style={{ zIndex: orbitItems.length - i }}
            data-angle={i * step}
            layoutId={`arm-${item.id}`}
          >
            <motion.img
              data-arm-img
              src={item.src}
              alt={item.name}
              draggable={false}
              className="absolute left-1/2 -translate-x-1/2 rounded-full"
              style={{
                top: 0,
                width: imageSize,
                height: imageSize,
                opacity: 0,
                filter: "blur(8px)",
                y: 8,
              }}
              layoutId={`arm-img-${item.id}`}
            />
          </motion.div>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}
