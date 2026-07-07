type RefreshListener = () => void | Promise<void>;

const listeners = new Set<RefreshListener>();

export function subscribeAppRefresh(listener: RefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestAppRefresh(): void {
  for (const listener of listeners) {
    void listener();
  }
}
