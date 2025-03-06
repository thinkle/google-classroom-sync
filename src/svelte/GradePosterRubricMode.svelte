<script lang="ts">
  import { studentLookup } from "./store";
  import { GoogleAppsScript } from "./gasApi";
  import { Button, FormItem, Checkbox } from "contain-css-svelte";
  // Each "rubricAssignments[criterionId]" is the Aspen lineItem for that criterion
  export let rubricAssignments: Record<string, any>;
  export let googleAssignment;
  export let googleCourseId: string;
  export let aspenCourse;
  $: console.log(
    "Rubric Mode Poster got rubricAssignments: ",
    rubricAssignments
  );
  let useDraft = false;
  let grades = [];
  let roster = [];
  let fetchingState = "idle"; // "fetching", etc.
  let postedLog = []; // from your GoogleAppsScript.getGradeLog call
  let results = [];

  // Utility: Check if a (criterion) sub‐grade was already posted
  function isAlreadyPosted(
    studentEmail: string,
    criterionId: string,
    lastGradeChangeTimestamp: number
  ) {
    // Look in postedLog for an entry with the same “assignment-criterion-student” combo
    const uniqueId = `${googleAssignment.id}-${criterionId}-${studentEmail}`;
    const found = postedLog.find(
      (p) => p.uniqueId === uniqueId && p.timestamp >= lastGradeChangeTimestamp
    );
    return !!found;
  }

  // Utility: Make a unique ID for storing in your posted log
  function makeUniqueId(studentEmail: string, criterionId: string) {
    return `${googleAssignment.id}-${criterionId}-${studentEmail}`;
  }

  async function fetchGrades() {
    fetchingState = "fetching google grades";
    // fetchGoogleGrades returns your array of objects, each w/ `rubricGrades[]`.
    grades = await GoogleAppsScript.fetchGoogleGrades(
      googleCourseId,
      googleAssignment.id
    );

    // Make sure we have Aspen students in there
    let haveRoster = false;
    for (let g of grades) {
      // Attempt to find the roster entry in local store:
      g.aspenStudent = $studentLookup[g.studentEmail];
      if (!g.aspenStudent && !haveRoster) {
        // if we can't find one, fetch the Aspen roster once, then fill in.
        await fetchAspenRoster();
        g.aspenStudent = $studentLookup[g.studentEmail];
        haveRoster = true;
      }
    }

    // Now fetch your posted log for this assignment
    fetchingState = "fetching posted log";
    postedLog = await GoogleAppsScript.getGradeLog(googleAssignment.id);
    if (!Array.isArray(postedLog)) postedLog = [];

    fetchingState = "done";
  }

  async function fetchAspenRoster() {
    roster = await GoogleAppsScript.fetchAspenRoster(aspenCourse.sourcedId);
    for (let r of roster) {
      $studentLookup[r.email] = r;
      $studentLookup[r.email.toLowerCase()] = r;
    }
  }

  async function postRubricGrades() {
    results = [];
    // Post each sub‐grade from each student’s `rubricGrades` array
    for (let g of grades) {
      // If no rubricGrades, skip
      if (!Array.isArray(g.rubricGrades) || !g.aspenStudent) {
        continue;
      }

      for (let subGrade of g.rubricGrades) {
        const { criterionId, points } = subGrade;
        // The matching lineItem in Aspen
        const lineItem = rubricAssignments[criterionId];
        if (!lineItem) {
          // Possibly a mismatch or the user didn’t link that criterion.
          continue;
        }
        // Check if we have already posted
        if (
          isAlreadyPosted(
            g.studentEmail,
            criterionId,
            g.lastGradeChangeTimestamp
          )
        ) {
          continue;
        }

        // Build unique ID
        const uniqueId = makeUniqueId(g.studentEmail, criterionId);

        try {
          // e.g. postGrade(uniqueId, lineItem, student, score, comment)
          const postedResult = await GoogleAppsScript.postGrade(
            uniqueId,
            lineItem,
            g.aspenStudent,
            points,
            g.comment || ""
          );
          results.push({ success: true, grade: g, subGrade, uniqueId });
        } catch (err) {
          results.push({ success: false, grade: g, subGrade, error: err });
        }
      }
    }

    // Log your successes so you skip them next time
    const successfullyPosted = results.filter((r) => r.success);
    if (successfullyPosted.length) {
      GoogleAppsScript.logGrades(
        googleAssignment.id,
        successfullyPosted.map((r) => ({
          uniqueId: r.uniqueId,
          email: r.grade.studentEmail,
          timestamp: r.grade.lastGradeChangeTimestamp,
          score: r.subGrade.points,
        }))
      );
    }

    console.log("Posted rubric sub‐grades:", results);
  }
</script>

<!-- Basic UI to fetch and post -->
<Button on:click={fetchGrades} disabled={fetchingState === "fetching"}>
  Fetch Grades
</Button>
<Button on:click={postRubricGrades} disabled={grades.length === 0}>
  Post Rubric Sub‐Grades
</Button>

{#if fetchingState.startsWith("fetching")}
  <p>Fetching: {fetchingState}</p>
{/if}

{#if grades.length}
  <table>
    <thead>
      <tr>
        <th>Student</th>
        <th>Email</th>
        <th>Rubric Grades</th>
      </tr>
    </thead>
    <tbody>
      {#each grades as g}
        <tr>
          <td>{g.aspenStudent?.givenName} {g.aspenStudent?.familyName}</td>
          <td>{g.studentEmail}</td>
          <td>
            {#if Array.isArray(g.rubricGrades)}
              {#each g.rubricGrades as rg}
                <div>
                  <strong>{rg.criterion}</strong>: {rg.points}
                  {#if rg.level}<em>({rg.level})</em>{/if}
                </div>
              {/each}
            {:else}
              No rubric sub‐grades
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if results.length}
  <hr />
  <h3>Post Results</h3>
  <ul>
    {#each results as r}
      <li>
        {#if r.success}
          ✓ Posted {r.subGrade.criterion} for {r.grade.studentEmail}
        {:else}
          ✗ Error posting {r.subGrade.criterion} for {r.grade.studentEmail}: {r.error}
        {/if}
      </li>
    {/each}
  </ul>
{/if}
