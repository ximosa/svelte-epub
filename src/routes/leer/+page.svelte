<script>
    import { onMount } from 'svelte';
    import { currentBook } from '$lib/stores';
    import ePub from 'epubjs';

    let viewer;
    let rendition;
    let book;

    onMount(() => {
        if ($currentBook) {
            book = ePub($currentBook);
            rendition = book.renderTo(viewer, {
                width: '100%',
                height: '100%',
                flow: 'scrolled-doc',
                manager: 'continuous'
            });
            rendition.display();

            // Controles de navegación
            document.addEventListener('keyup', (e) => {
                if (e.key === 'ArrowLeft') rendition.prev();
                if (e.key === 'ArrowRight') rendition.next();
            });
        }
    });
</script>

<div class="reader-container">
    <div bind:this={viewer} class="viewer"></div>
    <div class="controls">
        <button on:click={() => rendition?.prev()}>Anterior</button>
        <button on:click={() => rendition?.next()}>Siguiente</button>
    </div>
</div>

<style>
    .reader-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .viewer {
        flex: 1;
        width: 100%;
        overflow: hidden;
    }

    .controls {
        padding: 1rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background: #0056b3;
    }
</style>
