import { Writable, writable } from "svelte/store";

export let lineItemStore : Writable<{
  [key : string] : LineItem[];
}> = writable({});

function createPersistentStore(key, startValue) {
  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;

  const store = writable(initialValue);

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    setKey: (key, value) => {
      store.update((current) => {
        return { ...current, [key]: value };
      });
    },
  };
}

export const courseMap = createPersistentStore("courseMap", {});
export const assignmentMap = createPersistentStore("assignmentMap", {});
export const googleAssignments = createPersistentStore("googleAssignments", {});
export const aspenAssignments = createPersistentStore("aspenAssignments", {});
