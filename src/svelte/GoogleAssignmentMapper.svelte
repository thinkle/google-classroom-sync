<script lang="ts">
	import AspenCategorySelector from './AspenCategorySelector.svelte';
  import AspenLineItemList from "./AspenLineItemList.svelte";
import { GoogleAppsScript } from "./gasApi";

  export let googleCourseId;
  export let aspenCourse;
  export let categories;
  let googleCourse;
  $: if (googleCourseId && !googleCourse ) {
    fetchCourse();
  }

  let assignments = [];  

  async function fetchCourse() {
    let courses = await GoogleAppsScript.fetchGoogleCourses()    
    googleCourse = courses.find(course => course.id == googleCourseId);        
  }

  async function fetchAssignments () {
    assignments = await GoogleAppsScript.fetchGoogleAssessments(googleCourse.id);
  }

  let selectedGoogleAssignment = null;
  let selectedAspenAssignment = null;
  let mode : 'LINK' | 'CREATE' = 'CREATE';
  let newAspenLineItem = {};
  let existingAspenLineItem = null;

  $: if (selectedGoogleAssignment && mode == 'CREATE') {
    populateLineItem();
  }

  function formatDate (dueDate) {
    if (!dueDate) {
      return new Date().toISOString().split('T')[0];
    } else {
      let date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
      return date.toISOString().split('T')[0];
    }
  }

  function populateLineItem () {
   newAspenLineItem = {
    dueDate :  formatDate(selectedGoogleAssignment.dueDate),
    assignDate : selectedGoogleAssignment.creationTime.split('T')[0],
    title : selectedGoogleAssignment.title,
    description : `${selectedGoogleAssignment.description}\n${selectedGoogleAssignment.alternateLink}\n`,
    resultValueMax : selectedGoogleAssignment.maxPoints || 4,
    resultValueMin : 0,    
    class : {
      sourcedId : aspenCourse.sourcedId,
      href : aspenCourse.course.href
    }
   }  
   
  }

  function getLineItemId () {
    return googleCourse.id + '-' + selectedGoogleAssignment.id;
  }

  async function createLineItem () {
    let id = getLineItemId();
    console.log('Creating item with id: ', id);
    console.log('Item is: ', newAspenLineItem);
    let result = await GoogleAppsScript.createLineItem(
      id,
      newAspenLineItem
    );
    console.log('Created item!',result);
  }
  
  function updateCategory (theCategory) {
    if (theCategory) {
      newAspenLineItem.category = {
        sourcedId : theCategory.sourcedId,
        href : theCategory.href
      }
    } else {
      newAspenLineItem.category = null;
    }
  }  

</script>
<h2>Assignments for {aspenCourse.title}</h2>
<h3>With {categories.length} categories</h3>
<div class="side-by-side">
  <div class="column google-assignments">    
    <h3>Google Classroom Assignments</h3>
    {#if googleCourse}
      <button on:click={fetchAssignments}>Fetch Assignments</button>
      {#each assignments as assignment}
        <div on:click={()=>{selectedGoogleAssignment=assignment}}
          class:selected={selectedGoogleAssignment == assignment}
          >
          <span class="title">{assignment.title}</span>
          <span class="max-points">{assignment.maxPoints}</span>
          {#if assignment.dueDate}
            <span class="due">{assignment.dueDate.month}/{assignment.dueDate.day}</span>
          {/if}          
        </div>
      {/each}
    {/if}
  </div>
  <div class="column aspen-assignments">
    {#if selectedGoogleAssignment}
    <h3>Aspen Assignments</h3>
      {#if mode == 'LINK'}
        {#if selectedAspenAssignment}
          <p>Linking {selectedGoogleAssignment.title} to {selectedAspenAssignment.title}</p>
          <button on:click={() => selectedAspenAssignment = null}>Link a different assignment</button>
          <button on:click={() => mode = 'CREATE'}>Create a new Aspen Assignment instead</button>
          <button on:click={makeLink}>Link</button>
        {:else}
          <p>Select an Aspen Assignment to link to {selectedGoogleAssignment.title}</p>
          <AspenLineItemList course={aspenCourse} {categories}></AspenLineItemList>
        {/if}
        <h4>Existing Aspen Assignments</h4>
        <p>Choose an existing assignment to connect to:</p>
        <AspenLineItemList course={aspenCourse} {categories}></AspenLineItemList>
      {/if}
      {#if mode == 'CREATE'}
        <label>
          Title: <input type="text" bind:value={newAspenLineItem.title}>
        </label>
        <label>
          Description: <textarea bind:value={newAspenLineItem.description}></textarea>
        </label>
        <label>
          Assigned Date: <input type="date" bind:value={newAspenLineItem.assignDate}>
        </label>
        <label>
          Due Date: <input type="date" bind:value={newAspenLineItem.dueDate}>          
        </label>
        <label>
          Max Score: <input type="number" bind:value={newAspenLineItem.resultValueMax}>
        </label>
        <label>
          {#if categories.length}
          Category
          <AspenCategorySelector {categories}
            selected = {categories.find((cat) => cat.sourcedId == newAspenLineItem.category?.sourcedId)}
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
</style>