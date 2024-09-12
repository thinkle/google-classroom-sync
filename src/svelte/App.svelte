<script lang="ts">
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
  }
  async function getAspenTeacher () {
    teacher = await GoogleAppsScript.fetchTeacherByEmail(email);
  }
  async function getAspenCourses () {
    if (teacher) {
      courses = await GoogleAppsScript.fetchAspenCourses(teacher);
    }
  }
  
  let theCourse;
  const selectCourse = async (event) => {
    theCourse = event.detail.selectedClass;        
  };
  let showCats = false;
</script>

<main>
  <h1>Google Classroom Sync Tool!</h1>
  <p>Google account: {email}</p>
  <button on:click={getGoogleEmail}>Get Google Email</button>
  <button on:click={getAspenTeacher}>Get Aspen Teacher</button>
  <button on:click={getAspenCourses}>Get Aspen Courses</button>
  <AspenGradingPeriodSelector></AspenGradingPeriodSelector>
  <button on:click={() => showCats = !showCats}>Show Categories</button>
  
  
  <p>
    Logged in as: {teacher
      ? `${teacher.givenName} ${teacher.familyName}`
      : "loading..."}
  </p>
  {#if courses.length > 0}
    <h2>Aspen Courses for {teacher.givenName} {teacher.familyName}</h2>
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
