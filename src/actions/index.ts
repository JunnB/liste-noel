/**
 * Point d'entrée centralisé pour toutes les server actions
 */

// Actions pour les événements
export {
  createEvent,
  joinEvent,
  getMyEvents,
  getEventById,
  getEventWithLists,
  getOtherLists,
  getMyList,
  getEventParticipants,
  deleteEvent,
  updateEvent,
} from "./events";

// Actions pour les listes
export {
  createList,
  getUserLists,
  getListById,
  createListItem,
  deleteList,
  updateList,
} from "./lists";

// Actions pour les articles
export { updateItem, deleteItem, createBonusItem } from "./items";

// Actions pour les contributions
export { upsertContribution, deleteContribution, getDebts, getUserContributions } from "./contributions";

// Type commun pour les résultats d'actions
export type { ActionResult } from "./lists";


