<script>
    import { goto } from '$app/navigation';
    let isMenuOpen = false;
    
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
    };
</script>

<header>
    <nav>
        <button class="hamburger" on:click={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <ul class:active={isMenuOpen}>
            <li><a href="/">Inicio</a></li>
            <li><a href="/biblioteca">Biblioteca</a></li>
            <li><a href="/nube">Subir Libro</a></li>
            <li><a href="https://ximosa.github.io/historia/">Historico</a></li>
            <li><a href="/buscar">Buscar</a></li>
            <li><a href="/google">Google</a></li>
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
        position: relative;
    }

    .hamburger {
        display: none;
        flex-direction: column;
        gap: 6px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 10px;
    }

    .hamburger span {
        display: block;
        width: 25px;
        height: 3px;
        background: white;
        transition: 0.3s;
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

    @media (max-width: 768px) {
        .hamburger {
            display: flex;
        }

        ul {
            display: none;
            flex-direction: column;
            top: 100%;
            left: 0;
            right: 0;
            background: #333;
            padding: 1rem;
            gap: 1rem;
        }

        ul.active {
            display: flex;
        }

        li {
            width: 100%;
            text-align: center;
        }
    }
</style>


