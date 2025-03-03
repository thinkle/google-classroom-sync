import { derived, Writable, writable } from "svelte/store";
import { GoogleAppsScript } from "./gasApi";
import type { Readable } from "svelte/store";

export let lineItemStore: Writable<{ [key: string]: any[] }> = writable({});

function createPersistentStore<T>(
  key: string,
  startValue: T
): Writable<T> & {
  setKey: (key: string, value: any) => void;
  addHook: (hook: (key: string, value: any) => void) => void;
  removeHook: (hook: (key: string, value: any) => void) => void;
} {
  const keyHooks: Array<(key: string, value: any) => void> = [];

  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;

  const store = writable<T>(initialValue);

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return {
    ...store,
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

type KeyMap = {
  [key: string]: string;
};

export const courseMap = createPersistentStore<KeyMap>("courseMap", {});
export const assignmentMap = createPersistentStore<KeyMap>("assignmentMap", {});
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

// New derived store for handling "rubric" grades, which means our assignment mapping can now
// go one-to-many

export const OVERALL_GRADE = "__OVERALL_GRADE__";

type RubricMap = {
  [key: string]: {
    [key: string]: string;
  };
};

/* assignmentMap either contains just an assignment ID *or* it
contains assignmentid-criterionid -- so the presence of a dash
tells us the difference. */
/* WARNING: because in practice we use assignmentMap in two different directions and
Aspen grades *can* contain dashes, we'll have some nonsense in here as well, BUT
the nonsense shouldn't collide in a meaningful way (fingers crossed) */
export const rubricGradeMap = derived<[Readable<KeyMap>], RubricMap>(
  [assignmentMap],
  ([$assignmentMap]) => {
    const rubricMap: RubricMap = {};
    for (let key of Object.keys($assignmentMap)) {
      if (!$assignmentMap[key]) {
        continue;
      }
      if (key.includes("-")) {
        // rubric key!
        const [assignmentId, criterionId] = key.split("-");
        if (!rubricMap[assignmentId]) {
          rubricMap[assignmentId] = {};
        }
        rubricMap[assignmentId][criterionId] = $assignmentMap[key];
      } else {
        if (!rubricMap[key]) {
          rubricMap[key] = {};
        }
        rubricMap[key][OVERALL_GRADE] = $assignmentMap[key];
      }
    }
    // do we need to "freeze" this or something so it's clear it's not writable?
    return rubricMap;
  }
);
