import { motion } from "framer-motion";
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";

const getColorClasses = (color: string) => {
  const colorMap = {
    primary: {
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      text: "text-white",
      numberBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      numberText: "text-white",
      pulse: "bg-blue-300",
    },
    secondary: {
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
      text: "text-white",
      numberBg: "bg-gradient-to-br from-purple-500 to-purple-700",
      numberText: "text-white",
      pulse: "bg-purple-300",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      text: "text-white",
      numberBg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      numberText: "text-white",
      pulse: "bg-emerald-300",
    },
    warning: {
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      text: "text-white",
      numberBg: "bg-gradient-to-br from-orange-500 to-orange-700",
      numberText: "text-white",
      pulse: "bg-orange-300",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};

const steps = [
  {
    key: "design",
    number: "01",
    title: "Build Your Dream Workflow",
    description:
      "Turn your wildest automation ideas into reality! Simply drag, drop, and connect magical AI blocks to create workflows that'll blow your mind.",
    icon: "lucide:pencil-ruler",
    color: "primary",
  },
  {
    key: "configure",
    number: "02",
    title: "Power Up Your AI Army",
    description:
      "Unleash the best AI minds on the planet! Connect ChatGPT, Gemini, and other AI superstars, then integrate with Slack, Gmail, GitHub, and hundreds of apps to create your personal digital workforce.",
    icon: "lucide:settings",
    color: "secondary",
  },
  {
    key: "execute",
    number: "03",
    title: "Watch the Magic Happen",
    description:
      "Hit play and watch your AI agents spring to life! See them tackle tasks, make decisions, and deliver results in real-time - it's like having superpowers!",
    icon: "lucide:play",
    color: "success",
  },
];

const HowItWorksSection: FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Chip
            startContent={<Icon icon="lucide:lightbulb" className="w-4 h-4" />}
            variant="flat"
            color="warning"
            className="mb-4"
          >
            How It Works
          </Chip>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            From crazy idea to
            <span className="text-primary-600 dark:text-primary-400">
              {" "}
              AI magic
            </span>
            <br />
            in 3 easy steps
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Creating AI that actually works has never been this fun! Follow
            these steps and watch your ideas transform into intelligent agents
            that amaze everyone.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            staggerChildren: 0.2,
            delayChildren: 0.3,
          }}
          className="relative"
        >
          <div className="hidden lg:block absolute top-32 left-1/4 right-1/4 h-px bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-800 dark:via-primary-600 dark:to-primary-800" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 * index,
                  ease: "easeOut",
                }}
                className="relative"
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                  className="relative z-10"
                >
                  <Card
                    className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CardBody className="text-center p-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className={`${getColorClasses(step.color).numberBg} ${getColorClasses(step.color).numberText} w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 relative`}
                      >
                        <span className="relative z-10">{step.number}</span>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.5,
                          }}
                          className={`absolute inset-0 ${getColorClasses(step.color).pulse} rounded-full`}
                        />
                      </motion.div>

                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className={`${getColorClasses(step.color).bg} p-3 rounded-xl w-fit mx-auto mb-4`}
                      >
                        <Icon
                          icon={step.icon}
                          className={`w-8 h-8 ${getColorClasses(step.color).text}`}
                        />
                      </motion.div>

                      <h3 className="text-xl font-bold text-foreground mb-4">
                        {step.title}
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">
                        {step.description}
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index + 0.5 }}
                    className="hidden lg:block absolute top-32 -right-4 z-20"
                  >
                    <div className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-md">
                      <Icon
                        icon="lucide:chevron-right"
                        className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      />
                    </div>
                  </motion.div>
                )}

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index + 0.5 }}
                    className="lg:hidden flex justify-center mt-4 mb-4"
                  >
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full">
                      <Icon
                        icon="lucide:chevron-down"
                        className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
