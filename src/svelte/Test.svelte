<script lang="ts">
  import { Button } from 'contain-css-svelte';
  import GradeTest from './GradeTest.svelte';

  import { GoogleAppsScript } from "./gasApi";
  export let course;
  let roster;
  let assignments;

	async function testRoster () {   
   roster = await GoogleAppsScript.fetchAspenRoster(
    course.sourcedId
   );
  }

  async function testAssignments () {
    assignments = await GoogleAppsScript.fetchLineItems(course);
    console.log(assignments);
  }

  async function postGrade () {
    let student = roster[Math.random() * roster.length | 0];
    let assignment = assignments[Math.random() * assignments.length | 0];
    let grade = (Math.random() * 8 | 0)/2;
    result = await GoogleAppsScript.postResult(
      `test-id-${Math.random()*1000|0}`,
      {
        result : {
          //status : 'active',
          //dateLastModified : new Date(),
          lineItem : assignment,
          student: student,
          //scoreStatus: 'fully graded',
          score : grade,
          comment : 'This grade is a test; please ignore'
        }
      });
    console.log('Result:', result);
  }

</script>

<Button on:click={testRoster}>Get students</Button>
<Button on:click={testAssignments}>Get assignments</Button>
{#if roster && assignments}
  Test creating an assignment
  <GradeTest {assignments} {roster}></GradeTest>
{/if}

<hr>
<div>Roster: {JSON.stringify(roster)}</div>
<hr>
<div>Assignments: {JSON.stringify(assignments)}</div>


<style>




</style>

