<script lang="ts">
  import { TextLayout } from "contain-css-svelte";

    export let error = '';
    const DEFAULT_SUMMARY = `
    <h2>Error</h2>
    <p>Unknown error from Aspen</p>
    <p>See below for full error.</p>`;
    let summary = DEFAULT_SUMMARY;

    function handleColumnDupError (error) {
        if (!error) return;
        if (error.includes('GB column name ') && error.includes('already exists')) {
            const match = error.match(/GB column name.*?"([^"]+)"/);
            let title = 'Unknown';
            if (match) {
                title = match[1];
            }                        
            summary = `
            <h2>Duplicate GB Column Name</h2>
            <p>There is already a column named "${title}" in the gradebook.</p>
            <p>Aspen doesn't let me specify a gradebook column separate from
            the assignment title, so you must make sure that the first 10 characters
            of your title are unique.</p>
            <p>Change the title and try again!</p>
            `
        }
    }

    function analyzeError (error) {
        handleColumnDupError(error);
    }

    $: analyzeError(error);

</script>
{#if error}
    <TextLayout>
        {@html summary}
        <details>
            <summary>Full Error from Aspen</summary>
            <code>{error}</code>
        </details>
    </TextLayout>
{/if}

