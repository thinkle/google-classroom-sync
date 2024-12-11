<script lang="ts">
  import AspenErrorSummarizer from './AspenErrorSummarizer.svelte';

  import GradePoster from "./GradePoster.svelte";

  import { googleAssignments } from "./store";
  import AspenCategorySelector from "./AspenCategorySelector.svelte";
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap } from "./store";
  import { onMount } from "svelte";
  import { Button, Dialog, FormItem, TabBar, TabItem } from "contain-css-svelte";

  export let aspenCourse;
  export let googleAssignment;
  export let googleCourse;
  export let categories = [];
  let error = null;

  export let onSelect = (aspenAssignment) => {
    console.log("You should provide an onSelect callback");
    console.log("Selected:", aspenAssignment);
  };

  let selectedAspenAssignment = null;
  let mode: "LINK" | "CREATE" = "CREATE";
  let newAspenLineItem = {};
  let existingAspenLineItem = null;

  $: if (googleAssignment && mode == "CREATE") {
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
    try {
      console.log('Creating line item from',googleAssignment);
      newAspenLineItem = {
        dueDate: formatDate(googleAssignment.dueDate),
        assignDate: googleAssignment.creationTime.split("T")[0],
        title: googleAssignment.title,
        description: `${googleAssignment.description||''}\n${googleAssignment.alternateLink||''}\n`,
        resultValueMax: googleAssignment.maxPoints || 4,
        resultValueMin: 0,
        class: {
          sourcedId: aspenCourse.sourcedId,
          href: aspenCourse.course.href,
        },
      };
      console.log("Populated line item", newAspenLineItem);
    } catch (e) {
      console.error("Error populating line item", e);
      console.log("We were using assignment: ", googleAssignment);
    }
  }

  function getLineItemId() {
    return googleCourse.id + "-" + googleAssignment.id;
  }

  async function createLineItem() {
    let id = getLineItemId();
    console.log("Creating item with id: ", id);
    console.log("Item is: ", newAspenLineItem);
    try {
      var result = await GoogleAppsScript.createLineItem(id, newAspenLineItem);
    } catch (e) {
      console.error("Error creating item", e);
      error = e.message || e;
      return;
    }
    console.log("Created item!", result);
    await refreshLineItems();
    console.log("Help me I have to find my line item!");
    console.log("I got a result:", result);
    console.log("And I have the items", $aspenAssignments);
    let item = $aspenAssignments[result.sourcedId];
    if (item) {
      onSelect($aspenAssignments[result.sourcedId]);
    } else {
      console.error(
        "Could not find item in list of assignments",
        id,
        result.sourcedId,
        $aspenAssignments
      );
    }
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

  async function refreshLineItems() {
    let lineItems = await GoogleAppsScript.fetchLineItems(aspenCourse);
    for (let li of lineItems) {
      $aspenAssignments[li.sourcedId] = li;
    }
    if ($assignmentMap[googleAssignment.id]) {
      let selectedAspenAssignmentId = $assignmentMap[googleAssignment.id];
      selectedAspenAssignment = $aspenAssignments[selectedAspenAssignmentId];
      if (selectedAspenAssignment) {
        onSelect(selectedAspenAssignment);
      }
    }
  }

  

  function makeLink() {
    onSelect(selectedAspenAssignment);
  }
</script>

<h2 class="text-w-icon">Select <span><div class="aspen-icon"></div>Aspen Assignment</span> for 
  <span><div class="google-icon"></div> {googleAssignment.title}</span></h2>

<TabBar>
  <TabItem active={mode == "LINK"} on:click={() => (mode = "LINK")}
    >Link an existing assignment
  </TabItem>
  <TabItem active={mode == "CREATE"} on:click={() => (mode = "CREATE")}
    >Create a new assignment</TabItem
  >
</TabBar>

{#if mode == "LINK"}
  <p>
    Select an Aspen Assignment to link to
    {#if googleAssignment}
      {googleAssignment.title}
    {/if}
  </p>
  <AspenLineItemList course={aspenCourse} {categories} onSelected={onSelect}
  ></AspenLineItemList>
{/if}
{#if mode == "CREATE"}
  <div class="assignment-creator">
    <FormItem globalInputStyles>
      <span slot="label"> Title:</span>
      <input type="text" bind:value={newAspenLineItem.title} />
    </FormItem>

    <FormItem globalInputStyles>
      <span slot="label"> Description:</span>
      <textarea bind:value={newAspenLineItem.description}></textarea>
    </FormItem>

    <FormItem globalInputStyles>
      <span slot="label"> Assigned Date:</span>
      <input type="date" bind:value={newAspenLineItem.assignDate} />
    </FormItem>
    <FormItem globalInputStyles>
      <span slot="label"> Due Date:</span>
      <input type="date" bind:value={newAspenLineItem.dueDate} />
    </FormItem>
    <FormItem globalInputStyles>
      <span slot="label"> Max Score:</span>
      <input type="number" bind:value={newAspenLineItem.resultValueMax} />
    </FormItem>
    <FormItem globalInputStyles>
      <span slot="label"> Category:</span>
      <AspenCategorySelector
        {categories}
        selected={categories.find(
          (cat) => cat.sourcedId == newAspenLineItem.category?.sourcedId
        )}
        onCategorySelected={updateCategory}
      ></AspenCategorySelector>
    </FormItem>
    <FormItem>
      <Button on:click={createLineItem} primary>Create Assignment</Button>
    </FormItem>
  </div>
{/if}
<Dialog
  modal={true}
  onClose={() => (error = null)}
  open={error}
  >    
  <AspenErrorSummarizer {error}></AspenErrorSummarizer>    
  <Button on:click={() => (error = null)} primary>OK</Button>
</Dialog>
<style>
</style>
