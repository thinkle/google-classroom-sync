<script lang="ts">
  import { MenuList, Button } from "contain-css-svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap } from "./store";

  export let assignments = [];
  export let onSelect = (assignment) => {
    console.log("You should provide an onSelect callback");
    console.log("Selected:", assignment);
  };

  let selectedGoogleAssignment = null;
</script>

<h3 class="google">Google Classroom Assignments</h3>
{#if !selectedGoogleAssignment}
  <p>Select a Google Classroom Assignment</p>
{/if}

<MenuList>
  {#each assignments as assignment}
    {@const linked = $assignmentMap[assignment.id]}
    <li class="google-assignment">
      <Button
        on:click={() => {
          onSelect(assignment);
        }}
      >
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
      </Button>
    </li>
  {/each}
</MenuList>
