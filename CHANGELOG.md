# Changelog

## 0.1.0 (2025-08-29)

### Features

* add anthropic models ([5c46e84](https://github.com/dearzubi/floagenticai/commit/5c46e84c382bc7533e81a0eb4d830753a083714d))
* add AsyncCredentialHandler component and integrate async credential loading in properties ([6a34321](https://github.com/dearzubi/floagenticai/commit/6a343218a5df0a7c604973fdf84f1a6dff6212f0))
* add getUserMCPInstallations method to agent node load methods and integrate with async multi options property ([2ced650](https://github.com/dearzubi/floagenticai/commit/2ced65004db537f273c1e47b2773f9936eb485a3))
* add support for deepseek model provider ([8d1b74e](https://github.com/dearzubi/floagenticai/commit/8d1b74e254563f265ba9796600a9387cc1c3a240))
* add support for gpt-5 models ([42f52c8](https://github.com/dearzubi/floagenticai/commit/42f52c800ec9ba0786290d9cff3fadc34c654b4b))
* add support for openrouter model provider ([eba6a56](https://github.com/dearzubi/floagenticai/commit/eba6a563a743fde3f7b576d06c80b7c67af7728e))
* enhance async property handling with dependency tracking and background loading to eliminate unnecessary rerenders ([20b5925](https://github.com/dearzubi/floagenticai/commit/20b5925d63308dda08c0a32fdbdd6028466b75cd))
* implement and integrate Brave Search mcp server ([22f8575](https://github.com/dearzubi/floagenticai/commit/22f857542efc0a09894571b93a78aa6b57a593d1))
* implement and integrate EverArt AI mcp server ([5b4e941](https://github.com/dearzubi/floagenticai/commit/5b4e94106d7c778aa4f559aecec4d7b53de97d61))
* implement and integrate Google Maps mcp server ([6de3133](https://github.com/dearzubi/floagenticai/commit/6de3133a5b806c449a56bb757a0db26d7de81bf5))
* implement and integrate Perplexity AI mcp server ([5389200](https://github.com/dearzubi/floagenticai/commit/53892005fa28786c68a82cb0d8837e28a27adb89))
* implement GridInput component and support for grid properties in node configuration modal ([6812db5](https://github.com/dearzubi/floagenticai/commit/6812db57300235db9f46066d9b125955fb51b682))
* implement LinkUp and Time MCP servers and integrate with agents ([02419b4](https://github.com/dearzubi/floagenticai/commit/02419b4cf14a540e0cc55e6953549bff4165aa91))
* implement MCP server management features including listing, installation, configuration, and removal ([8e1cc29](https://github.com/dearzubi/floagenticai/commit/8e1cc2911e484176d808b44f475f4f8a39f7c285))
* implement node load method calls for async properties ([a15ab14](https://github.com/dearzubi/floagenticai/commit/a15ab14409a753c7ffb19f4809194a2c7e696330))
* init repo ([ae0c6d5](https://github.com/dearzubi/floagenticai/commit/ae0c6d568feab467ccff517c193c8b21758e82d6))
* set up deployment environment with Docker and GitHub Actions ([0fd21b3](https://github.com/dearzubi/floagenticai/commit/0fd21b3a73cddfc94c0e7d8e152f45eae1bd8f02))

### Bug Fixes

* fix anthropic models not working in 1inch agent ([60892b5](https://github.com/dearzubi/floagenticai/commit/60892b5ff8f9ffae150d9425c741f270b36e41ad))
* fix open ai model not working if history has providerData object ([9328dc5](https://github.com/dearzubi/floagenticai/commit/9328dc5c3b2b4d85fb85336f11b1bf3745e108b1))
* fix unnecessary rerenders caused by router agent's connectors ([b158e70](https://github.com/dearzubi/floagenticai/commit/b158e70514dd66995cf0904ac7bb3d0a80cfcc17))
* **router-agent:** resolve connector connection issue requiring component rerender ([a535735](https://github.com/dearzubi/floagenticai/commit/a535735d016e2a1eefcee6e43ad33e1acb62cc28))
* **ui:** ensure updating condition reflects immediate changes to router agent handles ([9a570d1](https://github.com/dearzubi/floagenticai/commit/9a570d1ee95308e811c1732593a289f22fd34134))
