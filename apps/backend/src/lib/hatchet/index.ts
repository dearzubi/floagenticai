import { Hatchet } from "@hatchet-dev/typescript-sdk";
import { logger } from "../../utils/logger/index.js";

let hatchet: Hatchet;

export const initHatchetClient = (): void => {
  hatchet = Hatchet.init();
  logger.info("Hatchet client is initialised");
};

export const getHatchetClient = (): Hatchet => {
  if (!hatchet) {
    initHatchetClient();
  }
  return hatchet;
};
