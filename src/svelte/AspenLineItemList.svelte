<script lang="ts">
  
  import CategoryTag from './CategoryTag.svelte';
  import { GoogleAppsScript } from './gasApi';
  export let course;    
  let lineItems : LineItem = [];
  export let categories;
  
  
</script>

{#if lineItems.length > 0}
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
      <tr>
        <td class="title">{item.title}</td> 
        <td class="due">Due: {new Date(item.dueDate).toLocaleDateString(
          { weekday: 'short', month: 'numeric', day: 'numeric' })
          .replace(/\/\d{4}$/, '')}</td>
        <td><CategoryTag lineItem={item} {categories}></CategoryTag></td>
      </tr>
    {/each}
    </tbody>
  </table>
{:else}

  <button on:click={async () => {
    lineItems = await GoogleAppsScript.fetchLineItems(course);
  }}>Fetch Line Items</button>
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
