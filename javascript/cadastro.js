// cadastro.js - Validação e submissão do formulário de voluntariado
(function () {
    'use strict';

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
        toast.style.transition = "opacity 0.3s";

        if (type === "success") {
            toast.style.background = "#2ecc71";
            toast.style.color = "#fff";
        } else if (type === "error") {
            toast.style.background = "#e74c3c";
            toast.style.color = "#fff";
        } else {
            toast.style.background = "#333";
            toast.style.color = "#fff";
        }

        document.body.appendChild(toast);

        setTimeout(() => {
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

    function validateForm(form) {
        clearFieldErrors(form);
        let valid = true;

        const nome = form.querySelector('#nome');
        const email = form.querySelector('#email');
        const telefone = form.querySelector('#telefone');
        const idade = form.querySelector('#idade');

        if (!nome.value.trim()) {
            addFieldError(nome, 'Informe o nome completo.');
            valid = false;
        }

        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !re.test(email.value.trim())) {
            addFieldError(email, 'Digite um e-mail válido.');
            valid = false;
        }

        const digits = telefone.value.replace(/\D/g, '');
        if (!digits || digits.length < 10) {
            addFieldError(telefone, 'Informe um telefone válido.');
            valid = false;
        }

        const val = Number(idade.value);
        if (!idade.value || isNaN(val) || val < 16 || val > 100) {
            addFieldError(idade, 'Idade deve ser entre 16 e 100.');
            valid = false;
        }

        return valid;
    }

    function handleSubmit(ev) {
        ev.preventDefault();
        const form = ev.target || document.getElementById('volunteerForm');
        if (!form) return;

        if (!validateForm(form)) {
            createToast("⚠️ Corrija os erros antes de enviar.", "error", 3000);
            return;
        }

        // Coleta os dados do formulário
        const data = {};
        const fields = ['nome', 'email', 'telefone', 'idade', 'experiencia', 'motivacao'];
        fields.forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el) data[name] = el.value.trim();
        });
        data.createdAt = new Date().toISOString();

        const saved = saveVolunteer(data);
        if (!saved) {
            createToast("Erro ao salvar cadastro.", "error");
            return;
        }

        // ✅ Exibir a mensagem de sucesso
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.style.opacity = '1';
            successMessage.textContent = '✅ Cadastro realizado com sucesso! Entraremos em contato em breve.';

            // animação de fade out após alguns segundos
            setTimeout(() => {
                successMessage.style.transition = 'opacity 0.5s';
                successMessage.style.opacity = '0';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 500);
            }, 4000);
        }

        form.reset();
        createToast("Cadastro salvo com sucesso.", "success", 2500);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('volunteerForm');
        if (!form) return;
        form.addEventListener('submit', handleSubmit);
    });
})();
