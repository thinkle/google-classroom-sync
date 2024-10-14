<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Course } from "../gas/types";
  import { MenuList,Button } from "contain-css-svelte";

  export let courses: Course[];
  const dispatch = createEventDispatcher();

  function selectClass(selectedClass: Course) {
    dispatch("select", { selectedClass });
  }
</script>
<MenuList>
  {#each courses as course}
    <li>
      <button on:click={() => selectClass(course)}>      
      {course.title} -
      {#if course.subjects}
        {course.subjects.join(", ")}{/if}
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
</style>
