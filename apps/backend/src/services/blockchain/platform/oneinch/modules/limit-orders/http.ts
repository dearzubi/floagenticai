import { logger } from "../../../../../../utils/logger/index.js";

export type Headers = Record<string, string>;

export interface HttpProviderConnector {
  get<T>(url: string, headers: Headers): Promise<T>;

  post<T>(url: string, data: unknown, headers: Headers): Promise<T>;
}

export class AuthError extends Error {
  constructor() {
    super("Auth error, please use token from https://portal.1inch.dev/");
  }
}

export class FetchProviderConnector implements HttpProviderConnector {
  async get<T>(url: string, headers: Headers): Promise<T> {
    const res = await fetch(url, { headers, method: "GET" });

    if (res.status === 401) {
      throw new AuthError();
    }

    if (res.ok) {
      return res.json() as Promise<T>;
    }

    throw new Error(
      `Request failed with status ${res.status}: ${await res.text()}`,
    );
  }

  async post<T>(url: string, data: unknown, headers: Headers): Promise<T> {
    const res = await fetch(url, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      throw new AuthError();
    }
    const response = (await res.json()) as Promise<T>;

    if (res.ok) {
      return response;
    }

    logger.error("Err", { response });

    throw new Error(`Request failed with status ${res.status}}`);
  }
}
