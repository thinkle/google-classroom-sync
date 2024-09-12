<script lang="ts">
	import { courseMap } from './store.ts';
  import type { Course } from "../gas/types";
  export let course : Course;
  
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import AspenCategorySelector from "./AspenCategorySelector.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import GoogleCourseLinker from './GoogleCourseLinker.svelte';
  import GoogleAssignmentMapper from './GoogleAssignmentMapper.svelte';

  
  let categories = [];

  async function getCategories (course)  {
    console.log('Fetching categories...');
    categories = await GoogleAppsScript.fetchCategories(course);
    console.log("Categories are: ", categories);
  }

  $: getCategories(course);

</script>

<div class="bar">
  <h2>{course.title}</h2>
</div>

{#if course.sourcedId && $courseMap[course.sourcedId]}
  {@const googleId = $courseMap[course.sourcedId]}
  <button on:click={()=>courseMap.setKey(course.sourcedId, null)}>
    Unlink Class
  </button>
  <GoogleAssignmentMapper 
    googleCourseId={googleId} 
    aspenCourse={course}
    {categories}
  />
{:else}
  <GoogleCourseLinker 
    aspenCourse={course}
    />
{/if}


<details>
  <summary>Existing Aspen Assignments</summary>
  <AspenLineItemList course={course} {categories}/>
</details>

