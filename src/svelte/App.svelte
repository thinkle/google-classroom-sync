<script lang="ts">
  import GradePosterRubricMode from "./GradePosterRubricMode.svelte";

  import SyncManyAssignments from "./SyncManyAssignments.svelte";

  import GoogleAssignmentPicker from "./GoogleAssignmentPicker.svelte";
  import Test from "./Test.svelte";

  import AspenGradingPeriodSelector from "./AspenGradingPeriodSelector.svelte";

  import { onMount, tick } from "svelte";
  import { GoogleAppsScript } from "./gasApi";
  import AspenClassList from "./AspenClassList.svelte";
  import type { User, Course, LineItem } from "../gas/types";
  import "contain-css-svelte/vars/defaults.css";
  import "contain-css-svelte/themes/typography-airy.css";
  import "./contain-theme.css";
  import {
    courseMap,
    assignmentMap,
    rubricAssignments,
    googleAssignments,
    aspenAssignments,
  } from "./store";
  import {
    Page,
    Bar,
    Button,
    Sidebar,
    MiniButton,
    Select,
  } from "contain-css-svelte";
  import GoogleCourseLinker from "./GoogleCourseLinker.svelte";
  import GoogleAssignmentMapper from "./GoogleAssignmentMapper.svelte";
  import GradePoster from "./GradePoster.svelte";
  let email: string;
  let teacher: User | undefined;
  let aspenCourses: Course[] = [];
  let googleCourses: Course[] = [];
  $: console.log("$rubricAssignments =>", $rubricAssignments);

  let loading = false;
  onMount(async () => {
    loading = true;
    console.log("Main app mounting");
    console.log("Logging in to Google...");
    await getGoogleEmail();
    console.log("Fetching Aspen teacher...");
    await getAspenTeacher();
    console.log("Fetching Aspen courses...");
    await getAspenCourses();
    console.log("Fetching config data");
    await getSettings();
    loading = false;
  });

  async function getSettings() {
    let settings = await GoogleAppsScript.getSettings();
    if (!settings) {
      console.log("No settings found");
      return;
    }
    console.log("Loaded settings from config sheet", settings);
    if (settings.assessmentLinks) {
      // Let's map these things into our persistent local storage...
      for (let [key, value] of Object.entries(settings.assessmentLinks)) {
        $assignmentMap[key] = value;
      }
    }
    if (settings.courseLinks) {
      for (let [key, value] of Object.entries(settings.courseLinks)) {
        $courseMap[key] = value;
      }
    }
    // And let's check for any local items that didn't make it to persistent
    // storage for whatever reason...
    if (settings.assessmentLinks) {
      for (let [key, value] of Object.entries($assignmentMap)) {
        if (!settings.assessmentLinks[key]) {
          await GoogleAppsScript.connectAssessments(key, value as string);
        }
      }
    }
    if (settings.courseLinks) {
      for (let [key, value] of Object.entries($courseMap)) {
        if (!settings.courseLinks[key]) {
          await GoogleAppsScript.connectCourses(key, value as string);
        }
      }
    }
  }

  async function getGoogleEmail() {
    email = await GoogleAppsScript.getActiveUserEmail();
    getAspenTeacher();
  }
  async function getAspenTeacher() {
    teacher = await GoogleAppsScript.fetchAspenTeacher();
    step = CHOOSE_ASPEN_COURSE;
  }
  let loadingCourses = false;

  async function getAspenCourses() {
    loadingCourses = true;
    if (teacher) {
      aspenCourses = await GoogleAppsScript.fetchAspenCourses(teacher);
      if (!Array.isArray(aspenCourses)) {
        console.error("No courses found");
        aspenCourses = [];
      } else {
        step = CHOOSE_ASPEN_COURSE;
      }
    }
    loadingCourses = false;
  }

  async function fetchGoogleCourse() {
    if (!googleCourses?.length) {
      googleCourses = await GoogleAppsScript.fetchGoogleCourses();
      if (
        !Array.isArray(googleCourses) ||
        googleCourses.length < 1 ||
        !googleCourses[0].id
      ) {
        console.info("No courses found -- got invalid data", googleCourses);
        googleCourses = [];
        // Let's try again...
        await fetchGoogleCourse();
        return;
      }
    } else {
      theGoogleCourse = googleCourses.find(
        (course) => course.id == theGoogleCourseID
      );
      console.log("Found our match", theGoogleCourse, "among", googleCourses);
      if (theGoogleCourse) {
        await fetchAssignments();
      } else {
        console.log(
          "No course found that matches",
          theGoogleCourseID,
          "in",
          googleCourses
        );
      }
    }
  }

  function reset() {
    teacher = undefined;
    email = undefined;
    aspenCourses = [];
  }

  let theAspenCourse;
  let theGoogleCourseID;
  let theGoogleCourse;
  let theGoogleAssignments = [];
  let theAspenRubricAssignments = null;
  let theGoogleAssignment;
  let theAspenAssignment;

  let fetchingAssignments = false;

  async function fetchAssignments() {
    fetchingAssignments = true;
    try {
      theGoogleAssignments = await GoogleAppsScript.fetchGoogleAssessments(
        theGoogleCourse.id
      );
      for (let a of theGoogleAssignments) {
        $googleAssignments[a.id] = a;
      }
    } catch (err) {
      console.error(err);
      window.alert("Error fetching assignments: " + err);
    }
    fetchingAssignments = false;
  }

  const setAspenCourse = (course) => {
    fetchCategories();
    theAspenCourse = course;
    step = CHOOSE_GOOGLE_COURSE;
    theGoogleCourse = null;
    theGoogleCourseID = null;
    theGoogleAssignments = [];
    theAspenAssignment = null;
    theGoogleAssignment = null;
    theAspenRubricAssignments = null;
    if ($courseMap[course.sourcedId]) {
      theGoogleCourseID = $courseMap[course.sourcedId];
      fetchGoogleCourse();
      step = CHOOSE_GOOGLE_ASSIGNMENT;
    }
  };

  const selectAspenCourseCallback = async (event) => {
    setAspenCourse(event.detail.selectedClass);
  };

  let step = 0;
  let ready = false;
  const LOADING = 0;
  const CHOOSE_ASPEN_COURSE = 1;
  const CHOOSE_GOOGLE_COURSE = 2;
  const CHOOSE_GOOGLE_ASSIGNMENT = 3;
  const CHOOSE_ASPEN_ASSIGNMENT = 4;
  const MAP_GRADES = 5;

  let categories = [];
  let fetchingCategories = false;
  async function fetchCategories() {
    fetchingCategories = true;
    try {
      categories = await GoogleAppsScript.fetchCategories(theAspenCourse);
    } catch (err) {
      console.error("Error fetching categories");
      console.error(err);
    }
    fetchingCategories = false;
  }

  $: ready = teacher && aspenCourses.length > 0;
  $: console.log("Updated ready =>", ready);
  $: console.log("aspen courses=>", aspenCourses);
  $: if (!ready) {
    step = 0;
  }

  /* $: if (ready && !theAspenCourse) {
    step = CHOOSE_ASPEN_COURSE;
    theAspenAssignment = null;
  } */

  /*  $: if (ready && theAspenCourse && !theGoogleCourseID) {
    step = CHOOSE_GOOGLE_COURSE;
    theGoogleAssignment = null;
    theGoogleCourse = null;
  } */
  /* $: if (ready && theAspenCourse && theGoogleCourseID && !theGoogleAssignment) {
    step = CHOOSE_GOOGLE_ASSIGNMENT;
    console.log("::Courses selected, choosing google assignment");
    theAspenAssignment = null;
    fetchGoogleCourse();
  } */

  function updateMappedAssignment() {
    console.log("::Google assignment selected");
    if ($rubricAssignments[theGoogleAssignment.id]) {
      theAspenRubricAssignments = {};
      console.log(
        "Found rubric mapping ",
        $rubricAssignments[theGoogleAssignment.id]
      );
      for (let key in $rubricAssignments[theGoogleAssignment.id]) {
        let assignmentId = $rubricAssignments[theGoogleAssignment.id][key];
        theAspenRubricAssignments[key] = $aspenAssignments[assignmentId];
      }
      console.log(
        "Found rubric assignments for this google assignment",
        theAspenRubricAssignments
      );
      step = MAP_GRADES;
    } else if ($assignmentMap[theGoogleAssignment.id]) {
      console.log(
        "We already have a mapping for this assignment",
        theGoogleAssignment.id,
        $assignmentMap[theGoogleAssignment.id]
      );
      let aspenId = $assignmentMap[theGoogleAssignment.id];
      theAspenAssignment = $aspenAssignments[aspenId];
      if (!theAspenAssignment) {
        console.error("Could not find Aspen assignment with id", aspenId);
      }
      step = MAP_GRADES;
    } else {
      console.log("No mapping found for this assignment");
      theAspenAssignment = null;
      step = CHOOSE_ASPEN_ASSIGNMENT;
    }
  }

  $: if (theAspenCourse && $courseMap[theAspenCourse.sourcedId]) {
    theGoogleCourseID = $courseMap[theAspenCourse.sourcedId];
  }

  // Our default mode is the "wizard" but we'll have a separate mode...
  let tool: "wizard" | "magic-sync" = "wizard";
</script>

<Page>
  <Bar slot="header">
    <div class="left">
      <h1>Google Classroom Sync Tool!</h1>
    </div>
    <div>
      {#if tool === "wizard"}
        Step {step + 1}
        {#if step == LOADING}
          <span> (Loading...)</span>
        {:else if step == CHOOSE_ASPEN_COURSE}
          <span> (Choose Aspen Course)</span>
        {:else if step == CHOOSE_GOOGLE_COURSE}
          <span> (Choose Google Course)</span>
        {:else if step == CHOOSE_GOOGLE_ASSIGNMENT}
          <span> (Choose Google Assignment)</span>
        {:else if step == CHOOSE_ASPEN_ASSIGNMENT}
          <span> (Choose Aspen Assignment)</span>
        {:else if step == MAP_GRADES}
          <span> (Map Grades)</span>
        {/if}
      {:else if tool == "magic-sync"}
        <span>Magic Sync</span>
      {/if}
    </div>
    <div
      class="center"
      style:--button-bg="var(--container-bg)"
      style:--button-shadow-color="transparent"
    ></div>
    <div class="right">
      <Select bind:value={tool}>
        <option value="wizard">One Assignment</option>
        <option value="magic-sync">Update & Sync</option>
      </Select>
    </div>
  </Bar>
  <Sidebar slot="sidebar">
    <h2>Authenticated</h2>
    {#if email}
      <div class="google-info text-w-icon">
        <div class="google-icon"></div>
        {email}
      </div>
    {/if}
    <div class="aspen-info">
      <div class="aspen-icon"></div>
      {teacher ? `${teacher.givenName} ${teacher.familyName}` : "loading..."}
    </div>

    {#if step > CHOOSE_ASPEN_COURSE}
      <hr />
      <h2>Course</h2>
      <h3 class="text-w-icon">
        <div class="aspen-icon"></div>
        {theAspenCourse?.title}
        <MiniButton
          on:click={() => {
            console.log("::: Set aspen course to null");
            theAspenCourse = null;
            theGoogleAssignment = null;
            theAspenAssignment = null;
            theGoogleCourse = null;
            theGoogleCourseID = null;
            step = CHOOSE_ASPEN_COURSE;
          }}>&times;</MiniButton
        >
      </h3>
      {#if categories?.length}
        <p>
          Found {categories?.length} gradebook categories
        </p>
      {/if}
    {/if}
    {#if step > CHOOSE_GOOGLE_COURSE}
      <hr />
      <h3 class="text-w-icon">
        <div class="google-icon"></div>
        {#if theGoogleCourse}
          {theGoogleCourse.name}
        {:else}
          Loading connected Google Course...
        {/if}
        <MiniButton
          on:click={() => {
            console.log("::: Remove aspen->google COURSE mapping");
            courseMap.setKey(theAspenCourse.sourcedId, null);
            theGoogleCourseID = null;
            theGoogleCourse = null;
            theGoogleAssignment = null;
            theAspenAssignment = null;
            step = CHOOSE_GOOGLE_COURSE;
          }}
        >
          &times;
        </MiniButton>
      </h3>
    {/if}
    {#if step > CHOOSE_GOOGLE_ASSIGNMENT}
      <h2>Assignment</h2>
      <hr />
      <h3>
        <div class="google-icon"></div>
        {theGoogleAssignment?.title || "Google assignment without title"}
        <MiniButton
          on:click={() => {
            console.log("::: Set google assignment to null");
            theGoogleAssignment = null;
            theAspenAssignment = null;
            theAspenRubricAssignments = null;
            step = CHOOSE_GOOGLE_ASSIGNMENT;
          }}>&times;</MiniButton
        >
      </h3>
    {/if}
    {#if step > CHOOSE_ASPEN_ASSIGNMENT}
      <hr />
      <h3>
        <div class="aspen-icon"></div>
        {theAspenAssignment?.title || "Aspen assignment without title"}
        <MiniButton
          on:click={() => {
            console.log("::: remove google=> aspen assignment mapping");
            assignmentMap.setKey(theAspenCourse.sourcedId, null);
            assignmentMap.setKey(theGoogleAssignment.id, null);
            // These have to take effect?
            //tick().then(
            //  ()=>{
            console.log("Reset assignments");
            theAspenAssignment = null;
            theAspenRubricAssignments = null;
            step = CHOOSE_ASPEN_ASSIGNMENT;
            //  }
            //)
          }}>&times;</MiniButton
        >
      </h3>
    {/if}
  </Sidebar>
  <main>
    {#if tool == "magic-sync"}
      <SyncManyAssignments {aspenCourses} {googleCourses} {email} {teacher}
      ></SyncManyAssignments>
    {:else if tool == "wizard"}
      {#if theAspenCourse && !fetchingCategories && !categories.length}
        <Button on:click={fetchCategories}>Load Categories</Button>
      {:else if theAspenCourse && !fetchingCategories}
        Got {categories.length} categories
      {:else if fetchingCategories}
        <p>Loading categories...</p>
        <Button on:click={fetchCategories}>Load again?</Button>
      {:else}
        Interesting.. categires={JSON.stringify(categories)}, the course = {theAspenCourse}
      {/if}
      {#if step == LOADING}
        <p>
          Checking your Credentials with Google & Aspen and trying to grab your
          classes...
        </p>
        {#if !email}
          <Button on:click={getGoogleEmail}>Log In to Google</Button>
        {/if}
        {#if !teacher}
          <Button on:click={getAspenTeacher} left>
            <div slot="icon" class="aspen-icon"></div>
            Get Aspen Teacher</Button
          >
        {/if}
        {#if aspenCourses.length == 0}
          <Button left on:click={getAspenCourses}>
            <div slot="icon" class="aspen-icon"></div>
            Get Courses</Button
          >
          <AspenGradingPeriodSelector></AspenGradingPeriodSelector>
        {/if}
      {/if}

      {#if step == CHOOSE_ASPEN_COURSE}
        Got {aspenCourses.length} courses
        <AspenClassList
          courses={aspenCourses}
          on:select={selectAspenCourseCallback}
        />
      {/if}

      {#if step == CHOOSE_GOOGLE_COURSE}
        <GoogleCourseLinker
          aspenCourse={theAspenCourse}
          onLink={(googleCourse, aspenId) => {
            if (googleCourse) {
              console.log("Linking", googleCourse, aspenId);
              theGoogleCourseID = googleCourse.id;
              theGoogleCourse = googleCourse;
              fetchAssignments();
              fetchGoogleCourse();
              step = CHOOSE_GOOGLE_ASSIGNMENT;
            }
          }}
        />
      {/if}
      {#if step == CHOOSE_GOOGLE_ASSIGNMENT}
        {#if !theGoogleCourse}
          Loading google course...
          <Button on:click={fetchGoogleCourse}>Reload Course Data</Button>
        {:else if !theGoogleAssignments}
          Loading google assignments...
        {/if}
        {#if theGoogleCourse}
          <Button on:click={fetchAssignments}>Reload Assignments</Button>
        {/if}
        <GoogleAssignmentPicker
          assignments={theGoogleAssignments}
          onSelect={(assignment) => {
            theGoogleAssignment = assignment;
            step = CHOOSE_ASPEN_ASSIGNMENT;
            updateMappedAssignment();
          }}
        />
      {/if}
      {#if step == CHOOSE_ASPEN_ASSIGNMENT}
        <h2>Choose Aspen Assignment</h2>
        <GoogleAssignmentMapper
          aspenCourse={theAspenCourse}
          googleCourse={theGoogleCourse}
          googleAssignment={theGoogleAssignment}
          {categories}
          onSelect={(assignment, criterion) => {
            console.log("GoogleAssignmentMapper => onSelect", assignment);
            if (!criterion) {
              theAspenAssignment = assignment;
              assignmentMap.setKey(
                theGoogleAssignment.id,
                theAspenAssignment.sourcedId
              );
            } else {
              let criterionMapping =
                $rubricAssignments[theGoogleAssignment.id] || {};
              criterionMapping[criterion.id] = assignment.sourcedId;
              rubricAssignments.setKey(
                theGoogleAssignment.id,
                criterionMapping
              );
            }
            step = MAP_GRADES;
          }}
        />
      {/if}
      {#if step == MAP_GRADES}
        <h2>Post Grades for {theGoogleAssignment?.title}</h2>
        {#if theAspenRubricAssignments}
          <GradePosterRubricMode
            googleCourseId={theGoogleCourseID}
            aspenCourse={theAspenCourse}
            rubricAssignments={theAspenRubricAssignments}
            googleAssignment={theGoogleAssignment}
          />
        {:else}
          <GradePoster
            googleCourseId={theGoogleCourseID}
            aspenCourse={theAspenCourse}
            aspenAssignment={theAspenAssignment}
            googleAssignment={theGoogleAssignment}
          />
        {/if}
      {/if}
    {/if}
  </main>
</Page>

<style>
  h2 {
    font-size: 1rem;
  }
  /* Ugly fix for close buttons that go oval on me */
  .text-w-icon :global(button) {
    flex-shrink: 0;
  }
</style>
