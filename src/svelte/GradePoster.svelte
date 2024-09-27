<script lang="ts">
  import { googleAssignments, studentLookup } from "./store.ts";
  import AspenCategorySelector from "./AspenCategorySelector.svelte";
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import { GoogleAppsScript } from "./gasApi";
  import { aspenAssignments, assignmentMap } from "./store";

  export let googleCourseId;
  export let aspenCourse;
  export let aspenAssignment;
  export let googleAssignment;
  let grades = [];
  let roster = [];

  function getGrade(googleSubmission) {
    let grade = googleSubmission.assignedGrade;
    if (grade == null && useDraft) {
      grade = googleSubmission.draftGrade;
    }
    return grade;
  }

  async function getGrades() {
    grades = await GoogleAppsScript.fetchGoogleGrades(
      googleCourseId,
      googleAssignment.id
    );
    console.log("Grades:", grades);
    let haveLookedUpRoster = false;
    for (let g of grades) {
      // Map an "aspenStudent" property to each grade object
      // doing a look up if we need to...
      g.aspenStudent = $studentLookup[g.studentEmail];
      if (!g.aspenStudent && !haveLookedUpRoster) {
        await getAspenRoster();
        haveLookedUpRoster = true;
        g.aspenStudent = $studentLookup[g.studentEmail];
      }
    }
  }

  async function getAspenRoster() {
    console.log("Fetch roster for ", aspenCourse);
    roster = await GoogleAppsScript.fetchAspenRoster(aspenCourse.sourcedId);
    console.log("Roster:", roster);
    for (let r of roster) {
      $studentLookup[r.email] = r;
      $studentLookup[r.email.toLowerCase()] = r;
    }
  }

  let results = [];

  async function pushGradesToAspen() {
    console.log("Pushing grades to Aspen...");
    let gradesToPost = grades.filter(
      (g) => g.aspenStudent && getGrade(g) != null
    );
    console.log("Filtered us down to ", gradesToPost.length, "grades");
    for (let g of gradesToPost) {
      let id = googleAssignment.id + "-" + g.aspenStudent.sourcedId;
      console.log("Post", g, id);
      try {
        let result = await GoogleAppsScript.postGrade(
          id, // id,
          aspenAssignment, // lineItem,
          g.aspenStudent, // student,
          getGrade(g), // score
          "" // comment
        );
        console.log(
          "Posted",
          g,
          "=>",
          id,
          aspenAssignment,
          g.aspenStudent,
          g.assignedGrade || (useDraft && g.draftGrade),
          "=>",
          result
        );
        results = [...results, result];
      } catch (e) {
        console.error("Error posting", g, e);
        let result = { error: e, grade: g };
        results = [...results, result];
      }
    }
    console.log("Done posting grades: ", results);
  }

  function updateGradesForStudents(forceUpdate) {
    if (grades && roster) {
      for (let g of grades) {
        g.aspenStudent = $studentLookup[g.studentEmail];
      }
    }
  }

  $: updateGradesForStudents($studentLookup);

  let useDraft = false;
</script>

<button on:click={() => getGrades()}> Fetch grades </button>
<label>
  <input type="checkbox" bind:checked={useDraft} />
  Post draft grades as grades?
</label>
<button on:click={() => getAspenRoster()}> Get Aspen Roster! </button>
<button
  on:click={() =>
    console.log(
      "Roster:",
      roster,
      "lookup",
      $studentLookup,
      "grades",
      grades,
      "results",
      results
    )}
>
  Check our logs...
</button>

<span on:click={() => console.log("Roster:", roster)}
  >Got {roster && roster.length} students.</span
>
<span>
  got {grades && grades.length} grades
</span>
{#if grades}
  {@const unmappedGrades = grades.filter((g) => !g.aspenStudent)}
  {@const readyGrades = grades.filter(
    (g) =>
      g.aspenStudent &&
      getGrade(g) != null
  )}
  <div class="grades">
    <button on:click={() => pushGradesToAspen()}>
      Send {readyGrades.length}
      grades to Aspen</button
    >
    {#if unmappedGrades.length}
      <span on:click={() => console.log("Unmapped grades:", unmappedGrades)}>
        {unmappedGrades.length} students
      </span>
      not mapped to aspen :-(
    {/if}
    {#if readyGrades.length}
      <span on:click={() => console.log("Ready grades:", readyGrades)}>
        Got
        {readyGrades.length} grades
      </span>
      ready to go
    {/if}
    <div class="ready-section">
      <h4>Grades to Post</h4>
      <ul>
        {#each readyGrades as grade}
          <li>
            {grade.aspenStudent.givenName}
            {grade.aspenStudent.familyName}
            {grade.assignedGrade || (useDraft && grade.draftGrade)}
          </li>
        {/each}
      </ul>
    </div>
    <div class="unmapped-section">
      <h4>Students with no connection</h4>
      <ul>
        {#each unmappedGrades as grade}
          <li>
            {grade.studentEmail}
            {getGrade(grade)}
          </li>
        {/each}
      </ul>
    </div>
    <div class="ungraded-students">
      <h4>Students on Roster with no Grade</h4>
      <ul>
        {#each roster as student}
          {#if !grades.find((g) => g.studentEmail == student.email)}
            <li>
              {student.givenName}
              {student.familyName}
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
{/if}

{#if results && results.length}
  <h3>Results:</h3>
  <ul>
    {#each results as result}
      <li on:click={() => console.log(result)}>
        Posted Result:
        {result.grade.aspenStudent.givenName}
        {result.grade.aspenStudent.familyName}
        {result.grade.assignedGrade || (useDraft && result.grade.draftGrade)}
        {result.error ? "Error: " + result.error : "Success!"}
      </li>
    {/each}
  </ul>
{/if}

<style>
  .side-by-side {
    display: flex;
    justify-content: space-between;
  }
  .selected {
    border: 2px solid red;
    font-weight: bold;
  }
  .active {
    border: 3px solid blue;
  }
</style>
