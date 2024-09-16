<script lang="ts">
	import { courseMap } from './store.ts';
  import type { Course } from "../gas/types";
  export let course : Course;
  
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

  async function testCreateLineItem () {
    console.log('Creating test assignment...');
    await GoogleAppsScript.createLineItem(
      'new-test-hellow-world',
      {
        title : 'brand new test: hello world',
        dueDate : new Date().toISOString(),
        assignDate : new Date(new Date() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        description : 'this is a new test; ignore',
        resultValueMax : 4,
        resultValueMin : 0,
        class : {
          sourcedId : course.sourcedId,
          href : course.href
        },
        category : {
          sourcedId : categories[1].sourcedId,
          href : categories[1].href
        }
      }
    );
  }

</script>

<div class="bar">
  <h2>{course.title}</h2>
</div>

<button on:click={testCreateLineItem}>
  Create Test Assignment!
</button>

{#if course.sourcedId && $courseMap[course.sourcedId]}
  {@const googleId = $courseMap[course.sourcedId]}
  <button on:click={()=>courseMap.setKey(course.sourcedId, null)}>
    Unlink Class
  </button>
  {#if categories.length}
  <GoogleAssignmentMapper 
    googleCourseId={googleId} 
    aspenCourse={course}
    {categories}
  />
  {/if}
{:else}
  <GoogleCourseLinker 
    aspenCourse={course}
    />
{/if}



