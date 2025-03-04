<script lang="ts">
  import AspenErrorSummarizer from "./AspenErrorSummarizer.svelte";

  import GradePoster from "./GradePoster.svelte";

  import { googleAssignments } from "./store";
  import AspenCategorySelector from "./AspenCategorySelector.svelte";
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap, rubricAssignments } from "./store";
  import { onMount } from "svelte";
  import {
    Button,
    Dialog,
    FormItem,
    MiniButton,
    RadioButton,
    TabBar,
    TabItem,
  } from "contain-css-svelte";
  import type { Category, Criterion, Rubric } from "../gas/types";

  export let aspenCourse;
  export let googleAssignment;
  export let googleCourse;
  export let categories: Category[] = [];
  export let criterion: Criterion | null = null;

  let error = null;

  export let onSelect = (
    aspenAssignment,
    criterion: Criterion | undefined = undefined
  ) => {
    console.log("You should provide an onSelect callback");
    console.log("Selected:", aspenAssignment, criterion);
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

  function stringsMostlyMatch(s1, s2) {
    if (!s1 || !s2) {
      return false;
    }
    let s1l = s1.toLowerCase();
    let s2l = s2.toLowerCase();
    if (s1l == s2l) {
      return true;
    }
    if (s1l.includes(s2l) || s2l.includes(s1l)) {
      return true;
    }
    if (
      s1.replace(/\s/g, "").includes(s2.replace(/\s/g, "")) ||
      s2.replace(/\s/g, "").includes(s1.replace(/\s/g, ""))
    ) {
      return true;
    }
    return false;
  }

  function getTitle(title, suffix) {
    const LENGTH_LIMIT = 10;
    if (!suffix) {
      return title;
    }
    let combinedTitle = title + " " + suffix;
    if (combinedTitle.length < LENGTH_LIMIT) {
      return combinedTitle;
    } else {
      const shortened = title.replace(/\B[aeiou]\B/gi, "");
      const shortenedSuffix = suffix.replace(/\B[aeiou]\B/gi, "");
      if ((title + " " + shortenedSuffix).length < LENGTH_LIMIT) {
        return title + " " + shortenedSuffix;
      } else {
        return shortenedSuffix + " " + title;
      }
    }
  }

  function shortenCriterion(title) {
    const methods = [
      (t) => t.replace(/\B./g, "").replace(/\s/g, ""),
      (t) => t.replace(/\s/g, "").substring(0, 2),
      (t) => t.replace(/\s/g, "").substring(0, 3),
      (t) => t.replace(/\s/g, "").substring(0, 4),
    ];

    for (let method of methods) {
      // Shorten our criterion name...d
      let shortened = method(title);
      let count = 0;
      if (rubric && rubric.criteria) {
        // Check if we have a name collision w/ another
        // criterion for this assignment
        for (let c of rubric.criteria) {
          if (c.title == title) {
            continue; // don't count ourselves
          }
          if (method(c.title) == shortened) {
            count++;
          }
        }
        if (count <= 1) {
          return shortened;
        }
      } else {
        return shortened; // no rubric, just return the shortened name
      }
    }
    // fallback
    return title;
  }

  function populateLineItem() {
    try {
      console.log("Creating line item from", googleAssignment);
      let matchingCategory: Category | undefined;
      if (criterion && criterion.title) {
        matchingCategory = categories.find(
          (c) => c && criterion && stringsMostlyMatch(c.title, criterion.title)
        );
        console.log(
          "Category match for criterion",
          criterion,
          "is",
          matchingCategory
        );
      }

      newAspenLineItem = {
        dueDate: formatDate(googleAssignment.dueDate),
        assignDate: googleAssignment.creationTime.split("T")[0],
        title: getTitle(
          googleAssignment.title,
          criterion ? shortenCriterion(criterion.title) : ""
        ),
        description: `${googleAssignment.description || ""}\n${googleAssignment.alternateLink || ""}\n`,
        resultValueMax: googleAssignment.maxPoints || 4,
        resultValueMin: 0,
        class: {
          sourcedId: aspenCourse.sourcedId,
          href: aspenCourse.course.href,
        },
      };
      if (matchingCategory) {
        newAspenLineItem.category = matchingCategory;
      }
      console.log("Populated line item", newAspenLineItem);
    } catch (e) {
      console.error("Error populating line item", e);
      console.log("We were using assignment: ", googleAssignment);
    }
  }

  function getLineItemId() {
    if (!criterion || criterion.id == "_overall_") {
      return googleCourse.id + "-" + googleAssignment.id;
    } else {
      return googleCourse.id + "-" + googleAssignment.id + "-" + criterion.id;
    }
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
      if (!criterion || criterion.id == "_overall_") {
        onSelect($aspenAssignments[result.sourcedId]);
      } else {
        onSelect($aspenAssignments[result.sourcedId], criterion);
      }
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
        if (criterion && criterion.id != "_overall_") {
          onSelect(selectedAspenAssignment, criterion);
        } else {
          onSelect(selectedAspenAssignment);
        }
      }
    }
  }

  let rubric: Rubric;
  async function doFetchRubric() {
    rubric = await GoogleAppsScript.fetchRubric(
      googleCourse.id,
      googleAssignment.id
    );
    console.log("Fetched rubric: ", rubric);
  }

  let toSelect: {
    [criterionId: string]: { aspenAssignment: any; criterion?: Criterion };
  } = {};

  function onSubCategorySelect(aspenAssignment, criterion) {
    if (!criterion) {
      toSelect["_overall_"] = { aspenAssignment };
    } else {
      toSelect[criterion.id] = { aspenAssignment, criterion };
    }
  }

  function doMultiLink() {
    for (let [criterionId, { aspenAssignment, criterion }] of Object.entries(
      toSelect
    )) {
      onSelect(aspenAssignment, criterion);
    }
  }
</script>

<h2 class="text-w-icon">
  Select <span
    ><div class="aspen-icon"></div>
    Aspen Assignment</span
  >
  for
  <span
    ><div class="google-icon"></div>
    {googleAssignment.title}</span
  >
</h2>

{#if rubric && !criterion}
  {#if Object.keys(toSelect).length > 0}
    <Button on:click={doMultiLink} primary
      >Link {Object.keys(toSelect).length} assignments in Aspen</Button
    >
  {/if}
  {#each [...rubric.criteria, { id: "_overall_", title: "Overall", description: "Overall grade for this assignment" }] as criterion}
    <h2>{criterion.title}</h2>
    {#if toSelect[criterion.id]}
      <p>Ready...</p>
      <MiniButton on:click={() => (toSelect[criterion.id] = null)}
        >&times;</MiniButton
      >
    {:else}
      <svelte:self
        {criterion}
        {rubric}
        {googleAssignment}
        {googleCourse}
        {aspenCourse}
        {categories}
        onSelect={onSubCategorySelect}
      />
    {/if}
  {/each}
{:else}
  {#if !criterion}<Button on:click={doFetchRubric}
      >Fetch Rubric (for linking multiple Aspen grades)</Button
    >{/if}
  <TabBar>
    <TabItem active={mode == "LINK"} on:click={() => (mode = "LINK")}
      >Link an existing assignment
    </TabItem>
    <TabItem active={mode == "CREATE"} on:click={() => (mode = "CREATE")}
      >Create a new assignment</TabItem
    >
    <Button on:click={() => onSelect(null)}>Remove existing link</Button>
  </TabBar>

  {#if mode == "LINK"}
    <p>
      Select an Aspen Assignment to link to
      {#if googleAssignment}
        {googleAssignment.title}
      {/if}
    </p>
    <AspenLineItemList
      course={aspenCourse}
      {categories}
      onSelected={(assignment) => {
        if (criterion && criterion.id !== "_overall_") {
          onSelect(assignment, criterion);
        } else {
          onSelect(assignment);
        }
      }}
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
{/if}
<Dialog modal={true} onClose={() => (error = null)} open={error}>
  <AspenErrorSummarizer {error}></AspenErrorSummarizer>
  <Button on:click={() => (error = null)} primary>OK</Button>
</Dialog>

<style>
</style>
