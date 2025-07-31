import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";

const features = [
  {
    key: "feature-1",
    icon: "lucide:layout-dashboard",
    title: "Visual Builder",
    description: "Drag and drop interface to design your AI workflows",
  },
  {
    key: "feature-2",
    icon: "lucide:puzzle",
    title: "AI Integration",
    description: "Seamlessly connect with powerful AI models and tools",
  },
  {
    key: "feature-3",
    icon: "lucide:rocket",
    title: "Easy Deployment",
    description: "Deploy your workflows with just a few clicks",
  },
];

const HomePage: FC = () => {
  return (
    <div className="bg-background from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Build AI Agents</span>
            <span className="block text-primary-600 dark:text-primary-400">
              With Ease
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Create, customize, and deploy intelligent agentic workflows.
            Transform your ideas into powerful AI agents without the complexity.
          </p>

          <div className="mt-10">
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button color="primary" size="lg" className="rounded-full px-8">
                  Let's Build!
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="h-full"
            >
              <Card className="h-full border-none  text-center">
                <CardHeader className="flex flex-col items-center justify-center pt-6">
                  <div className="bg-primary-100 dark:bg-primary-500/20 p-3 rounded-full mb-3">
                    <Icon
                      icon={feature.icon}
                      className="w-6 h-6 text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardBody className="pt-0 pb-6 px-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
