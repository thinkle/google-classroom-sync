<script lang="ts">	
	import type { User } from './../gas/types';
    
	import { GoogleAppsScript } from './gasApi';
  import { onMount } from "svelte";

  import { fetchGoogleCourses } from "./mock/mockApi";
    
	export let email : string;
    export let teacher: User | undefined;
    export let aspenCourses = [];
    import { courseMap, assignmentMap, googleAssignments, aspenAssignments, studentLookup } from "./store";
    import { Checkbox, Button } from "contain-css-svelte";
  import { writable } from 'svelte/store';
    $: console.log('Courses maps are ',$courseMap)
    let aspenToGoogleMap = {};
    $: {
        aspenToGoogleMap = {};
        for (let key in $assignmentMap) {
            aspenToGoogleMap[$assignmentMap[key]] = key;
        }
    }

    let mappedCourses = [];
    $: mappedCourses = aspenCourses.filter(
        course => $courseMap[course.sourcedId]
    )
    let googleCourses = [];
    onMount(
        async ()=>{
            googleCourses = await GoogleAppsScript.fetchGoogleCourses();
            if (!googleCourses) {
                console.error('?',googleCourses,'google courses not fetched');
                googleCourses = [];
            } else {
                console.log('google courses are ',googleCourses);
            }
        }
    );
    $: console.log('aspenToGoogle is',aspenToGoogleMap,'regular map was',$assignmentMap);
    let coursesToSync = [];
    let selectedCourses = [];
    $:  selectedCourses = aspenCourses.filter(
        (c,i)=>(coursesToSync[i]) && $courseMap[c.sourcedId]
    );    
    let assignmentsByCourse = writable({});
    let newGradesByAssignment = writable({});
    let googleAssignmentFromAspenId = writable({});

    // Awkwardlly coying from GradePoster.svelte -- we should probably refactor :-\
    async function getAspenRoster (aspenCourse) {
        console.log("Fetch roster for ", aspenCourse);
        const roster = await GoogleAppsScript.fetchAspenRoster(aspenCourse.sourcedId);        
        for (let r of roster) {
            $studentLookup[r.email] = r;
            $studentLookup[r.email.toLowerCase()] = r;
        }
    }

    async function fetchAllAssignments () {
        for (let c of selectedCourses) {            
            let gc = $courseMap[c.sourcedId];
            let gcAssignments = await GoogleAppsScript.fetchGoogleAssessments(gc);
            let lineItems = await GoogleAppsScript.fetchLineItems(c);
            console.log('Looking at course',c,'fetched aspen line items',lineItems,'and google assignments',gcAssignments);
            console.log('Got line items...');
            lineItems = lineItems.filter(
                (li)=>aspenToGoogleMap[li.sourcedId]
            );
            console.log('Filtered line items...',lineItems);
            $assignmentsByCourse[c.sourcedId] = lineItems;            
            let fetchedRoster = false;
            for (let lineItem of lineItems) {
                let googleAssignmentId = aspenToGoogleMap[lineItem.sourcedId];
                let googleAssignment = gcAssignments.find(
                    (a)=>a.id == googleAssignmentId
                );
                $googleAssignmentFromAspenId[lineItem.sourcedId] = googleAssignment;
                if (googleAssignment) {
                    if (!fetchedRoster) {
                        console.log('Fetch roster...');
                        // we will need to map from email to student to grok grades...
                        await getAspenRoster(c);
                        fetchedRoster = true;
                    }
                    console.log('Got google assignment, lets fetch grades...');
                    console.log(googleAssignment.id,googleAssignment,lineItem);  
                    console.log('Course id is',gc);                  
                    let currentGoogleGrades = await GoogleAppsScript.fetchGoogleGrades(gc, googleAssignment.id);
                    let loggedGrades = await GoogleAppsScript.getGradeLog(googleAssignment.id);
                    console.log('Fetched grades for',googleAssignment.title,currentGoogleGrades,loggedGrades);
                    let gradesToPost = [];
                    for (let g of currentGoogleGrades) {
                        let aspenStudent = $studentLookup[g.studentEmail];
                        let existingGrade = loggedGrades.find(
                            (lg)=>lg.email == g.studentEmail
                        );
                        if (!aspenStudent) { continue; }
                        if (!existingGrade) {
                            //console.log('Grade',g,'was not posted yet');
                            gradesToPost.push(
                                {
                                    student: aspenStudent,
                                    grade: g,
                                    lineItem: lineItem,
                                    assignment: googleAssignment,                             
                                }
                            )
                        }
                        else if (existingGrade.timestamp < g.lastGradeChangeTimestamp) {
                            //console.log('Grade',g,'was updated since last post',existingGrade);
                            gradesToPost.push(
                                {
                                    student: aspenStudent,
                                    grade: g,
                                    lineItem: lineItem,
                                    assignment: googleAssignment,
                                    existingGrade: existingGrade,
                                }
                            )
                        } //else {
                            // ignore already posted grade
                        //}
                    }
                    
                    $newGradesByAssignment[googleAssignment.id] = gradesToPost;                 
                    
                }
            }
        }
    }
    
    $: console.log('Updated newGrades',$newGradesByAssignment);

</script>


<h2>Choose Courses to Sync</h2>
{#each aspenCourses as course,i (course.sourcedId)}
    {@const googleCourseId = $courseMap[course.sourcedId]}
    
    {#if googleCourseId}
    <li>
        <Checkbox bind:checked={coursesToSync[i]}>
          <span>{course.title} to {googleCourses.find((c)=>c.id===googleCourseId)?.name}</span>
        </Checkbox>
    </li>
     {/if}    
{/each}
{#if selectedCourses.length}
    <h2>Fetching assignments to sync for {selectedCourses.length} courses...</h2>
    
    <Button on:click={fetchAllAssignments}>Fetch Assignments</Button>
{/if}
{#each selectedCourses as course}
    <h3>{course.title}</h3>
    {#if $assignmentsByCourse[course.sourcedId]}
        <ul>            
            {#each $assignmentsByCourse[course.sourcedId] as assignment}
                {@const googleAssignment = $googleAssignmentFromAspenId[assignment.sourcedId]}
                <li>{assignment.title}</li> ({assignment.sourcedId}) ({googleAssignment ? googleAssignment.id : 'no google map'})
                {#if googleAssignment && $newGradesByAssignment[googleAssignment.id] && $newGradesByAssignment[googleAssignment.id].length}
                    <h3>New Grades to post!</h3>
                    <ul>
                        {#each $newGradesByAssignment[googleAssignment.id] as grade}
                            <li>{grade?.student?.name} {grade?.grade?.score}
                                {#if grade.existingGrade}
                                    <span> (was {grade?.existingGrade?.score} on {grade?.existingGrade?.timestamp})</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}
            {/each}
        
        </ul>
    {/if}
{/each}

<style>

</style>

