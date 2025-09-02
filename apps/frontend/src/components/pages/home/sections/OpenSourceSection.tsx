import { motion } from "framer-motion";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { useGitHubStats } from "../../../../hooks/github/api/useGitHubData";

const getColorClasses = (color: string) => {
  const colorMap = {
    warning: {
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      text: "text-white",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      text: "text-white",
    },
    primary: {
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      text: "text-white",
    },
    secondary: {
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
      text: "text-white",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};

const OpenSourceSection: FC = () => {
  const { stats, isLoading, isError } = useGitHubStats();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-900 dark:to-primary-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Chip
                startContent={<Icon icon="lucide:heart" className="w-4 h-4" />}
                variant="flat"
                color="danger"
                className="mb-4"
              >
                Open Source
              </Chip>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Built by the
                <span className="text-primary-600 dark:text-primary-400">
                  {" "}
                  community
                </span>
                , for the community
              </h2>
              <p className="text-xl text-foreground/70 leading-relaxed mb-8">
                FloAgenticAI is completely open source and free forever! Join
                thousands of developers and AI enthusiasts building incredible
                workflows, sharing amazing ideas, and creating the future of AI
                automation together.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="bg-success-100 dark:bg-success-900/30 p-2 rounded-lg">
                  <Icon
                    icon="lucide:check"
                    className="w-5 h-5 text-success-600 dark:text-success-400"
                  />
                </div>
                <span className="text-foreground/80">
                  Apache 2.0 Licensed - Use it anywhere, anytime
                </span>
              </motion.div>

              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Icon
                    icon="lucide:code"
                    className="w-5 h-5 text-primary-600 dark:text-primary-400"
                  />
                </div>
                <span className="text-foreground/80">
                  Well-documented and easy to contribute
                </span>
              </motion.div> */}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="bg-secondary-100 dark:bg-secondary-900/30 p-2 rounded-lg">
                  <Icon
                    icon="lucide:globe"
                    className="w-5 h-5 text-secondary-600 dark:text-secondary-400"
                  />
                </div>
                <span className="text-foreground/80">
                  Active community and regular updates
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  as="a"
                  href="https://github.com/dearzubi/floagenticai"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3 font-semibold rounded-full shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white hover:text-white border-none hover:shadow-xl  transition-all duration-300"
                  startContent={
                    <Icon icon="lucide:github" className="w-5 h-5" />
                  }
                >
                  View on GitHub
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  as="a"
                  href="https://github.com/dearzubi/floagenticai/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="bordered"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3 font-semibold rounded-full border-2"
                  startContent={
                    <Icon icon="lucide:heart-handshake" className="w-5 h-5" />
                  }
                >
                  Contribute
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl transform rotate-3" />

            <div className="relative z-10 grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="h-full"
                >
                  <Card className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardBody className="text-center p-6">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className={`${getColorClasses(stat.color).bg} p-3 rounded-2xl w-fit mx-auto mb-4`}
                      >
                        <Icon
                          icon={stat.icon}
                          className={`w-6 h-6 ${getColorClasses(stat.color).text}`}
                        />
                      </motion.div>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {isLoading ? (
                          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ) : isError ? (
                          "0"
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="text-sm text-foreground/60 font-medium">
                        {stat.label}
                        {isError && (
                          <span className="text-red-500 dark:text-red-400 ml-1">
                            (Error)
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-3 rounded-full shadow-lg"
            >
              <Icon icon="lucide:github" className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Join our growing community
          </h3>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Get support, share your workflows, and collaborate with other
            developers building the future of AI automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              as="a"
              href="https://discord.gg/floagenticai"
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              color="secondary"
              startContent={
                <Icon icon="lucide:message-circle" className="w-4 h-4" />
              }
            >
              Discord
            </Button>
            <Button
              as="a"
              href="https://twitter.com/floagenticai"
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              color="primary"
              startContent={<Icon icon="lucide:twitter" className="w-4 h-4" />}
            >
              Twitter
            </Button>
            <Button
              as="a"
              href="https://github.com/dearzubi/floagenticai/discussions"
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              color="default"
              startContent={<Icon icon="lucide:users" className="w-4 h-4" />}
            >
              Discussions
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OpenSourceSection;
