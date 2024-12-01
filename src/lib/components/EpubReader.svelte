<script>
  import { onMount, onDestroy } from 'svelte';
  import ePub from 'epubjs';
  
  export let file;
  
  let viewer;
  let book;
  let rendition;
  let toc = [];
  let showToc = false;
  let fontSize = 100;
  let theme = 'light';
    onMount(async () => {
      try {
        // Usar FileReader para leer el archivo como ArrayBuffer
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          book = ePub(arrayBuffer);
        
          await book.ready;
        
          rendition = book.renderTo(viewer, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'paginated'
          });

          const navigation = await book.loaded.navigation;
          toc = navigation.toc;
        
          await rendition.display();
        };
      
        reader.readAsArrayBuffer(file);

        document.addEventListener('keyup', handleKeyPress);
      } catch (error) {
        console.log('Error al cargar el libro:', error);
      }
    });
  onDestroy(() => {
    document.removeEventListener('keyup', handleKeyPress);
    if (book) {
      book.destroy();
    }
  });

  function handleKeyPress(e) {
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'ArrowRight') nextPage();
  }

  function nextPage() {
    rendition.next();
  }

  function prevPage() {
    rendition.prev();
  }

  function navigateToChapter(href) {
    rendition.display(href);
    showToc = false;
  }

  function changeFontSize(size) {
    fontSize = size;
    rendition.themes.fontSize(`${size}%`);
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    rendition.themes.register(theme, {
      body: {
        background: theme === 'light' ? '#ffffff' : '#222222',
        color: theme === 'light' ? '#000000' : '#ffffff'
      }
    });
    rendition.themes.select(theme);
  }
</script>

<div class="reader-container" class:dark={theme === 'dark'}>
  <div class="toolbar">
    <button on:click={() => showToc = !showToc}>
      Índice
    </button>
    <div class="font-controls">
      <button on:click={() => changeFontSize(fontSize - 10)}>A-</button>
      <button on:click={() => changeFontSize(100)}>A</button>
      <button on:click={() => changeFontSize(fontSize + 10)}>A+</button>
    </div>
    <button on:click={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  </div>

  <div class="content-area">
    {#if showToc}
      <div class="toc-panel">
        <h3>Tabla de Contenidos</h3>
        <ul>
          {#each toc as chapter}
            <li>
              <button on:click={() => navigateToChapter(chapter.href)}>
                {chapter.label}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="epub-viewer" bind:this={viewer}></div>
  </div>

  <div class="controls">
    <button on:click={prevPage}>←</button>
    <button on:click={nextPage}>→</button>
  </div>
</div>

<style>
  .reader-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .reader-container.dark {
    background: #222222;
    color: white;
  }

  .toolbar {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
  }

  .content-area {
    flex: 1;
    display: flex;
    position: relative;
  }

  .epub-viewer {
    flex: 1;
    overflow: hidden;
  }
  .epub-viewer img {
    max-width: 50%;
    height: auto;
    object-fit: contain;
}
  .toc-panel {
    width: 250px;
    background: #f5f5f5;
    padding: 1rem;
    overflow-y: auto;
    border-right: 1px solid #ccc;
  }

  .dark .toc-panel {
    background: #333333;
  }

  .controls {
    padding: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #2c2e2c;
    color: white;
  }

  button:hover {
    background: #04720a;
  }

  .font-controls {
    display: flex;
    gap: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li button {
    width: 100%;
    text-align: left;
    background: none;
    color: inherit;
    padding: 0.5rem;
  }

  li button:hover {
    background: rgba(0, 0, 0, 0.1);
  }
</style>
