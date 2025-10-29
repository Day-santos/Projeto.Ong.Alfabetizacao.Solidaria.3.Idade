(function () {
    'use strict';


    const main = document.querySelector('main') || document.createElement('main');
    // armazena conteúdo inicial da página (inicio)
    const initialContent = main.innerHTML;


    const routes = {
        inicio: { title: 'Início', path: null }, // usa conteúdo inicial
        projetos: { title: 'Projetos', path: 'projetos.html' },
        cadastro: { title: 'Cadastro', path: 'cadastro.html' }
    };


    function setTitle(route) {
        const t = routes[route] && routes[route].title ? routes[route].title : 'ONG';
        document.title = `ONG Alfabetização — ${t}`;
    }


    async function fetchRouteHtml(path) {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (!res.ok) throw new Error('Falha ao carregar ' + path + ' (' + res.status + ')');
            const text = await res.text();
            // extrair apenas o conteúdo dentro da tag <main> do arquivo remoto (se existir)
            const match = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
            return match ? match[1] : text;
        } catch (err) {
            console.error(err);
            return `<section class="error"><h2>Erro ao carregar a página</h2><p>${err.message}</p></section>`;
        }
    }


    async function render(route) {
        if (!routes[route]) route = 'inicio';
        setTitle(route);


        if (route === 'inicio') {
            main.innerHTML = initialContent;
            bindLinks();
            return;
        }


        const routeInfo = routes[route];
        if (routeInfo.path) {

            const html = await fetchRouteHtml(routeInfo.path);
            main.innerHTML = html;
            bindLinks();
            if (route === 'cadastro') {
                const firstInput = main.querySelector('input, textarea, select');
                if (firstInput) firstInput.focus();
            }
        }
    }


    function navigateTo(route) {
        if (!routes[route]) route = 'inicio';
        location.hash = '#' + route;

        render(route);
    }


    function bindLinks() {
        // intercepta links do menu principal 
        const anchors = document.querySelectorAll('a[href]');
        anchors.forEach(a => {
            const href = a.getAttribute('href');


            // tratar apenas links para os arquivos locais: projetos.html, cadastro.html ou index.html
            if (href.endsWith('projetos.html') || href.endsWith('cadastro.html') || href.endsWith('index.html')) {
                a.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    if (href.endsWith('projetos.html')) navigateTo('projetos');
                    else if (href.endsWith('cadastro.html')) navigateTo('cadastro');
                    else navigateTo('inicio');

                    // fecha menu quando clicar 
                    const nav = document.getElementById('navMenu');
                    if (nav && nav.classList.contains('open')) nav.classList.remove('open');
                });
            }
        });
    }


    function setupMenuToggle() {
        const btn = document.querySelector('.menu-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                toggleMenu();
            });
        }
    }


    // Função utilitária pública mínima para abrir/fechar menu
    window.toggleMenu = function toggleMenu() {
        const nav = document.getElementById('navMenu');
        if (!nav) return;
        nav.classList.toggle('open');
    };


    // Ao carregar a página
    document.addEventListener('DOMContentLoaded', function () {
        bindLinks();
        setupMenuToggle();


        // rota inicial
        const hash = location.hash.replace('#', '') || 'inicio';
        render(hash);


        // responde ao histórico 
        window.addEventListener('hashchange', function () {
            const h = location.hash.replace('#', '') || 'inicio';
            render(h);
        });
    });


})();
// Botão de modo noturno (acessibilidade)
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("themeToggle");
    const body = document.body;

    // Verifica se o usuário já tem preferência salva
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        body.classList.add("dark-mode");
        toggleButton.textContent = "☀️";
        toggleButton.setAttribute("aria-label", "Ativar modo claro");
    }

    toggleButton.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            toggleButton.textContent = "☀️";
            toggleButton.setAttribute("aria-label", "Ativar modo claro");
            localStorage.setItem("theme", "dark");
        } else {
            toggleButton.textContent = "🌙";
            toggleButton.setAttribute("aria-label", "Ativar modo escuro");
            localStorage.setItem("theme", "light");
        }
    });
});
// === Menu Responsivo ===
document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("navMenu");

    if (!toggle || !menu) return; // segurança

    // Alterna o menu ao clicar no botão
    toggle.addEventListener("click", () => {
        menu.classList.toggle("ativo");
        toggle.classList.toggle("ativo");
    });

    // Fecha o menu ao clicar em um link (melhor UX no mobile)
    const links = menu.querySelectorAll("a");
    links.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("ativo");
            toggle.classList.remove("ativo");
        });
    });
});
