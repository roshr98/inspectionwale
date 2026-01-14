import { registerServiceWorker } from './sw-register.mjs';

// Register SW early so app shell is cached before going offline.
registerServiceWorker();
