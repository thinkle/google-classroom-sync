<script>
  import { Button, MenuList } from "contain-css-svelte";  
   import { GoogleAppsScript } from "./gasApi";
  export let aspenCourse;
  import { courseMap } from "./store";
  let courses = [];
  async function loadCourses () {
    console.log('Load courses...')
    courses = await GoogleAppsScript.fetchGoogleCourses(); 
    console.log('Got courses',courses);
  }

</script>

<Button on:click={loadCourses}>
  (Re)load courses...
</Button>
<h2>Link a Google Course to {aspenCourse.title}</h2>
<MenuList>
  {#each courses as course}
    <li>      
      <Button on:click={() => courseMap.setKey(aspenCourse.sourcedId, course.id)}>{course.name}</Button>      
    </li>
  {/each}
</MenuList>

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