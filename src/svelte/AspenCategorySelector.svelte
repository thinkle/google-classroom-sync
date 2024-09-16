<script lang="ts">
  import { onMount } from "svelte";
  import { GoogleAppsScript } from "./gasApi";
  export let categories;
  export let selected;
  
  export let onCategorySelected = (category) => {
    console.log("Fix me!", JSON.stringify(category));
  };

  let selectedCategoryIndex = categories.indexOf(selected);


  $: if (categories && categories.length > 0) {
    onCategorySelected(categories[selectedCategoryIndex]);
  }
</script>

<div>
  {#if categories}
    {#if categories.length == 0}
      <p>Loading categories...</p>
    {:else if categories?.length}
      <select bind:value={selectedCategoryIndex}>
        {#each categories as category, i}
          <option value={i}>{category.title}</option>
        {/each}
      </select>
    {/if}
  {/if}
</div>

<style>
</style>
