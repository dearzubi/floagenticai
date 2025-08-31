import { Hatchet } from "@hatchet-dev/typescript-sdk";
import { logger } from "../../utils/logger/index.js";

let hatchet: Hatchet;

export const initHatchetClient = (): void => {
  hatchet = Hatchet.init({
    host_port: process.env.HATCHET_CLIENT_HOST_PORT || "http://localhost:7077",
  });
  logger.info("Hatchet client is initialised");
};

export const getHatchetClient = (): Hatchet => {
  if (!hatchet) {
    initHatchetClient();
  }
  return hatchet;
};
