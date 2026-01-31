// Test setup for Bun with happy-dom
import { Window } from "happy-dom";

const window = new Window();

// @ts-expect-error - Setting global window
globalThis.window = window;
// @ts-expect-error - Setting global document
globalThis.document = window.document;
