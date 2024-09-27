<script lang="ts">
	
  
  import CategoryTag from './CategoryTag.svelte';
  import { GoogleAppsScript } from './gasApi';
  import { aspenAssignments, assignmentMap, googleAssignments, lineItemStore } from './store';
  export let course;    
  let lineItems : LineItem = [];
  export let categories;
  $: lineItems = $lineItemStore[course.sourcedId] || [];
  export let onSelected = (
    lineItem: LineItem
  ) => {
    console.log("Fix me! User selected:", JSON.stringify(lineItem));
  };  

  async function fetchLineItems () {
    lineItems = await GoogleAppsScript.fetchLineItems(course);
    $lineItemStore[course.sourcedId] = lineItems;
    for (let li of lineItems) {
      $aspenAssignments[li.sourcedId] = li;
    }
  }
  
  

</script>

{#if lineItems.length > 0}
  <button on:click={fetchLineItems}>(Reload)</button>
  <table>
    <thead>
      <tr>
        <th colspan="3">
          Aspen Assignments
        </th>
      </tr>
    </thead>
    <tbody>
    {#each lineItems as item}
      <tr
        on:click={() => onSelected(item)}
        style="cursor: pointer;"
      >
        <td class="title">{item.title}</td> 
        <td class="due">Due: {new Date(item.dueDate).toLocaleDateString(
          { weekday: 'short', month: 'numeric', day: 'numeric' })
          .replace(/\/\d{4}$/, '')}</td>
        <td><CategoryTag lineItem={item} {categories}></CategoryTag></td>
        <td>
          {#if item.sourcedId in $assignmentMap}
            {@const googleId = $assignmentMap[item.sourcedId]}
            {@const googleAssignment = $googleAssignments[googleId]}
            {#if googleAssignment}
              <span>Linked to {googleAssignment.title}</span>
            {:else}
              <span>Linked to google assignment {googleId}</span>
            {/if}
          {/if}
        </td>
      </tr>
    {/each}
    </tbody>
  </table>
{:else}

  <button on:click={async () => {
    lineItems = await GoogleAppsScript.fetchLineItems(course);
  }}>Fetch Aspen Assignments</button>
{/if}

<style>
  th {
    background-color: var(--secondary-bg, grey);
    color: var(--secondary-fg, white);
  }
  .title {
    font-weight: bold;
  }
  .due {
    font-weight: italic;
  }
  td {
    padding: 8px;
  }
</style>
