<script lang="ts">
  import {  studentLookup } from "./store";  
  import { GoogleAppsScript } from "./gasApi";  
  import { Button, FormItem, Checkbox } from "contain-css-svelte";
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

  const NOT_FETCHING = -1;
  const FETCHING_GOOGLE_GRADES = 0;
  const FETCHING_ASPEN_ROSTER = 1;
  const FETCHING_HISTORY = 2;
  const DONE_FETCHING = 3;
  let fetchingGrades = NOT_FETCHING;

  async function getGrades() {    
    fetchingGrades = FETCHING_GOOGLE_GRADES;
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
        fetchingGrades = FETCHING_ASPEN_ROSTER;
        await getAspenRoster();
        haveLookedUpRoster = true;
        g.aspenStudent = $studentLookup[g.studentEmail];
      }
    }
    // Now let's look up the grades we have already posted...
    fetchingGrades = FETCHING_HISTORY;
    postedGrades = await GoogleAppsScript.getGradeLog(googleAssignment.id);
    console.log("Posted grades:", postedGrades);
    if (!Array.isArray(postedGrades)) {
      console.info('Bad result from getGradeLog', postedGrades,'... assuming empty array');      
      postedGrades = [];
    }
    for (let postedGrade of postedGrades) {
      let googleGrade = grades.find((g)=>g.studentEmail == postedGrade.email);
      if (googleGrade.lastGradeChangeTimestamp <= postedGrade.timestamp) {
        console.log("Grade", googleGrade, "was already posted at", postedGrade.timestamp);
        googleGrade.alreadyPosted = true;
        googleGrade.postedTimestamp = postedGrade.timestamp;
      } else {
        console.log("Grade", googleGrade, "was posted at", postedGrade.timestamp, "but has been updated since then.");
        googleGrade.alreadyPosted = false;
      }
    }
    grades = grades; // force reactivity
    fetchingGrades = DONE_FETCHING;
  }

  let postedGrades = [];

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

  function shouldPost (g) {
    return (
      !g.alreadyPosted 
      && g.aspenStudent 
      && getGrade(g) != null
    );
  }

  async function pushGradesToAspen() {
    console.log("Pushing grades to Aspen...");
    let gradesToPost = grades.filter(shouldPost);    
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
          g.comment || "" // comment
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
        results = [...results, {
          grade : g,
          result,
      }];
        // Now post grade to log so we don't re-post in the future...        
      } catch (e) {
        console.error("Error posting", g, e);
        let result = { error: e, grade: g };
        results = [...results, result];
      }
    }
    const nonErrorResults = results.filter((r) => r.grade && !r.error);
    GoogleAppsScript.logGrades(
      googleAssignment.id,
      nonErrorResults.map(
        ({grade,result}) => ({
          email : grade.studentEmail,
          score : getGrade(grade),
          timestamp : grade.lastGradeChangeTimestamp
        })
      )
    )
    console.log("Done posting grades: ", results);
  }

  function updateGradesForStudents(forceUpdate) {
    if (grades && roster) {
      for (let g of grades) {
        g.aspenStudent = $studentLookup[g.studentEmail];
      }
      grades = grades; // force reactivity
    }
  }

  $: updateGradesForStudents($studentLookup);

  let useDraft = false;
 
</script>

<Button primary={fetchingGrades==NOT_FETCHING}
  disabled={fetchingGrades != NOT_FETCHING && fetchingGrades != DONE_FETCHING}
  on:click={() => getGrades()}> <div slot="icon" class="google-icon"></div> Fetch grades </Button>
  <FormItem>
  <Checkbox bind:checked={useDraft}>Post draft grades as grades?</Checkbox>
  
</FormItem>
  <details>
    <summary>Details</summary>  
    <Button on:click={() => getAspenRoster()}> Get Aspen Roster! </Button>
    <Button
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
</Button>
</details>

{#if fetchingGrades == FETCHING_GOOGLE_GRADES}
  <span class="busy">Fetching Google Grades...</span>
{/if}
{#if fetchingGrades == FETCHING_ASPEN_ROSTER}
  <span class="busy">Fetching Aspen Roster...</span>
{/if}
{#if fetchingGrades == FETCHING_HISTORY}
  <span class="busy">Fetching Grade History...</span>
{/if}
{#if fetchingGrades == DONE_FETCHING}
  <span class="busy">Done fetching grades!</span>
{/if}
<span on:click={() => console.log("Roster:", roster)}
  >Got {roster && roster.length} students.</span
>
<span>
  got {grades && grades.length} grades
</span>

<table>
  <thead>
  <tr>
    <th>Student</th>
    <th>Grade</th>
    <th>Comment</th>
    <th>Last Updated</th>
    <th>Will Post</th>
  </tr>
  </thead>
  <tbody>
  {#each grades as grade}
    {@const numberGrade = getGrade(grade)}
    {@const isNumber = typeof numberGrade == 'number'}
    <tr>
      <td>
        {grade.aspenStudent && grade.aspenStudent.givenName}
        {grade.aspenStudent && grade.aspenStudent.familyName}
      </td>
      <td>
        {#if isNumber}{getGrade(grade)}{:else}-{/if}
      </td>
      <td>{grade.comment}</td>
      <td>
        {#if grade.postedTimestamp}
          Posted @ {new Date(grade.postedTimestamp).toLocaleDateString()}        
        {/if}
        {#if !grade.postedTimestamp || grade.postedTimestamp != grade.lastGradeChangeTimestamp}
          {#if grade.lastGradeChangeTimestamp}
            Updated in GC @
            {new Date(grade.lastGradeChangeTimestamp).toLocaleDateString()}
          {/if}
        {/if}
      </td>
      <td>
        {shouldPost(grade, useDraft) ? "Yes" : "No"}
      </td>
    </tr>
  {/each}
</tbody>
</table>

{#if grades}
  {@const unmappedGrades = grades.filter((g) => !g.aspenStudent)}
  {@const readyGrades = grades.filter(
    (g) =>
      g.aspenStudent &&
      getGrade(g) != null &&
      !g.alreadyPosted
  )}
  <div class="grades">
    <Button on:click={() => pushGradesToAspen()}
      disabled={readyGrades.length == 0}      
      primary={readyGrades.length > 0}
      >      
      <div slot="icon" class="aspen-icon"></div>
      Send {readyGrades.length}
      grades to Aspen</Button
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
            <span class="student">
            {grade.aspenStudent.givenName}
            {grade.aspenStudent.familyName}
            </span>
            <span class="grade">
              {grade.assignedGrade || (useDraft && grade.draftGrade)}
            </span>
            <span class="comment">
              {grade.comment}
            </span>
            <span class="updated">
              {new Date(grade.lastGradeChangeTimestamp).toLocaleDateString()}
              {new Date(grade.lastGradeChangeTimestamp).toLocaleTimeString()}
            </span>
          </li>
        {/each}
      </ul>
    </div>    
  </div>
{/if}

{#if results && results.length}
  <h3 class="text-w-icon"><div class="aspen-icon"> Posting Results:</h3>
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
  .busy {
    font-weight: bold;
    color: var(--primary-bg);
    background-color: var(--primary-fg);
    display: inline-block;
    padding: 1em;
    font-size: large;
    cursor: busy;
  }
</style>
