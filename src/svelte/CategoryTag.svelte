<script lang="ts">
  import CategoryTag from './CategoryTag.svelte';
      
  export let lineItem : LineItem;
  export let categories;
  let lineItems: LineItem[] = [];

  let theCategory = null;

  $: theCategory = categories.find(category => category.sourcedId == lineItem.category.sourcedId);
</script>

<span on:click={console.log(theCategory)} class="category-tag">{theCategory.title}</span>

<style>
  span {
    background-color: var(--secondary-bg, blue);
    color: var(--secondary-fg, white);
    padding: 4px;
  }
</style>
