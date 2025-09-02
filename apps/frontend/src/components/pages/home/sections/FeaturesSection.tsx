import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";

const getColorClasses = (color: string) => {
  const colorMap = {
    primary: {
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      text: "text-white",
    },
    secondary: {
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
      text: "text-white",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      text: "text-white",
    },
    warning: {
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      text: "text-white",
    },
    danger: {
      bg: "bg-gradient-to-br from-red-400 to-red-600",
      text: "text-white",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};

const features = [
  {
    key: "visual-builder",
    icon: "lucide:puzzle",
    title: "Build Like Playing with LEGO",
    description:
      "Simply drag and drop blocks to create your AI assistant! No complex coding - just connect the pieces and watch magic happen.",
    color: "primary",
  },
  {
    key: "ai-integration",
    icon: "lucide:brain",
    title: "The Best AI Minds Working for You",
    description:
      "Get ChatGPT, Gemini, and other top AI models all working together in your workflows - like having a team of genius assistants!",
    color: "secondary",
  },
  {
    key: "no-code",
    icon: "lucide:wand-2",
    title: "Zero Coding Required",
    description:
      "If you can use Google Docs or PowerPoint, you can build AI agents! Simple drag and drop - no programming degree needed.",
    color: "success",
  },
  {
    key: "real-time",
    icon: "lucide:zap",
    title: "Watch Your AI Come Alive",
    description:
      "See your AI agents working in real-time! Watch them read emails, send messages, and complete tasks right before your eyes.",
    color: "warning",
  },
  {
    key: "credentials",
    icon: "lucide:shield-check",
    title: "Secure Credential Management",
    description:
      "Your API keys and passwords are safely encrypted and stored. Build with confidence knowing your credentials are protected.",
    color: "danger",
  },
  {
    key: "triggers",
    icon: "lucide:play-circle",
    title: "Agents That Wake Up When You Need Them",
    description:
      "Set your AI to spring into action when you get an email, send a message, or even on a schedule - like having a 24/7 assistant!",
    color: "primary",
  },
  {
    key: "mcp-support",
    icon: "lucide:plug",
    title: "Connect to Everything You Use",
    description:
      "Your agents can talk to Slack, Gmail, GitHub, and hundreds of other apps - making them incredibly useful in your daily life!",
    color: "secondary",
  },
];

const FeaturesSection: FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-gray-50/50 dark:from-background dark:to-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            <Icon icon="lucide:star" className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Create magic with
            <span className="text-primary-600 dark:text-primary-400">
              {" "}
              AI that works
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Imagine having AI assistants that can handle your tasks, automate
            your work, and make your daily life easier - all built by simply
            connecting visual blocks!
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            staggerChildren: 0.1,
            delayChildren: 0.2,
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 * index,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="h-full"
            >
              <Card
                className="h-full border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                style={{
                  boxShadow:
                    "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
                }}
              >
                <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className={`${getColorClasses(feature.color).bg} p-4 rounded-2xl mb-4`}
                  >
                    <Icon
                      icon={feature.icon}
                      className={`w-8 h-8 ${getColorClasses(feature.color).text}`}
                    />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground text-center">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardBody className="pt-0 pb-8 px-6">
                  <p className="text-foreground/70 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
