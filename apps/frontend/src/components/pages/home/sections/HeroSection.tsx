import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import NodeVisualization from "./NodeVisualization";

const HeroSection: FC = () => {
  return (
    <section className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-sky-50/70 via-blue-50/50 to-indigo-50/60 dark:from-sky-900/10 dark:via-blue-900/10 dark:to-indigo-900/15">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 800"
        >
          <defs>
            <pattern
              id="dottedGrid"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="rgba(59, 130, 246, 0.15)" />
            </pattern>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="rgba(147, 51, 234, 0.1)" />
            </pattern>
            <pattern
              id="triangles"
              x="0"
              y="0"
              width="80"
              height="70"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="40,5 70,60 10,60"
                fill="none"
                stroke="rgba(6, 182, 212, 0.08)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="grid"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(59, 130, 246, 0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dottedGrid)" />
          <rect width="100%" height="100%" fill="url(#triangles)" />
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <motion.div
          animate={{
            rotate: [0, 360],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/5 w-16 h-16 border-2 border-blue-400/20 transform rotate-45"
        />

        <motion.div
          animate={{
            rotate: [0, -360],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 3,
          }}
          className="absolute top-3/4 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/10 to-cyan-400/10 rounded-full"
        />

        <motion.div
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/3 left-2/3 w-8 h-8"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <polygon
              points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
              fill="none"
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        {/* Additional Geometric Shapes */}
        <motion.div
          animate={{
            rotate: [0, 120, 240, 360],
            x: [0, 30, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 right-1/5 w-10 h-10"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <polygon
              points="12,2 22,20 2,20"
              fill="none"
              stroke="rgba(147, 51, 234, 0.12)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -90, -180, -270, -360],
            y: [0, -25, 0, 25, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/6 right-1/3 w-6 h-6 border border-cyan-400/20"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 0.8, 1],
            rotate: [0, 45, 90, 135, 180],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-1/5 right-1/6 w-5 h-5 bg-gradient-to-br from-blue-400/10 to-purple-400/10 transform rotate-45"
        />

        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8,
          }}
          className="absolute top-2/3 left-1/6 w-7 h-7"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="rgba(59, 130, 246, 0.12)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 72, 144, 216, 288, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
          className="absolute top-1/3 left-1/4 w-9 h-9"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <polygon
              points="12,2 15.5,8.5 22,9.5 17,14.5 18.5,21 12,17.5 5.5,21 7,14.5 2,9.5 8.5,8.5"
              fill="none"
              stroke="rgba(6, 182, 212, 0.10)"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left h-full flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <Icon icon="lucide:sparkles" className="w-4 h-4" />
                No-Code Agentic AI Workflow Builder
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                FloAgenticAI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl sm:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold tracking-wider"
            >
              Become an AI wizard overnight! Create smart agents that work while
              you sleep, handling everything from boring tasks to complex
              workflows - just drag, drop, connect, and watch the magic happen!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-full shadow-lg bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white border-none hover:shadow-xl hover:shadow-violet-500/25 transition-all duration-300 focus:outline-none"
                    startContent={
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Icon icon="lucide:rocket" className="w-5 h-5" />
                      </motion.div>
                    }
                  >
                    Get Started Free
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            <NodeVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
