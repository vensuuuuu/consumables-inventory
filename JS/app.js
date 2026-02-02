import { initInventory } from "./inventory.js";
import { initIncoming } from "./incoming.js";
import { initOutgoing } from "./outgoing.js";
import "./tabs.js"; // if you have tabs logic here

document.addEventListener("DOMContentLoaded", () => {
  initInventory();
  initIncoming();
  initOutgoing();
});
