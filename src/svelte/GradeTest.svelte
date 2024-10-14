<script lang="ts">
  import { Button } from "contain-css-svelte";
  import { GoogleAppsScript } from "./gasApi";
  export let assignments;
  export let roster;
  let result;
  async function postGrade () {
    let student = roster[Math.random() * roster.length | 0];
    let assignment = assignments[Math.random() * assignments.length | 0];
    let grade = (4 + Math.random() * 4 | 0)/2;
    console.log('Prepare to post',grade,'for',student,'on',assignment);
    result = await GoogleAppsScript.postGrade(
      `test-id-${Math.random()*1000|0}`,
      assignment,
      student,
      grade,
      'This grade is a test; please ignore'
    );
    console.log('Result:', result);    
  }

</script>

<Button on:click={postGrade}>Post grade</Button>
{#if result}
  <div>Result: {JSON.stringify(result)}</div>
{/if}
<style>




</style>

