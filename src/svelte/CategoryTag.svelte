<script lang="ts">
  import CategoryTag from './CategoryTag.svelte';
      
  export let lineItem : LineItem;
  export let categories;
  let lineItems: LineItem[] = [];

  let theCategory = null;

  $: theCategory = categories.find(category => category.sourcedId == lineItem.category.sourcedId);
</script>
{#if theCategory}
<span on:click={console.log(theCategory)} class="category-tag">{theCategory.title}</span>
{:else}
<span class="category-tag">No Category found</span>
{/if}

<style>
  
</style>
