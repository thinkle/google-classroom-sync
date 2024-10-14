<script lang="ts">
  import { MenuList } from "contain-css-svelte";
  import { Button } from "contain-css-svelte";

  import CategoryTag from "./CategoryTag.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import {
    aspenAssignments,
    assignmentMap,
    googleAssignments,
    lineItemStore,
  } from "./store";
  export let course;
  let lineItems: LineItem = $lineItemStore[course.sourcedId] || [];
  console.log("AspenLineItem list created with course", course);
  console.log("initial items from store:", $lineItemStore[course.sourcedId]);
  export let categories;
  $: lineItems = $lineItemStore[course.sourcedId] || [];
  export let onSelected = (lineItem: LineItem) => {
    console.log("Fix me! User selected:", JSON.stringify(lineItem));
  };

  async function fetchLineItems() {
    lineItems = await GoogleAppsScript.fetchLineItems(course);
    $lineItemStore[course.sourcedId] = lineItems;
    for (let li of lineItems) {
      $aspenAssignments[li.sourcedId] = li;
    }
    console.log("Manually updated:", lineItems);
    console.log("Stores are: lineItemStore", $lineItemStore);
    console.log("And $aspenAssignments:", $aspenAssignments);
  }
</script>

{#if lineItems.length > 0}
  <Button on:click={fetchLineItems}>(Reload)</Button>
  <MenuList>
    {#each lineItems as item}
    <li>
      <button on:click={() => onSelected(item)} style="cursor: pointer;">
        <div class="two-rows">
        <div class="title">{item.title}</div>
        <div class="details">
          <span class="due"
            >Due: {new Date(item.dueDate)
              .toLocaleDateString({
                weekday: "short",
                month: "numeric",
                day: "numeric",
              })
              .replace(/\/\d{4}$/, "")}</span
          >
          <span><CategoryTag lineItem={item} {categories}></CategoryTag></span>
          <span>
            {#if item.sourcedId in $assignmentMap}
              {@const googleId = $assignmentMap[item.sourcedId]}
              {@const googleAssignment = $googleAssignments[googleId]}
              {#if googleAssignment}
                <span>Linked to {googleAssignment.title}</span>
              {:else}
                <span>Linked to google assignment {googleId}</span>
              {/if}
            {/if}
          </span>
        </div>
        </div>
      </button
      >
    </li>
    {/each}
  </MenuList>
{:else}
  <Button on:click={fetchLineItems} primary>Fetch Aspen Assignments</Button>
{/if}

<style>
  .two-rows {
    display: grid;
    grid-template-rows: 1fr 1fr;
    width: 100%;
  }
  .details {
    font-size: small;
  }
</style>
