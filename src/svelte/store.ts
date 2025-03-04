import { derived, Writable, writable } from "svelte/store";
import { GoogleAppsScript } from "./gasApi";
import type { Readable } from "svelte/store";

export let lineItemStore: Writable<{ [key: string]: any[] }> = writable({});

function createPersistentStoreWithHooks<T>(
  key: string,
  startValue: T
): Readable<T> & {
  setKey: (key: string, value: any) => void;
  addHook: (hook: (key: string, value: any) => void) => void;
  removeHook: (hook: (key: string, value: any) => void) => void;
} {
  const keyHooks: Array<(key: string, value: any) => void> = [];
  let store = createPersistentStore(key, startValue);
  return {
    subscribe: store.subscribe,
    setKey: (key: string, value: any) => {
      store.update((current) => {
        return { ...current, [key]: value };
      });
      keyHooks.forEach((hook) => hook(key, value));
    },
    addHook: (hook: (key: string, value: any) => void) => {
      keyHooks.push(hook);
    },
    removeHook: (hook: (key: string, value: any) => void) => {
      const index = keyHooks.indexOf(hook);
      if (index > -1) {
        keyHooks.splice(index, 1);
      }
    },
  };
}

function createPersistentStore<T>(
  key: string,
  startValue: T
): Writable<T> & {} {
  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;

  const store = writable<T>(initialValue);

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
}

type KeyMap = {
  [key: string]: string;
};

export const courseMap = createPersistentStoreWithHooks<KeyMap>(
  "courseMap",
  {}
);

export const googleAssignments = createPersistentStore<{ [key: string]: any }>(
  "googleAssignments",
  {}
);
export const aspenAssignments = createPersistentStore<{ [key: string]: any }>(
  "aspenAssignments",
  {}
);
export const studentLookup = createPersistentStore<{ [key: string]: any }>(
  "studentLookup",
  {}
);

export const assignmentMap = createPersistentStoreWithHooks<KeyMap>(
  "assignmentMap",
  {}
);
export const rubricAssignments = createPersistentStoreWithHooks<{
  [key: string]: { [key: string]: string };
}>("rubricAssignmentStore", {});

rubricAssignments.addHook((googleAssignmentKey, criterionAssignmentMap) => {
  for (let criterionKey in criterionAssignmentMap) {
    GoogleAppsScript.connectRubricAssessment(
      googleAssignmentKey,
      criterionKey,
      criterionAssignmentMap[criterionKey]
    );
  }
});

assignmentMap.addHook((key, value) => {
  console.log("assignment map update: update GAS", key, "=>", value);
  GoogleAppsScript.connectAssessments(key, value);
});
assignmentMap.subscribe((value) => {
  console.log("assignment map update", value, new Date());
});

courseMap.addHook((key, value) => {
  console.log("course map update: update GAS", key, "=>", value);
  GoogleAppsScript.connectCourses(key, value);
});
