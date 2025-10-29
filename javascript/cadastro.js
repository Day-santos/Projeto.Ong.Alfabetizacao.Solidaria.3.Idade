

// cadastro.js - Validação e submissão do formulário de voluntariado
(function () {
    'use strict';


    // ---- helpers ----
    function clearFieldErrors(container = document) {
        const errors = container.querySelectorAll(".error-message");
        errors.forEach(e => e.remove());
    }


    function addFieldError(inputEl, message) {
        if (!inputEl) return;
        const existing = inputEl.parentElement.querySelector(".error-message");
        if (existing) existing.remove();
        const small = document.createElement("small");
        small.className = "error-message";
        small.style.color = "#e74c3c";
        small.textContent = message;
        inputEl.insertAdjacentElement("afterend", small);
    }


    function createToast(message, type = "info", timeout = 3500) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.bottom = "16px";
        toast.style.right = "16px";
        toast.style.padding = "10px 14px";
        toast.style.borderRadius = "6px";
        toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        toast.style.zIndex = 9999;
        // estilos mínimos por tipo
        if (type === "success") toast.style.background = "#2ecc71", toast.style.color = "#fff";
        else if (type === "error") toast.style.background = "#e74c3c", toast.style.color = "#fff";
        else toast.style.background = "#333", toast.style.color = "#fff";


        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = "opacity 300ms";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, timeout);
    }


    function saveVolunteer(volunteer) {
        try {
            const key = "alfabetizacao_volunteers_v1";
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(volunteer);
            localStorage.setItem(key, JSON.stringify(arr));
            return true;
        } catch (err) {
            console.error("Erro ao salvar voluntário:", err);
            return false;
        }
    }


    // Validação simples dos campos
    function validateForm(form) {
        clearFieldErrors(form);
        let valid = true;


        const nome = form.querySelector('#nome');
        const email = form.querySelector('#email');
        const telefone = form.querySelector('#telefone');
        const idade = form.querySelector('#idade');
        const area = form.querySelector('#area'); // se existir
        // checar nome
        if (nome) {
            if (!nome.value.trim()) {
                addFieldError(nome, 'Informe o nome completo.');
                valid = false;
            }
        }


        // checar email simples
        if (email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                addFieldError(email, 'Informe o e-mail.');
                valid = false;
            } else if (!re.test(email.value.trim())) {
                addFieldError(email, 'Digite um e-mail válido.');
                valid = false;
            }
        }


        // telefone (apenas dígitos mínimo 8)
        if (telefone) {
            const digits = telefone.value.replace(/\D/g, '');
            if (!digits || digits.length < 8) {
                addFieldError(telefone, 'Informe um telefone válido.');
                valid = false;
            }
        }


        // idade entre atributos min/max se informados
        if (idade) {
            const val = Number(idade.value);
            const min = idade.min ? Number(idade.min) : 0;
            const max = idade.max ? Number(idade.max) : 150;
            if (!idade.value) {
                addFieldError(idade, 'Informe a idade.');
                valid = false;
            } else if (isNaN(val) || val < min || val > max) {
                addFieldError(idade, `Idade deve ser entre ${min} e ${max}.`);
                valid = false;
            }
        }


        // pode adicionar outras validações específicas se os campos existirem
        return valid;
    }


    // Manipulador de submissão
    function handleSubmit(ev) {
        ev.preventDefault();
        const form = ev.target || document.getElementById('volunteerForm');
        if (!form) return;


        if (!validateForm(form)) {
            createToast("Por favor, corrija os erros do formulário.", "error", 2500);
            return;
        }


        // coletar dados
        const data = {};
        const fields = ['nome', 'email', 'telefone', 'idade', 'area', 'experiencia', 'motivacao'];
        fields.forEach(name => {
            const el = form.querySelector('[name="' + name + '"]');
            if (el) data[name] = el.value.trim();
        });
        data.createdAt = new Date().toISOString();


        const saved = saveVolunteer(data);
        if (!saved) {
            createToast("Erro ao salvar cadastro. Tente novamente.", "error");
            return;
        }


        // mostrar mensagem de sucesso (se existir elemento successMessage)
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.textContent = '✅ Cadastro realizado com sucesso! Entraremos em contato em breve.';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }


        form.reset();
        createToast("Cadastro salvo localmente com sucesso.", "success", 2200);
    }


    // Inicialização: ligar o event listener ao formulário na DOM
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('volunteerForm');
        if (!form) return;
        // remover atributo inline onsubmit para evitar submissão dupla
        if (form.getAttribute('onsubmit')) form.removeAttribute('onsubmit');
        form.addEventListener('submit', handleSubmit);
    });


    // expor para testes (opcional)
    window.__alf_utils = { saveVolunteer, createToast };
})();



