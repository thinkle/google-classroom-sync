<script>
  import { GoogleAppsScript } from "./gasApi";

  export let googleCourseId;
  export let aspenCourse;
  export let categories;
  let googleCourse;
  $: if (googleCourseId && !googleCourse ) {
    fetchCourse();
  }

  let assignments = [];

  async function fetchCourse() {
    let courses = await GoogleAppsScript.fetchGoogleCourses()    
    googleCourse = courses.find(course => course.id == googleCourseId);        
  }

  async function fetchAssignments () {
    assignments = await GoogleAppsScript.fetchGoogleAssessments(googleCourse.id);
  }
  
</script>
<div>
  My course is: {JSON.stringify(googleCourse)}
  {#if googleCourse}
    <button on:click={fetchAssignments}>Fetch Assignments</button>
    {#each assignments as assignment}
      <div on:click={()=>console.log(assignment)}>{assignment.title}</div>
    {/each}
  {/if}
</div>
