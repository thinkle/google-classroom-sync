<script lang="ts">
  import GradePoster from "./GradePoster.svelte";

  import { googleAssignments } from "./store";
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
    await refreshLineItems();
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

  async function refreshLineItems () {
    let lineItems = await GoogleAppsScript.fetchLineItems(aspenCourse);
    for (let li of lineItems) {
      $aspenAssignments[li.sourcedId] = li;
    }
  }

  function makeLink() {
    if (!selectedGoogleAssignment) {
      window.alert(
        "Weird we tried to make a link but there is no selected google assignment"
      );
      return;
    }
    if (!selectedAspenAssignment) {
      window.alert(
        "Weird we tried to make a link but there is no selected aspen assignment"
      );
      return;
    }
    let aspenId = selectedAspenAssignment.sourcedId;
    let googleId = selectedGoogleAssignment.id;
    $assignmentMap[aspenId] = googleId;
    $assignmentMap[googleId] = aspenId;
  }
  async function getGrades(assignment) {
    let grades = await GoogleAppsScript.fetchGoogleGrades(
      googleCourseId,
      assignment.id
    );
    console.log("Grades:", grades);
  }
</script>

<h2>Assignments for {aspenCourse.title}</h2>
<h3>With {categories.length} categories</h3>
<div class="side-by-side">
  <div class="column google-assignments">
    <h3 class="google">Google Classroom Assignments</h3>
    {#if !selectedGoogleAssignment}
      <p>First select a Google Assignment</p>
    {/if}
    {#if googleCourse}
      <button on:click={fetchAssignments}>Fetch Google Assignments</button>
      {#each assignments as assignment}
        {@const linked = $assignmentMap[assignment.id]}
        <div
          class="google-assignment"
          class:selected={selectedGoogleAssignment == assignment}
        >
          <input
            on:click={() => {
              if (selectedGoogleAssignment != assignment) {
                selectedGoogleAssignment = assignment;
              } else {
                selectedGoogleAssignment = null;
              }
            }}
            type="checkbox"
            checked={selectedGoogleAssignment == assignment}
          />
          <span class="title">{assignment.title}</span>
          <span class="max-points">{assignment.maxPoints}</span>
          {#if assignment.dueDate}
            <span class="due"
              >{assignment.dueDate.month}/{assignment.dueDate.day}</span
            >
          {/if}
          {#if linked}
            <span
              >(LINKED
              {#if $aspenAssignments[linked]}
                to {$aspenAssignments[linked].title}
              {/if}
              )
            </span>
          {/if}        
        </div>
      {/each}
    {/if}
  </div>
  <div class="column aspen-assignments">
    <h3>Aspen Assignments</h3>
    {#if selectedGoogleAssignment && $assignmentMap[selectedGoogleAssignment.id]}
      {@const linked = $assignmentMap[selectedGoogleAssignment.id]}
      {@const aspenAssignment = $aspenAssignments[linked]}
      <p>
        This Google Assignment is already linked to
        {#if aspenAssignment}
          {aspenAssignment.title}
        {:else}
          an Aspen Assignment (id: {linked})
        {/if}
        <button 
        on:click={
          ()=>{
            $assignmentMap[selectedGoogleAssignment.id] = null;
            $assignmentMap[linked] = null;
          }
        }
        >(un-link)</button>
      </p>   
        {#if aspenAssignment}          
          <div>
              <GradePoster
                {googleCourseId}
                {aspenCourse}
                aspenAssignment={aspenAssignment}
                googleAssignment={selectedGoogleAssignment}
              ></GradePoster>
          </div>      
        {:else}
        <button on:click={refreshLineItems}>
          Reload Aspen Data
        </button>
        {/if}
    {:else}
      <nav>
        <button
          class="tab"
          class:active={mode == "LINK"}
          on:click={() => (mode = "LINK")}>Link an existing assignment</button
        >
        <button
          class="tab"
          class:active={mode == "CREATE"}
          on:click={() => (mode = "CREATE")}>Create a new assignment</button
        >
      </nav>

      {#if mode == "LINK"}
        {#if selectedAspenAssignment}
          {#if selectedGoogleAssignment}
            <p>
              Linking {selectedGoogleAssignment.title} to {selectedAspenAssignment.title}
            </p>
            <button on:click={() => (selectedAspenAssignment = null)}
              >&times;</button
            >
            <button class="primary" on:click={makeLink}>Link</button>
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
          <div class="assignment-creator">
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
              Due Date: <input
                type="date"
                bind:value={newAspenLineItem.dueDate}
              />
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
          </div>
        {/if}
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
  .google-assignment {
    padding: 8px;
    border-bottom: 1px solid grey;
  }
</style>
