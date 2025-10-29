

// actions.js - SPA simples para o projeto da ONG
// Responsável por: rotas hash-based, injeção de templates (projetos/cadastro) e utilitários (toggleMenu)


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
            bindLinks(); // re-bind links that may be inside injected content
            return;
        }


        const routeInfo = routes[route];
        if (routeInfo.path) {
            // tentativa de carregar via fetch o arquivo relativo (funciona quando servido por HTTP)
            const html = await fetchRouteHtml(routeInfo.path);
            main.innerHTML = html;
            bindLinks();
            // se a rota for cadastro, ligar o listener de formulário (se existir)
            if (route === 'cadastro') {
                // se o arquivo cadastrado já contém script de validação, ele será executado ao injetar o HTML
                // caso contrário, usuário já tem cadastro.js incluído globalmente para tratar o formulário.
                // Forçar foco no primeiro input se houver
                const firstInput = main.querySelector('input, textarea, select');
                if (firstInput) firstInput.focus();
            }
        }
    }


    function navigateTo(route) {
        if (!routes[route]) route = 'inicio';
        // atualiza hash (isso também mantém o histórico navegável)
        location.hash = '#' + route;
        // chamar render explicitamente (popstate também chamará, mas aqui garantimos resposta imediata)
        render(route);
    }


    function bindLinks() {
        // intercepta links do menu principal para rotas SPA
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

                    // fecha menu quando clicar (se existir)
                    const nav = document.getElementById('navMenu');
                    if (nav && nav.classList.contains('open')) nav.classList.remove('open');
                });
            }
        });
    }


    function setupMenuToggle() {
        // garante que exista um botão .menu-toggle
        const btn = document.querySelector('.menu-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                toggleMenu();
            });
        }
    }


    // Função utilitária pública mínima para abrir/fechar menu (usada pelo atributo onclick no HTML)
    window.toggleMenu = function toggleMenu() {
        const nav = document.getElementById('navMenu');
        if (!nav) return;
        nav.classList.toggle('open');
    };


    // Ao carregar a página
    document.addEventListener('DOMContentLoaded', function () {
        bindLinks();
        setupMenuToggle();


        // rota inicial a partir do hash
        const hash = location.hash.replace('#', '') || 'inicio';
        render(hash);


        // responde ao histórico (back/forward)
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
