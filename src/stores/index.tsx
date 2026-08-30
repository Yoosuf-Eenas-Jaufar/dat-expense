import React from 'react';

import './_hydration';
import { ExpenseStore } from './expense-store';

class Stores {
  expense = new ExpenseStore();
}

export const stores = new Stores();

const storeContext =
  React.createContext<Stores>(stores);

export function StoresProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <storeContext.Provider value={stores}>
      {children}
    </storeContext.Provider>
  );
}

export const useStores = (): Stores =>
  React.useContext(storeContext);

export const hydrateStores =
  async (): Promise<void> => {
    await stores.expense.hydrate();
  };