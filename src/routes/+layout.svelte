<script>
    import Header from '$lib/components/Header.svelte';
    import { beforeNavigate } from '$app/navigation';
    
    beforeNavigate(({ to }) => {
        if (to?.url.pathname === '/spanish-books') {
            fetch('/api/spanish-books?page=1');
        }
    });
</script>

<div class="app-container">
    <Header />
    <main>
        <slot />
    </main>
</div>
  <style>
      .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
      }

      main {
          flex: 1;
          margin-top: 60px;
          width: 100%;
          position: relative;
      }

      :global(body) {
          margin: 0;
          padding: 0;
      }

      :global(.reader-container) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
      }
  </style>
