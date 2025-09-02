import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";

const DemoVideoSection: FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            See FloAgenticAI in Action
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Watch how easy it is to build your AI workflows without writing any
            code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <Card className="p-0 overflow-hidden shadow-xl border-none">
            <CardBody className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 cursor-pointer"
                >
                  <div className="w-20 h-20 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
                    <Icon
                      icon="lucide:play"
                      className="w-8 h-8 text-primary-600 ml-1"
                    />
                  </div>
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute top-1/3 right-1/3 w-3 h-3 bg-green-400 rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400 rounded-full"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                  3:45
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary-500 text-white text-sm rounded-full font-medium">
                  Demo Coming Soon
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
