<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Course } from "../gas/types";

  export let courses: Course[];
  const dispatch = createEventDispatcher();

  function selectClass(selectedClass: Course) {
    dispatch("select", { selectedClass });
  }
</script>

<ul>
  {#each courses as course}
    <li on:click={() => selectClass(course)}>
      {course.title} -
      {#if course.subjects}
        {course.subjects.join(", ")}{/if}
    </li>
  {/each}
</ul>

<style>
  li {
    cursor: pointer;
    padding: 8px;
    border-bottom: 1px solid #ccc;
  }
  li:hover {
    background-color: #f0f0f0;
  }
</style>
