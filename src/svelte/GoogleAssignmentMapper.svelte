<script lang="ts">
  import GradePoster from './GradePoster.svelte';

	import { googleAssignments } from './store.ts';
  import AspenCategorySelector from "./AspenCategorySelector.svelte";
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap } from "./store";

  export let googleCourseId;
  export let aspenCourse;
  export let categories;
  let googleCourse;
  $: if (googleCourseId && !googleCourse) {
    fetchCourse();
  }

  let assignments = [];

  async function fetchCourse() {
    let courses = await GoogleAppsScript.fetchGoogleCourses();
    googleCourse = courses.find((course) => course.id == googleCourseId);
  }

  async function fetchAssignments() {
    assignments = await GoogleAppsScript.fetchGoogleAssessments(
      googleCourse.id
    );
    for (let a of assignments) {
      $googleAssignments[a.id] = a;
    }
  }

  let selectedGoogleAssignment = null;
  let selectedAspenAssignment = null;
  let mode: "LINK" | "CREATE" = "CREATE";
  let newAspenLineItem = {};
  let existingAspenLineItem = null;

  $: if (selectedGoogleAssignment && mode == "CREATE") {
    populateLineItem();
  }

  function formatDate(dueDate) {
    if (!dueDate) {
      return new Date().toISOString().split("T")[0];
    } else {
      let date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
      return date.toISOString().split("T")[0];
    }
  }

  function populateLineItem() {
    newAspenLineItem = {
      dueDate: formatDate(selectedGoogleAssignment.dueDate),
      assignDate: selectedGoogleAssignment.creationTime.split("T")[0],
      title: selectedGoogleAssignment.title,
      description: `${selectedGoogleAssignment.description}\n${selectedGoogleAssignment.alternateLink}\n`,
      resultValueMax: selectedGoogleAssignment.maxPoints || 4,
      resultValueMin: 0,
      class: {
        sourcedId: aspenCourse.sourcedId,
        href: aspenCourse.course.href,
      },
    };
  }

  function getLineItemId() {
    return googleCourse.id + "-" + selectedGoogleAssignment.id;
  }

  async function createLineItem() {
    let id = getLineItemId();
    console.log("Creating item with id: ", id);
    console.log("Item is: ", newAspenLineItem);
    let result = await GoogleAppsScript.createLineItem(id, newAspenLineItem);
    console.log("Created item!", result);
  }

  function updateCategory(theCategory) {
    if (theCategory) {
      newAspenLineItem.category = {
        sourcedId: theCategory.sourcedId,
        href: theCategory.href,
      };
    } else {
      newAspenLineItem.category = null;
    }
  }

  function makeLink () {
    if (!selectedGoogleAssignment) {
      window.alert('Weird we tried to make a link but there is no selected google assignment');
      return;
    }
    if (!selectedAspenAssignment) {
      window.alert('Weird we tried to make a link but there is no selected aspen assignment');
      return;
    }
    let aspenId = selectedAspenAssignment.sourcedId;
    let googleId = selectedGoogleAssignment.id;
    $assignmentMap[aspenId] = googleId;
    $assignmentMap[googleId] = aspenId;
  }
  async function getGrades (assignment) {
    let grades = await GoogleAppsScript.fetchGoogleGrades(
      googleCourseId,  
      assignment.id);
    console.log('Grades:', grades);
  }
</script>

<h2>Assignments for {aspenCourse.title}</h2>
<h3>With {categories.length} categories</h3>
<div class="side-by-side">
  <div class="column google-assignments">
    <h3>Google Classroom Assignments</h3>
    {#if googleCourse}
      <button on:click={fetchAssignments}>Fetch Google Assignments</button>
      {#each assignments as assignment}
        <div          
          class:selected={selectedGoogleAssignment == assignment}
        >
          <button on:click={
            ()=>selectedGoogleAssignment = assignment
          }>Link</button>
          <span class="title">{assignment.title}</span>
          <span class="max-points">{assignment.maxPoints}</span>
          {#if assignment.dueDate}
            <span class="due"
              >{assignment.dueDate.month}/{assignment.dueDate.day}</span
            >
          {/if}
          {#if $assignmentMap[assignment.id]}
            <span>(LINKED
              {#if $aspenAssignments[$assignmentMap[assignment.id]]}
                to {$aspenAssignments[$assignmentMap[assignment.id]].title}
              {/if}
            )
            </span>
          {/if}
          <GradePoster 
            googleCourseId={googleCourseId}
            {aspenCourse}
            aspenAssignment={$aspenAssignments[$assignmentMap[assignment.id]]}
            googleAssignment={assignment}            
          ></GradePoster>
        </div>
      {/each}
    {/if}
  </div>
  <div class="column aspen-assignments">
    <h3>Aspen Assignments</h3>
    <button class:active={mode == "LINK"} on:click={() => (mode = "LINK")}
      >Link an existing assignment</button
    >
    <button class:active={mode == "CREATE"} on:click={() => (mode = "CREATE")}
      >Create a new assignment</button
    >

    {#if mode == "LINK"}
      {#if selectedAspenAssignment}
        {#if selectedGoogleAssignment}
          <p>
            Linking {selectedGoogleAssignment.title} to {selectedAspenAssignment.title}
          </p>
          <button on:click={() => (selectedAspenAssignment = null)}
            >Link a different assignment</button
          >
          <button on:click={() => (mode = "CREATE")}
            >Create a new Aspen Assignment instead</button
          >
          <button on:click={makeLink}>Link</button>
        {:else}
          <p>
            Select a Google Assignment to link to {selectedAspenAssignment.title}
          </p>
        {/if}
      {:else}
        <p>
          Select an Aspen Assignment to link to
          {#if selectedGoogleAssignment}
            {selectedGoogleAssignment.title}
          {/if}
        </p>
        <AspenLineItemList
          course={aspenCourse}
          {categories}
          onSelected={(selected) => (selectedAspenAssignment = selected)}
        ></AspenLineItemList>
      {/if}
    {/if}
    {#if selectedGoogleAssignment}
      {#if mode == "CREATE"}
        <label>
          Title: <input type="text" bind:value={newAspenLineItem.title} />
        </label>
        <label>
          Description: <textarea bind:value={newAspenLineItem.description}
          ></textarea>
        </label>
        <label>
          Assigned Date: <input
            type="date"
            bind:value={newAspenLineItem.assignDate}
          />
        </label>
        <label>
          Due Date: <input type="date" bind:value={newAspenLineItem.dueDate} />
        </label>
        <label>
          Max Score: <input
            type="number"
            bind:value={newAspenLineItem.resultValueMax}
          />
        </label>
        <label>
          {#if categories.length}
            Category
            <AspenCategorySelector
              {categories}
              selected={categories.find(
                (cat) => cat.sourcedId == newAspenLineItem.category?.sourcedId
              )}
              onCategorySelected={updateCategory}
            ></AspenCategorySelector>
          {/if}
        </label>
        <button on:click={createLineItem}>Create Assignment</button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .side-by-side {
    display: flex;
    justify-content: space-between;
  }
  .selected {
    border: 2px solid red;
    font-weight: bold;
  }
  .active {
    border: 3px solid blue;
  }
</style>
