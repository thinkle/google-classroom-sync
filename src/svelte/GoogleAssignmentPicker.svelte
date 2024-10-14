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

<h3 class="google text-w-icon"><div class="google-icon"></div> Assignments</h3>
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
        
        <span class="max-points">{assignment.maxPoints||'Ungraded'}</span>
        {#if assignment.dueDate}
          <span class="due">
            {#if assignment.dueDate}                          
              {assignment.dueDate.month}/{assignment.dueDate.day}
            {:else}
              No due date
            {/if}
          </span>
        {/if}
        {#if linked}
          <div class="text-w-icon linked"
            >(Linked to
            <span>
              <div class="aspen-icon"></div>
              {#if $aspenAssignments[linked]}            
                {$aspenAssignments[linked].title}
              {/if}
            </span>
            )
          </div>
        {/if}
      </Button>
    </li>
  {/each}
</MenuList>
<style>
  .linked {
    font-size: small;
  }
  .title {
    font-weight: bold;
  }
  li {
    border-left: var(--primary-bg);
  }
  .max-points::after {
    content: " pts";
  }
  .max-points {
    font-size: small;
  }
</style>