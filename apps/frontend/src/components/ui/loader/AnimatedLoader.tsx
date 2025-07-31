import { motion } from "framer-motion";
import { cn } from "../../../utils/ui.ts";
import { FC, useMemo } from "react"; // Assuming you have a cn utility for classnames

type AnimatedLoaderProps = {
  message?: string;
  className?: string;
  dotsContainerClassName?: string;
  dotClassName?: string;
  textClassName?: string;
  numberOfDots?: number;
};

const loadingMessages = [
  "Brewing something awesome for you...",
  "Warming up the digital hamsters...",
  "Connecting the dots... (literally!)",
  "Engaging hyper-focus mode...",
  "Polishing the pixels to perfection...",
  "Hold onto your hats, nearly there!",
  "Unpacking the digital goodness...",
  "Our digital agents are on it!",
  "Consulting the AI oracle...",
  "Warming up the neural networks...",
  "Letting the algorithms do their thing...",
  "Your intelligent experience is loading...",
  "Just a moment, getting things ready...",
  "Hang tight, we're almost there!",
  "Prepping your dashboard...",
];

const dotVariants = {
  initial: {
    opacity: 0.3,
    scale: 0.8,
  },
  animate: {
    opacity: [0.3, 1, 0.3], // Fades in and out
    scale: [0.8, 1.2, 0.8], // Scales up and down
  },
};

const AnimatedLoader: FC<AnimatedLoaderProps> = ({
  message,
  className,
  dotsContainerClassName = "flex space-x-4 mb-8",
  dotClassName = "w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-500",
  textClassName = "text-xl font-medium text-gray-700 dark:text-gray-300",
  numberOfDots = 5,
}) => {
  const selectedMessage = useMemo(() => {
    if (message) {
      return message;
    }
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
  }, [message]);

  const dotTransition = (index: number) => ({
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
    delay: index * 0.25,
  });

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 bg-transparent min-h-[70vh]",
        className,
      )}
    >
      <div className={cn(dotsContainerClassName)}>
        {Array.from({ length: numberOfDots }).map((_, index) => (
          <motion.div
            /* eslint-disable-next-line react-x/no-array-index-key */
            key={index}
            className={cn(dotClassName)}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={dotTransition(index)}
          />
        ))}
      </div>
      {selectedMessage && (
        <p className={cn(textClassName)}>{selectedMessage}</p>
      )}
    </div>
  );
};

export default AnimatedLoader;
