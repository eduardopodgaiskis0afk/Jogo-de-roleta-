// contato.js
// Valida o formulário de contato e segue para a página de CEP,
// passando os dados preenchidos via query string.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contatoForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const mensagem = document.getElementById('mensagem');

    let valido = true;
    valido = validarCampo(nome, 'fieldNome', v => v.trim().length > 1) && valido;
    valido = validarCampo(email, 'fieldEmail', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) && valido;
    valido = validarCampo(mensagem, 'fieldMensagem', v => v.trim().length > 3) && valido;

    if (!valido) {
      status.className = 'form-status show';
      status.style.background = 'rgba(248,113,113,.12)';
      status.style.color = '#fca5a5';
      status.textContent = 'Verifique os campos destacados antes de continuar.';
      return;
    }

    status.className = 'form-status show success';
    status.textContent = 'Dados recebidos! Redirecionando para a etapa de endereço...';

    // Monta a URL da próxima etapa (página de CEP) levando os dados preenchidos
    const params = new URLSearchParams({
      nome: nome.value.trim(),
      email: email.value.trim(),
      mensagem: mensagem.value.trim()
    });

    setTimeout(() => {
      window.location.href = `cep.html?${params.toString()}`;
    }, 900);
  });

  function validarCampo(input, fieldId, checaValido) {
    const wrapper = document.getElementById(fieldId);
    const ok = checaValido(input.value);
    input.classList.toggle('invalid', !ok);
    wrapper.classList.toggle('has-error', !ok);
    return ok;
  }
});