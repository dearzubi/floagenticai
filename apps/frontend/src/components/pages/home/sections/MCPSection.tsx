import { motion } from "framer-motion";
import { Card, CardBody, Chip } from "@heroui/react";
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
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};

const mcpBenefits = [
  {
    key: "supercharged",
    icon: "lucide:zap",
    title: "Supercharged AI Agents",
    description:
      "Your agents can instantly connect to any service, pull real-time data, and take actions across platforms - making them incredibly powerful.",
    color: "primary",
  },
  {
    key: "unlimited",
    icon: "lucide:infinity",
    title: "Unlimited Possibilities",
    description:
      "From reading your emails to updating spreadsheets, your AI agents can interact with hundreds of tools and services seamlessly.",
    color: "secondary",
  },
  {
    key: "intelligent",
    icon: "lucide:brain",
    title: "Truly Intelligent Workflows",
    description:
      "Agents that understand context, remember conversations, and can perform complex multi-step tasks across different platforms automatically.",
    color: "success",
  },
];

const mcpServices = [
  { name: "OpenAI", logo: "simple-icons:openai", color: "#10a37f" },
  { name: "Anthropic", logo: "simple-icons:anthropic", color: "#d4a574" },
  { name: "DeepSeek", logo: "hugeicons:deepseek", color: "#1976d2" },
  { name: "Gemini", logo: "material-icon-theme:gemini-ai", color: "#4285f4" },
  { name: "Open Router", logo: "lucide:route", color: "#6366f1" },
  { name: "Slack", logo: "logos:slack-icon", color: "#4a154b" },
  { name: "Discord", logo: "simple-icons:discord", color: "#5865f2" },
  { name: "Gmail", logo: "simple-icons:gmail", color: "#ea4335" },
  {
    name: "Google Calendar",
    logo: "logos:google-calendar",
    color: "#4285f4",
  },
  { name: "Google Maps", logo: "logos:google-maps", color: "#4285f4" },
  { name: "GitHub", logo: "simple-icons:github", color: "#181717" },
  { name: "Brave Search", logo: "simple-icons:brave", color: "#fb542b" },
  { name: "Perplexity AI", logo: "logos:perplexity-icon", color: "#20b2aa" },
];

const MCPSection: FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Chip
            startContent={<Icon icon="lucide:plug" className="w-4 h-4" />}
            variant="flat"
            color="primary"
            className="mb-4"
          >
            Model Context Protocol
          </Chip>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Powered by
            <span className="text-primary-600 dark:text-primary-400"> MCP</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Give your AI agents superpowers! With MCP integration, your agents
            can read your emails, update your calendar, analyze data, and
            interact with any connected service - all in one seamless workflow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            staggerChildren: 0.1,
            delayChildren: 0.2,
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {mcpBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.key}
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
                y: -5,
                transition: { duration: 0.2 },
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
                <CardBody className="text-center p-8">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className={`${getColorClasses(benefit.color).bg} p-4 rounded-2xl mb-6 w-fit mx-auto`}
                  >
                    <Icon
                      icon={benefit.icon}
                      className={`w-8 h-8 ${getColorClasses(benefit.color).text}`}
                    />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Your Agents Can Connect to Everything
          </h3>
          <p className="text-foreground/60 mb-12 max-w-2xl mx-auto">
            Imagine agents that can read your Slack messages, update your Notion
            docs, analyze your data, and so much more - all automatically!
          </p>

          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
            <motion.div
              className="flex space-x-12"
              animate={{
                x: [0, -1200], // Move logos to the left
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {mcpServices.map((service, index) => (
                <motion.div
                  key={`first-${service.name}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  className="flex-shrink-0 flex flex-col items-center group cursor-pointer min-w-[80px]"
                >
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Icon
                      icon={service.logo}
                      className="w-8 h-8"
                      style={{ color: service.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    {service.name}
                  </span>
                </motion.div>
              ))}
              {mcpServices.map((service) => (
                <motion.div
                  key={`second-${service.name}`}
                  className="flex-shrink-0 flex flex-col items-center group cursor-pointer min-w-[80px]"
                >
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Icon
                      icon={service.logo}
                      className="w-8 h-8"
                      style={{ color: service.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    {service.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300">
              <Icon icon="lucide:info" className="w-4 h-4" />
              <span className="text-sm font-medium">
                Learn more about MCP at{" "}
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  modelcontextprotocol.io
                </a>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MCPSection;
