<script>
    import { goto } from '$app/navigation';
</script>
  <header>
      <nav>
          <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/biblioteca">Biblioteca</a></li>
              <li><a href="/nube">Subir Libro</a></li>
              <li><a href="https://ximosa.github.io/historia/">Historico</a></li>
              <li><a href="/buscar">Buscar</a></li>
          </ul>
      </nav>
  </header>

  <style>
      header {
          background: #333;
          padding: 1rem;
          width: 100%;
      }

      nav {
          max-width: 1200px;
          margin: 0 auto;
      }

      ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 2rem;
      }

      a {
          color: white;
          text-decoration: none;
          font-size: 1.1rem;
      }

      a:hover {
          color: #007bff;
      }
  </style>
