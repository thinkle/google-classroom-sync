<script lang="ts">
  import Counter from "./lib/Counter.svelte";
  import { Block, Icon } from "google-apps-script-svelte-components";
  import { parseContext } from "./lib/parseContext";
  import { GoogleAppsScript } from "./gasApi";
  import { onMount } from "svelte";
  import type { User, LineItems, Coures } from "../gas/types";

  let email;
  let contextString = `<? context ?>`;
  let context = parseContext(contextString);
  let clientId;
  let apiResult;
  let teachers: User[] = [];
  let teacher: User | null = null;
  let courses: Course[] = [];
  let lineItems: LineItems[] = [];

  onMount(async () => {
    email = await GoogleAppsScript.getActiveUserEmail();
    clientId = await GoogleAppsScript.getApiId();
    /* apiResult = await GoogleAppsScript.testApiCall();
    teachers = await GoogleAppsScript.fetchTeachers(); */
    teacher = await GoogleAppsScript.fetchTeacherByEmail(
      "thinkle@innovationcharter.org"
    );
    courses = await GoogleAppsScript.fetchCourses(teacher);
    lineItems = await GoogleAppsScript.fetchLineItems(
      courses[courses.length - 1]
    );
  });
</script>

<main>
  <h1>Google Classroom Sync Tool!</h1>
  <p>{clientId} aspen ID</p>
  <p>{email} email</p>
  <p>
    The teacher is:
    {JSON.stringify(teacher)}
  </p>
  <p>
    API call got:

    <br />
    {JSON.stringify(apiResult)}
    {#if teachers}
      {#each teachers as teacher}
        <div>Teacher: {JSON.stringify(teacher)}</div>
      {/each}
    {/if}
  </p>
  <p>
    Courses:
    {JSON.stringify(courses)}
  </p>
  <p>
    Line Items:
    {JSON.stringify(lineItems)}
  </p>

  <div>
    <span class="gray">
      Created with
      <a
        target="_blank"
        href="https://github.com/thinkle/Google-Apps-Script-Svelte-Starter"
      >
        Google Apps Script + Svelte Starter Kit
      </a>
      by
      <a target="_blank" href="https://www.tomhinkle.net"> Tom Hinkle </a>
    </span>
  </div>
</main>

<style>
</style>
