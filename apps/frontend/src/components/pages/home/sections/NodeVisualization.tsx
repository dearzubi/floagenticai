import { FC } from "react";
import { motion } from "framer-motion";
import type { Transition, RepeatType } from "framer-motion";
import { Icon } from "@iconify/react";

type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

const floatTransition: Transition = {
  duration: 6,
  repeat: Infinity,
  repeatType: "mirror" as RepeatType,
  ease: [0.42, 0, 0.58, 1],
};

function toPercent(n: number, base: number) {
  return `${(n / base) * 100}%`;
}

function createCurvedPath(start: Point, end: Point, curvature: number = 0.5) {
  const dx = end.x - start.x;
  const _dy = end.y - start.y;

  const c1x = start.x + dx * curvature;
  const c1y = start.y;
  const c2x = end.x - dx * curvature;
  const c2y = end.y;

  return `M ${start.x},${start.y} C ${c1x},${c1y} ${c2x},${c2y} ${end.x},${end.y}`;
}

const Card: FC<{
  title?: string;
  accentFrom: string;
  accentTo: string;
  rect: Rect;
  canvas: { width: number; height: number };
  delay?: number;
  icon: string;
}> = ({ accentFrom, accentTo, rect, canvas, delay = 0, icon }) => {
  return (
    <motion.div
      className="absolute select-none"
      style={{
        left: toPercent(rect.x, canvas.width),
        top: toPercent(rect.y, canvas.height),
        width: toPercent(rect.w, canvas.width),
        height: toPercent(rect.h, canvas.height),
      }}
      initial={{ y: 0, rotateX: 0, rotateY: 0 }}
      animate={{ y: [0, -6, 0, 6, 0] }}
      transition={{ ...floatTransition, delay }}
    >
      <div className="relative">
        <div
          className="absolute -inset-0.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
            opacity: 0.3,
          }}
          aria-hidden
        />
        <div
          className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur"
          style={{
            boxShadow: `0 15px 45px ${accentFrom}40, 0 5px 15px ${accentTo}30`,
          }}
        >
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-white"
            style={{
              background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
            }}
          >
            <span className="text-lg" aria-hidden>
              <Icon icon={icon} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NodeVisualization: FC = () => {
  // Fixed coordinate system for the scene; everything scales responsively
  const width = 1100;
  const height = 620;

  // Node rectangles (top-left coordinates in canvas units)
  // Square nodes of equal size (icon-only)
  const nodeSize = 150;
  const chat: Rect = { x: 120, y: 335, w: nodeSize, h: nodeSize };
  const router: Rect = { x: 500, y: 345, w: nodeSize, h: nodeSize };
  const agentTop: Rect = { x: 880, y: 230, w: nodeSize, h: nodeSize };
  const agentBottom: Rect = { x: 880, y: 460, w: nodeSize, h: nodeSize };
  const floatingAgent: Rect = { x: 80, y: 180, w: nodeSize, h: nodeSize };

  // Edge anchors (connect from side centers)
  const anchorPad = 16;
  const chatRight: Point = {
    x: chat.x + chat.w + anchorPad,
    y: chat.y + chat.h / 2 + 30,
  };
  const routerLeft: Point = {
    x: router.x - anchorPad,
    y: router.y + router.h / 2 + 40,
  };
  const routerRight: Point = {
    x: router.x + router.w + anchorPad,
    y: router.y + router.h / 2 + 25,
  };
  const agentTopLeft: Point = {
    x: agentTop.x - anchorPad,
    y: agentTop.y + agentTop.h / 10,
  };
  const agentBottomLeft: Point = {
    x: agentBottom.x - anchorPad,
    y: agentBottom.y + agentBottom.h + 60,
  };

  const pathChatToRouter = createCurvedPath(chatRight, routerLeft, 0.6);
  const pathRouterToTop = createCurvedPath(routerRight, agentTopLeft, 0.4);
  const pathRouterToBottom = createCurvedPath(
    routerRight,
    agentBottomLeft,
    0.4,
  );

  return (
    <div className="relative mx-auto w-full max-w-[1100px]">
      <motion.div
        className="relative rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/0 p-8 backdrop-blur-xl overflow-visible"
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0, 8, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: [0.42, 0, 0.58, 1],
        }}
      >
        <div className="relative" style={{ height }}>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
          >
            <defs>
              <linearGradient id="edgeChat" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2fd3a2" />
                <stop offset="100%" stopColor="#f6d365" />
              </linearGradient>

              <linearGradient id="edgeB" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f6d365" />
                <stop offset="100%" stopColor="#6f86d6" />
              </linearGradient>
              <linearGradient id="edgeC" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f6d365" />
                <stop offset="100%" stopColor="#84fab0" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={pathChatToRouter}
              stroke="url(#edgeChat)"
              strokeWidth={10}
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <path
              d={pathRouterToTop}
              stroke="url(#edgeB)"
              strokeWidth={8}
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <path
              d={pathRouterToBottom}
              stroke="url(#edgeC)"
              strokeWidth={8}
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </svg>

          <Card
            title="Chat Trigger"
            accentFrom="#00ff88"
            accentTo="#0099ff"
            icon="lucide:message-circle"
            delay={0.1}
            rect={chat}
            canvas={{ width, height }}
          />

          <Card
            title="Router Agent 0"
            accentFrom="#ffaa00"
            accentTo="#ff4400"
            icon="lucide:shuffle"
            delay={0.3}
            rect={router}
            canvas={{ width, height }}
          />

          <Card
            title="Agent 0"
            accentFrom="#4466ff"
            accentTo="#aa44ff"
            icon="lucide:bot"
            delay={0.2}
            rect={agentTop}
            canvas={{ width, height }}
          />

          <Card
            title="Agent 1"
            accentFrom="#44ff99"
            accentTo="#00ddff"
            icon="lucide:bot"
            delay={0.4}
            rect={agentBottom}
            canvas={{ width, height }}
          />

          <motion.div
            className="absolute select-none"
            style={{
              left: toPercent(floatingAgent.x, width),
              top: toPercent(floatingAgent.y, height),
              width: toPercent(floatingAgent.w, width),
              height: toPercent(floatingAgent.h, height),
            }}
            initial={{ y: 0, x: 0, rotate: 0, scale: 1 }}
            animate={{
              x: [0, 15, 8, 12, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          >
            <div className="relative">
              <div
                className="absolute -inset-0.5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #ff4477, #ff99dd)",
                  opacity: 0.3,
                }}
                aria-hidden
              />
              <div
                className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur"
                style={{
                  boxShadow: `0 15px 45px #ff447740, 0 5px 15px #ff99dd30`,
                }}
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg, #ff4477, #ff99dd)",
                  }}
                >
                  <span className="text-lg" aria-hidden>
                    <Icon icon={"lucide:bot"} />
                  </span>
                </div>
              </div>

              <motion.div
                className="absolute -bottom-10 -right-2 text-xl text-white z-10"
                initial={{ scale: 1, rotate: 0 }}
                animate={{
                  rotate: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon icon="lucide:mouse-pointer-click" color={"white"} />️
              </motion.div>
              <motion.div className="absolute -bottom-4 -right-3 h-8 w-8 rounded-full border-white/30 bg-danger-300" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NodeVisualization;
