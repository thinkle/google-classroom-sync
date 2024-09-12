<script>
  import { GoogleAppsScript } from "./gasApi";
  export let aspenCourse;
  import { courseMap } from "./store";
  let courses = [];
  async function loadCourses () {
    courses = await GoogleAppsScript.fetchGoogleCourses();    
  }

</script>

<button on:click={loadCourses}>
  (Re)load courses...
</button>
<ul>
  {#each courses as course}
    <li>      
      <span>{course.name}</span>
      <button on:click={() => courseMap.setKey(aspenCourse.sourcedId, course.id)}>
        Link!</button>
    </li>
  {/each}
</ul>

<style>
li {
  display: flex;
  width: 800px;
  justify-content: space-between;
}
li span {
  width: 675px;
}
</style>