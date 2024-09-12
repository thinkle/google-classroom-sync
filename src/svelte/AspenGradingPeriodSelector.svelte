<script lang="ts">
  import AspenCategorySelector from "./AspenCategorySelector.svelte";

  import { onMount } from "svelte";
  import { GoogleAppsScript } from "./gasApi";
  import AspenClassList from "./AspenClassList.svelte";
  import AspenLineItemList from "./AspenLineItemList.svelte";
  import type { User, Course, LineItem } from "../gas/types";

  let email: string;
  let teacher: User | undefined;
  let courses: Course[] = [];
  let selectedCourse: Course | undefined;
  let lineItems: LineItem[] = [];

  onMount(async () => {
    email = await GoogleAppsScript.getActiveUserEmail();
    teacher = await GoogleAppsScript.fetchTeacherByEmail(email);
    if (teacher) {
      courses = await GoogleAppsScript.fetchAspenCourses(teacher);
    }
  });

  const selectCourse = async (event) => {
    selectedCourse = event.detail.selectedClass;
    console.log("User selected: ", selectedCourse);
    lineItems = await GoogleAppsScript.fetchLineItems(selectedCourse);
  };
</script>

<div>
  <h2>Fetch Grading Period</h2>
</div>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
</style>
