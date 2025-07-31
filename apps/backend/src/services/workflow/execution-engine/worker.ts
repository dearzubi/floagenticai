import { getHatchetClient } from "../../../lib/hatchet/index.js";
import { Worker } from "@hatchet-dev/typescript-sdk";
import { logger } from "../../../utils/logger/index.js";
import { workflowOrchestratorTask } from "./tasks/workflow-orchestrator.task.js";
import { InternalServerError } from "../../../utils/errors/internal-server.error.js";

const hatchetWorkers: Worker[] = [];

export const startHatchetWorkers = async (): Promise<void> => {
  const hatchet = getHatchetClient();

  const numberOfWorkers = process.env.NUMBER_OF_HATCHET_WORKERS;

  for (let i = 1; i <= numberOfWorkers; i++) {
    const workerName = `fa-workflow-worker-${i}`;
    try {
      const worker = await hatchet.worker(workerName, {
        workflows: [workflowOrchestratorTask],
        slots: 100,
      });
      worker.start().catch((error) => {
        logger.error(
          new InternalServerError(
            error as Error,
            `Failed to start hatchet worker: ${workerName}`,
          ).toJSON(),
        );
      });
      hatchetWorkers.push(worker);
    } catch (error) {
      logger.error(
        new InternalServerError(
          error as Error,
          `Failed to start hatchet worker: ${workerName}`,
        ).toJSON(),
      );
    }
  }

  if (hatchetWorkers.length > 0) {
    logger.info(`Started ${hatchetWorkers.length} hatchet workers`);
  }
};

export const shutdownHatchetWorkers = async (
  timeoutMs = 4_000,
): Promise<void> => {
  if (!hatchetWorkers.length) {
    return;
  }

  await Promise.race([
    Promise.allSettled(hatchetWorkers.map((w) => w.stop())),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);

  logger.info("Shutdown all hatchet workers");
};
