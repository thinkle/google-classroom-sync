<script lang="ts">
  import Test from "./Test.svelte";

  import AspenCourse from "./AspenCourse.svelte";
  import AspenGradingPeriodSelector from "./AspenGradingPeriodSelector.svelte";

  import { onMount } from "svelte";
  import { GoogleAppsScript } from "./gasApi";
  import AspenClassList from "./AspenClassList.svelte";
  import type { User, Course, LineItem } from "../gas/types";

  let email: string;
  let teacher: User | undefined;
  let courses: Course[] = [];

  let loading = false;
  onMount(async () => {
    loading = true;
    console.log("Main app mounting");
    console.log('Logging in to Google...');
    await getGoogleEmail();
    console.log('Fetching Aspen teacher...');
    await getAspenTeacher();
    console.log('Fetching Aspen courses...');
    await getAspenCourses();        
    loading = false;
  });
  async function getGoogleEmail() {
    email = await GoogleAppsScript.getActiveUserEmail();
    getAspenTeacher();
  }
  async function getAspenTeacher() {
    teacher = await GoogleAppsScript.fetchAspenTeacher();
  }
  let loadingCourses = false;
  async function getAspenCourses() {
    loadingCourses = true;
    if (teacher) {
      courses = await GoogleAppsScript.fetchAspenCourses(teacher);
    }
    loadingCourses = false;
  }
  
  function reset() {
    teacher = undefined;
    email = undefined;
    courses = [];
  }

  let theCourse;
  const selectCourse = async (event) => {
    theCourse = event.detail.selectedClass;
  };
</script>

<div class="page">
  <header>
    <div class="left"></div>
    <div class="center">
      <h1>Google Classroom Sync Tool!</h1>
      {#if theCourse}
        <h2>{theCourse.title} <button on:click={() => (theCourse = null)}>&times;</button></h2>
      {/if}
      
    </div>
    <div class="right">
      {#if email}<div class="google-info"
          >Google account: {email}
          (<button on:click={() => reset}>Log out</button>)
        </div>{/if}
      <div class="aspen-info">
        Aspen Login: {teacher
          ? `${teacher.givenName} ${teacher.familyName}`
          : "loading..."}
      </div>
    </div>
  </header>

  <main>
    {#if loading}
      <p>Checking your Credentials with Google & Aspen
        and trying to grab your classes...</p>
    {:else}
      {#if !email}
        <button on:click={getGoogleEmail}>Log In to Google</button>
      {/if}
      {#if !teacher}
        <button on:click={getAspenTeacher}>Get Aspen Teacher</button>
      {:else if courses.length == 0}
        <button on:click={getAspenCourses}>Get Aspen Courses</button>
        <AspenGradingPeriodSelector></AspenGradingPeriodSelector>
      {/if}
    {/if}
    
    {#if courses.length > 0 && !theCourse}
      <!-- <Test course={courses[0]}/> -->
      <h2>
        Aspen Courses for
        {teacher.givenName}
        {teacher.familyName}
        <button on:click={getAspenCourses}>reload</button>    
      </h2>
      <p>Select a course to connect with google:</p>
      <AspenClassList {courses} on:select={selectCourse} />
    {:else if !courses.length && loadingCourses}
      <p>Loading courses...</p>
    {:else}
      <button on:click={getAspenCourses}>reload</button>
    {/if}
    {#if theCourse}
      {#key theCourse.sourcedId}
        <AspenCourse course={theCourse}></AspenCourse>
      {/key}
    {/if}
  </main>
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    padding: 16px;
    position: sticky;
    top: 0;
    background-color: var(--primary-bg, white);
    z-index: 1000;
  }
  main {
    font-family: Arial, sans-serif;
    padding: 16px;
  }
</style>
