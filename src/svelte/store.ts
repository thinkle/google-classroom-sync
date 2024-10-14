import { Writable, writable } from "svelte/store";
import { GoogleAppsScript } from "./gasApi";


export let lineItemStore: Writable<{ [key: string]: any[] }> = writable({});

function createPersistentStore<T>(key: string, startValue: T): Writable<T> & { setKey: (key: string, value: any) => void; addHook: (hook: (key: string, value: any) => void) => void; removeHook: (hook: (key: string, value: any) => void) => void } {
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
    }
  };
}

export const courseMap = createPersistentStore<{ [key: string]: string }>("courseMap", {});
export const assignmentMap = createPersistentStore<{ [key: string]: string }>("assignmentMap", {});
export const googleAssignments = createPersistentStore<{ [key: string]: any }>("googleAssignments", {});
export const aspenAssignments = createPersistentStore<{ [key: string]: any }>("aspenAssignments", {});
export const studentLookup = createPersistentStore<{ [key: string]: any }>("studentLookup", {});

assignmentMap.addHook((key, value) => {
  console.log("assignment map update: update GAS", key,'=>', value);
  GoogleAppsScript.connectAssessments(key, value);
});
assignmentMap.subscribe(
  (value) => {
    console.log("assignment map update", value, new Date());
  }
)

courseMap.addHook((key, value) => {
  console.log("course map update: update GAS", key,'=>', value);
  GoogleAppsScript.connectCourses(key, value);
});