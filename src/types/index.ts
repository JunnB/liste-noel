/**
 * Types centralisés pour l'application
 */

import { List, Item, Contribution, User, Event, EventParticipant } from "@prisma/client";

// Types de base exportés depuis Prisma
export type { List, Item, Contribution, User, Event, EventParticipant };

// Types avec relations pour Event
export type EventWithCreator = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
};

export type EventWithParticipants = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: (EventParticipant & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
};

export type EventWithLists = Event & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: (EventParticipant & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
  lists: (List & {
    user: {
      id: string;
      name: string;
      email: string;
    };
    items: (Item & {
      contributions: (Contribution & {
        user: {
          id: string;
          name: string;
          email: string;
        };
      })[];
    })[];
  })[];
};

// Types avec relations pour List
export type ListWithItems = List & {
  items: Item[];
};

export type ListWithUser = List & {
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: (Item & {
    contributions: Contribution[];
  })[];
};

export type ListWithEvent = List & {
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: (Item & {
    contributions: (Contribution & {
      user: {
        id: string;
        name: string;
        email: string;
      };
    })[];
  })[];
};

export type ItemWithContributions = Item & {
  contributions: (Contribution & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
};

export type ContributionWithUser = Contribution & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

// Type pour les résultats d'actions
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Type pour les dettes
export type Debt = {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
};

export type DebtsResult = {
  debts: Debt[];
  contributorCount: number;
};


