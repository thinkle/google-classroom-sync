<script lang="ts">
  import Test from './Test.svelte';

	import AspenCourse from './AspenCourse.svelte';
  import AspenGradingPeriodSelector from "./AspenGradingPeriodSelector.svelte";


  import { onMount } from "svelte";
  import { GoogleAppsScript } from "./gasApi";
  import AspenClassList from "./AspenClassList.svelte";
  import type { User, Course, LineItem } from "../gas/types";

  let email: string;
  let teacher: User | undefined;
  let courses: Course[] = [];

  onMount(async () => {
    console.log('Main app mounting')
  });
  async function getGoogleEmail () {
    email = await GoogleAppsScript.getActiveUserEmail();
    getAspenTeacher();
  }
  async function getAspenTeacher () {
    teacher = await GoogleAppsScript.fetchAspenTeacher();
  }
  async function getAspenCourses () {
    if (teacher) {
      courses = await GoogleAppsScript.fetchAspenCourses(teacher);
    }
  }
  function reset () {
    teacher = undefined;
    email = undefined;
    courses = [];
  }
  
  let theCourse;
  const selectCourse = async (event) => {
    theCourse = event.detail.selectedClass;        
  };
  
</script>

<main>
  
  <h1>Google Classroom Sync Tool!</h1>
  {#if email}<p>Google account: {email}
    (<button on:click={()=>reset}>Log out</button>)    
  </p>{:else}
    <button on:click={getGoogleEmail}>Log In</button>
  {/if}
  {#if !teacher}
    <button on:click={getAspenTeacher}>Get Aspen Teacher</button>
  {:else}
    <button on:click={getAspenCourses}>Get Aspen Courses</button>
    <AspenGradingPeriodSelector></AspenGradingPeriodSelector>
  {/if}
  
  <p>
    Logged in as: {teacher
      ? `${teacher.givenName} ${teacher.familyName}`
      : "loading..."}
  </p>
  {#if courses.length > 0}
    <Test course={courses[0]}/>
    <h2>
      Aspen Courses for 
      {teacher.givenName} {teacher.familyName}
    </h2>
    <p>Select a course to connect with google:</p>
    <AspenClassList {courses} on:select={selectCourse} />        
  {:else}
    <p>Loading courses...</p>
  {/if}
  {#if theCourse}
    <AspenCourse course={theCourse}></AspenCourse>  
  {/if}
  
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
</style>
