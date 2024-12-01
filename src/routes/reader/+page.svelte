<script>
    import { page } from '$app/stores';
    import EpubReader from '../../lib/components/EpubReader.svelte';
    
    let file = $page.state?.file;
</script>

{#if file}
    <EpubReader {file} />
{/if}
