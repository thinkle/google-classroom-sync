<script lang="ts">	
	import type { User } from './../gas/types';
	import { GoogleAppsScript } from './gasApi';
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import { fetchGoogleCourses } from "./mock/mockApi";
	import { courseMap, assignmentMap, studentLookup, googleAssignments } from "./store";
	import { Checkbox, Button } from "contain-css-svelte";

	// Reactive stores for fetched data and state
	const assignmentsByCourse = writable({});
	const newGradesByAssignment = writable({});	
	const fetchErrors = writable([]); // Track errors
	const loadingState = writable({ loading: false, message: "" });
	const progress = writable({ completed: 0, total: 0 }); // Progress tracker
    const updatedGrades = writable({}); // Track grades that have been updated    

	// Props
	export let email: string;
	export let teacher: User | undefined;
	export let aspenCourses = [];
	export let googleCourses = [];

	// Local state
	let coursesToSync = [];
	let selectedCourses = [];

	$: selectedCourses = aspenCourses.filter(
		(course, i) => coursesToSync[i] && $courseMap[course.sourcedId]
	);

	// Utility to log and track progress dynamically
	function updateProgress(message: string, increment = false) {
		loadingState.set({ loading: true, message });
		if (increment) {
			progress.update((p) => ({ ...p, completed: p.completed + 1 }));
		}
	}

	// Fetch Aspen roster for a course
	async function getAspenRoster(aspenCourse) {
		try {
			updateProgress(`Fetching roster for ${aspenCourse.title}...`);
			const roster = await GoogleAppsScript.fetchAspenRoster(aspenCourse.sourcedId);
			for (let r of roster) {
				$studentLookup[r.email] = r;
				$studentLookup[r.email.toLowerCase()] = r;
			}
			return roster;
		} catch (error) {
			fetchErrors.update((errors) => [...errors, `Failed to fetch roster for ${aspenCourse.title}: ${error.message}`]);
			throw error;
		}
	}

	// Fetch assignments and Google assignments for a course
	// Fetch assignments and Google assignments for a course
    async function fetchAssignmentsForCourse(course) {
        try {
            updateProgress(`Fetching assignments for ${course.title}...`, 1);
            const gc = $courseMap[course.sourcedId];
            const gcAssignments = await GoogleAppsScript.fetchGoogleAssessments(gc);
            const lineItems = await GoogleAppsScript.fetchLineItems(course);

            // Build a list of { lineItem, googleAssignment } pairs
            const assignments = [];

            for (const googleAssessment of gcAssignments) {
                const aspenId = $assignmentMap[String(googleAssessment.id)];
                if (aspenId) {
                    const lineItem = lineItems.find((li) => String(li.sourcedId) === String(aspenId));
                    if (lineItem) {
                        assignments.push({ lineItem, googleAssignment: googleAssessment });
                    } else {
                        console.log(`[FetchAssignments] Unable to find expected lineItem for Aspen ID ${aspenId}`);
                    }
                } else {
                    console.log(`[FetchAssignments] No Aspen ID found for Google assignment`, googleAssessment);
                }
            }

            assignmentsByCourse.update((current) => ({
                ...current,
                [course.sourcedId]: assignments,
            }));

            return assignments; // Return the consolidated list
        } catch (error) {
            updateProgress(`Error fetching assignments for ${course.title}...`);
            fetchErrors.update((errors) => [...errors, `Failed to fetch assignments for ${course.title}: ${error.message}`]);
            throw error;
        }
    }

    // Fetch grades for assignments
    async function fetchGradesForAssignments(course, assignments) {
        try {
            console.log(`[FetchGrades] Fetching grades for course ${course.title}`, assignments);
            updateProgress(`Fetching grades for ${course.title}...`, 1);
            const gc = $courseMap[course.sourcedId];
            console.log(`[FetchGrades] Course map entry for ${course.title}:`, gc);

            const gradesToPost = {};

            for (const { lineItem, googleAssignment } of assignments) {
                updateProgress(`Fetching grades for ${course.title}: ${lineItem.title}...`, true);
                console.log(`[FetchGrades] Fetching grades for lineItem ${lineItem.sourcedId}`, googleAssignment);

                const currentGoogleGrades = await GoogleAppsScript.fetchGoogleGrades(gc, googleAssignment.id);
                const loggedGrades = await GoogleAppsScript.getGradeLog(googleAssignment.id);

                const newGrades = currentGoogleGrades.reduce((toPost, g) => {
                    const aspenStudent = $studentLookup[g.studentEmail?.toLowerCase()];
                    const existingGrade = loggedGrades.find(
                        (lg) => lg.email.toLowerCase() === g.studentEmail.toLowerCase()
                    );

                    if (!aspenStudent) return toPost;

                    if (!existingGrade || existingGrade.timestamp < g.lastGradeChangeTimestamp) {
                        toPost.push({
                            student: aspenStudent,
                            grade: g,
                            assignment: googleAssignment,
                            lineItem,
                            existingGrade,
                        });
                    }

                    return toPost;
                }, []);

                gradesToPost[lineItem.sourcedId] = newGrades;
            }

            newGradesByAssignment.update((current) => ({
                ...current,
                ...gradesToPost,
            }));

            return gradesToPost;
        } catch (error) {
            updateProgress(`Error fetching grades for ${course.title}...`);
            fetchErrors.update((errors) => [...errors, `Failed to fetch grades for ${course.title}: ${error.message}`]);
            throw error;
        }
    }

	// Fetch all assignments and grades for selected courses
	// Fetch all assignments and grades for selected courses
    async function fetchAllAssignments() {
        loadingState.set({ loading: true, message: "Starting sync process..." });
        progress.set({ completed: 0, total: selectedCourses.length });

        for (const course of selectedCourses) {
            try {
                // Fetch roster first
                await getAspenRoster(course);
                updateProgress(`Done fetching roster for ${course.title}...`);

                // Fetch assignments and grades
                const assignments = await fetchAssignmentsForCourse(course);
                $assignmentsByCourse[course.sourcedId] = assignments;
                updateProgress(`Done fetching assignments for ${course.title}...`);

                await fetchGradesForAssignments(course, assignments);
                updateProgress(`Done fetching grades for ${course.title}...`, true);
            } catch (error) {
                console.error(`[FetchAllAssignments] Error fetching data for ${course.title}:`, error);
            }
        }

        loadingState.set({ loading: false, message: "Sync complete!" });
    }

    $: console.log('SyncManyAssignments - $courseMap', $courseMap);
    $: console.log('SyncManyAssignments - assignmentMap', $assignmentMap);
    $: console.log('SyncManyAssignments - studentLookup', $studentLookup);
    $: console.log('SyncManyAssignments - aspenCourses', aspenCourses);
    $: console.log('SyncManyAssignments - googleCourses', googleCourses);
    $: console.log('SyncManyAssignments - coursesToSync', coursesToSync);
    $: console.log('SyncManyAssignments - selectedCourses', selectedCourses);
    $: console.log('SyncManyAssignments - assignmentsByCourse', $assignmentsByCourse);
    $: console.log('SyncManyAssignments - newGradesByAssignment', $newGradesByAssignment);


    type GradeSummaryObject = {
        student : {
            sourcedId : string;
            givenName : string;
            familyName : string;
        },
        grade : {
            stateHistory : any[];
            studentEmail : string;
            draftGrade : number;
            gradeHistory : any[];
            studentName : string;
            maximumGrade : number;
            assignedGrade : number;
            comment : string;
            lastGradeChangeTimestamp : string;
            submissionState : string;
        },
        assignment : { id : string, courseId: string, dueDate : { month: number, year: number, day: number }},
        lineItem: { sourcedId : string, title: string, dueDate: string }
    }

    function idFromGradeSummary (g : GradeSummaryObject) {
        return g.assignment.id + '-' + g.student.sourcedId;
    }

    const UPDATED = 'Updated!';
    const POSTING_IN_PROGRESS = 'Posting...';
    const ERR = 'Error!';

    async function updateGrades (grades : GradeSummaryObject[]) {
        for (let g of grades) {
            updateProgress(`Posting grade for ${g.student.givenName} ${g.student.familyName}...`, true);
            let id = idFromGradeSummary(g);
            if ($updatedGrades[id] == UPDATED || $updatedGrades[id] == POSTING_IN_PROGRESS) {
                continue;
            }
            $updatedGrades[id] = POSTING_IN_PROGRESS;
            try {
                let result = await GoogleAppsScript.postGrade(
                    id,
                    g.lineItem,
                    g.student,
                    g.grade.assignedGrade,
                    g.grade.comment || ""
                );
                $updatedGrades[id] = 'Updated!'
                console.log('Posted!',result);
                if (result.score!==undefined && !result.error) {
                    console.log('Logging grades...');
                    let logResult = GoogleAppsScript.logGrades(g.assignment.id, [{
                        email : g.grade.studentEmail,
                        score : g.grade.assignedGrade,
                        timestamp : g.grade.lastGradeChangeTimestamp
                    }]);
                    console.log('Log result:', logResult);
                    $updatedGrades[id] = UPDATED;
                } else {
                    console.error('Error posting grade for', g.student.givenName, g.student.familyName, result);                    
                    $updatedGrades[id] = ERR;
                }
            } catch (err) {
                $updatedGrades[id] = ERR;
                console.error(`Error posting grade for ${g.student.givenName} ${g.student.familyName}:`, err);
            }
        }
    }

    /* {
    "student": {
        "sourcedId": "STD000000Z21NN",
        "identifier": "03708",
        "enabledUser": true,
        "metadata": {},
        "role": "student",
        "givenName": "Jewlian",
        "grades": [
            "12"
        ],
        "birthDate": "2007-01-28",
        "agents": [],
        "dateLastModified": "2025-01-09T18:31:47.299Z",
        "phone": "978-996-8816",
        "familyName": "Gendron",
        "userIds": [],
        "middleName": "Christopher",
        "orgs": [
            {
                "sourcedId": "SKL0000000900b",
                "type": "org",
                "href": "https://ma-innovation.myfollett.com/ims/oneroster/v1p1/schools/SKL0000000900b"
            }
        ],
        "email": "Jewlian.Gendron@innovationcharter.org",
        "username": "jcgendron",
        "status": "active"
    },
    "grade": {
        "stateHistory": [
            {
                "actorUserId": "103863206526069108293",
                "stateTimestamp": "2024-09-20T15:05:43.379Z",
                "state": "CREATED"
            },
            {
                "actorUserId": "103863206526069108293",
                "stateTimestamp": "2024-09-20T16:05:43.845Z",
                "state": "TURNED_IN"
            },
            {
                "actorUserId": "113561106451202000689",
                "stateTimestamp": "2024-09-25T11:56:25.851Z",
                "state": "RETURNED"
            },
            {
                "actorUserId": "103863206526069108293",
                "stateTimestamp": "2024-09-25T13:10:55.210Z",
                "state": "TURNED_IN"
            },
            {
                "actorUserId": "113561106451202000689",
                "stateTimestamp": "2024-10-23T11:05:53.126Z",
                "state": "RETURNED"
            }
        ],
        "studentEmail": "jewlian.gendron@innovationcharter.org",
        "draftGrade": 3.17,
        "gradeHistory": [
            {
                "gradeTimestamp": "2024-09-25T11:56:25.851Z",
                "pointsEarned": 2,
                "actorUserId": "113561106451202000689",
                "maxPoints": 4,
                "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
            },
            {
                "gradeTimestamp": "2024-10-23T11:05:53.126Z",
                "actorUserId": "113561106451202000689",
                "pointsEarned": 3.17,
                "maxPoints": 4,
                "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
            }
        ],
        "studentName": "Jewlian Gendron",
        "maximumGrade": 4,
        "assignedGrade": 3.17,
        "comment": "9/25/2024 : 2\n10/23/2024 : Revised to 3.17",
        "lastGradeChangeTimestamp": "2024-10-23T11:05:53.126Z",
        "submissionState": "RETURNED"
    },
    "assignment": {
        "creatorUserId": "113561106451202000689",
        "creationTime": "2024-09-20T14:58:10.004Z",
        "submissionModificationMode": "MODIFIABLE_UNTIL_TURNED_IN",
        "assignment": {
            "studentWorkFolder": {
                "title": "Choose Your Own Adventure Analysis (In-Class Write-Up)",
                "alternateLink": "https://drive.google.com/drive/folders/1VCEEl1dCIyc8wng5uGnMxweesls4phdLB8AwIpwZi6enz5cC35b2SW6qZAXP2UW91uGUqtct",
                "id": "1VCEEl1dCIyc8wng5uGnMxweesls4phdLB8AwIpwZi6enz5cC35b2SW6qZAXP2UW91uGUqtct"
            }
        },
        "dueDate": {
            "month": 9,
            "year": 2024,
            "day": 20
        },
        "description": "You will first copy code segments requested into the code sample section.\nThen you'll close all other tabs and enter \"test\" mode with each set of problems.\nI'll be using the dropdowns when I grade you so your test and feedback will all live in this google doc :)",
        "updateTime": "2024-09-20T15:04:08.593Z",
        "dueTime": {
            "hours": 16,
            "minutes": 30
        },
        "title": "Choose Your Own Adventure Analysis (In-Class Write-Up)",
        "topicId": "687806660588",
        "maxPoints": 4,
        "materials": [
            {
                "driveFile": {
                    "shareMode": "STUDENT_COPY",
                    "driveFile": {
                        "alternateLink": "https://docs.google.com/document/d/14Vfh7yYpAJw-KV9mE6rgkY1_m38-LmkK0j7k3OZz_mo/edit?usp=drive_web",
                        "id": "14Vfh7yYpAJw-KV9mE6rgkY1_m38-LmkK0j7k3OZz_mo",
                        "title": "Choose Your Own Adventure: Analysis & Write-Up",
                        "thumbnailUrl": "https://lh3.google.com/drive-storage/AJQWtBMNBXI_zUlG3a1nBrY5vzAQDhsMDlerlbQkml2y-B7SwhiuQ4yHFEwnvdFztENZl6NTycfsvnX_KdGBRT2vxbEmQTdU5oKZDd_FXlogi3YGDDam1eL0d3mmvFGWe8FT9iCv3w=s200"
                    }
                }
            }
        ],
        "workType": "ASSIGNMENT",
        "alternateLink": "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzE3NjYzNzg2NTc4/details",
        "id": "717663786578",
        "state": "PUBLISHED",
        "courseId": "707511230496",
        "assigneeMode": "ALL_STUDENTS"
    },
    "lineItem": {
        "sourcedId": "707511230496-717663786578",
        "metadata": {},
        "resultValueMax": 4,
        "assignDate": "2024-09-20T00:00:00.000Z",
        "dueDate": "2024-09-20T00:00:00.000Z",
        "description": "",
        "title": "[CYOA-A] Choose Your Own Adventure Analysis (In-Cl",
        "resultValueMin": 0,
        "dateLastModified": "2024-09-25T12:27:04.085Z",
        "category": {
            "sourcedId": "GCT000000jLSY8",
            "type": "category",
            "href": "https://ma-innovation.myfollett.com/ims/oneroster/v1p1/categories/GCT000000jLSY8"
        },
        "class": {
            "sourcedId": "MST000000j83zE",
            "type": "class",
            "href": "https://ma-innovation.myfollett.com/ims/oneroster/v1p1/classes/MST000000j83zE"
        },
        "gradingPeriod": {
            "sourcedId": "GTM0000004P7YW",
            "type": "academicSession",
            "href": "https://ma-innovation.myfollett.com/ims/oneroster/v1p1/gradingPeriods/GTM0000004P7YW"
        },
        "status": "active"
    }
} */
</script>

{#if $loadingState.loading}
	<p>{$loadingState.message}</p>
	<progress max={$progress.total} value={$progress.completed}></progress>
{/if}

{#if $fetchErrors.length}
	<h3>Errors:</h3>
	<ul>
		{#each $fetchErrors as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}

<h2>Choose Courses to Sync</h2>
{#each aspenCourses as course, i (course.sourcedId)}
	{@const googleCourseId = $courseMap[course.sourcedId]}
	{#if googleCourseId}
		<li>
			<Checkbox bind:checked={coursesToSync[i]}>
				<span>{course.title} to {googleCourses.find((c) => c.id === googleCourseId)?.name}</span>
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
	{#if $assignmentsByCourse[course.sourcedId]?.length}
		<ul>
			{#each $assignmentsByCourse[course.sourcedId] as { lineItem, googleAssignment }}
				<li>
					{lineItem.title} (Google: {googleAssignment.title})
					{#if $newGradesByAssignment[lineItem.sourcedId]?.length}
                        <Button on:click={() => updateGrades($newGradesByAssignment[lineItem.sourcedId])}
                            disabled={$newGradesByAssignment[lineItem.sourcedId].every(g => $updatedGrades[idFromGradeSummary(g)] == UPDATED || $updatedGrades[idFromGradeSummary(g)] == POSTING_IN_PROGRESS)}
                            >
                            Post Updated Grades
                        </Button>
						<ul>
							{#each $newGradesByAssignment[lineItem.sourcedId] as grade}
								<li class:updated={$updatedGrades[idFromGradeSummary(grade)] == UPDATED}
                                class:posting={$updatedGrades[idFromGradeSummary(grade)] == POSTING_IN_PROGRESS}>
									{grade.student.givenName} {grade.student.familyName}: 
									{grade.grade.assignedGrade || 0} 
									{#if grade.grade.comment}
										({grade.grade.comment})
									{/if}
                                    {#if $updatedGrades[idFromGradeSummary(grade)]}
                                        <span class="updated">
                                            {$updatedGrades[idFromGradeSummary(grade)]}
                                        </span>
                                    {/if}
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/each}

<style>
/* Add any necessary styles here */
.updated {
    color: var(--secondary-bg);    
}
.posting {
    color: var(--primary-bg);
    font-style: italic;
}
</style>