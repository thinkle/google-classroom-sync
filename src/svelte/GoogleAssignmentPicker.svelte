<script lang="ts">
  import { MenuList, Button, Checkbox } from "contain-css-svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap } from "./store";

  export let assignments = [];
  export let onSelect = (assignment) => {
    console.log("You should provide an onSelect callback");
    console.log("Selected:", assignment);
  };

  let selectedGoogleAssignment = null;
  $:console.log('assignment map:',$assignmentMap);
  const filters = [
    {
      title: 'Already linked',
      active: false,
      filter : (assignment) => {
        return assignment.id in $assignmentMap;
      }
    },
    {
      title: 'Not linked',
      active: false,
      filter : (assignment) => {
        return !(assignment.id in $assignmentMap);
      }
    },
    {
      title: 'Only Graded',
      active: true,
      filter : (assignment) => {
        return assignment.maxPoints;
      }
    }    
  ];

  function getEffectiveDate (assignment) {
    if (assignment.dueDate) {
      return new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day,
        assignment.dueTime?.hour || 12,
        assignment.dueTime?.minute || 0
      );
    } else {
      return new Date(assignment.creationTime);
    }
  }

  $: displayAssignments = assignments.filter(assignment => {
    return filters.every(filter => {
      return !filter.active || filter.filter(assignment);
    });
  }).sort(
    // newest first
    (a,b)=>{
      let date1 = getEffectiveDate(a);
      let date2 = getEffectiveDate(b);
      if(date1 && date2){
        return date2-date1;
      } else if(date1){
        return 1;
      } else if(date2){
        return -1;
      } else {
        return 0;
      }
    }
  );
  $: console.log('Sorted and filtered',displayAssignments);
  

</script>

<h3 class="google text-w-icon"><div class="google-icon"></div> Assignments</h3>
{#if !selectedGoogleAssignment}
  <p>Select a Google Classroom Assignment</p>
{/if}
{#each filters as filter}
  <Checkbox
    bind:checked={filter.active}    
  >
    {filter.title}
  </Checkbox>
{/each}
<MenuList>
  {#each displayAssignments as assignment}
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