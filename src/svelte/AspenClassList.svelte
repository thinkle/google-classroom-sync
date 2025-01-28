<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Course } from "../gas/types";
  import { MenuList, Button } from "contain-css-svelte";

  export let courses: Course[];
  const dispatch = createEventDispatcher();

  function selectClass(selectedClass: Course) {
    dispatch("select", { selectedClass });
  }
  $: console.log("Got courses:", courses);
</script>

<MenuList>
  {#each courses as course}
    <li>
      <button on:click={() => selectClass(course)}>
        {course.title} - {#if course.classCode}<span class="code"
            >({course.classCode})</span
          >{/if}
        {#if course.subjects}
          <span class="subject">{course.subjects.join(", ")}</span>
        {/if}
      </button>
    </li>
  {/each}
</MenuList>

<style>
  li {
    cursor: pointer;
    padding: 8px;
    border-bottom: 1px solid #ccc;
  }
  li:hover {
    background-color: #f0f0f0;
  }

  .code {
    font-weight: 100;
    font-size: 0.8em;
  }
  .subject {
    font-weight: 100;
    font-size: 0.6em;
    display: inline-block;
    margin-left: auto;
    padding: 0.5em;
    background: var(--secondary-bg);
    color: var(--secondary-fg);
  }
</style>
