// cep.js
// Lê os dados vindos da página de contato, consulta o endereço na API
// pública ViaCEP (https://viacep.com.br) e, ao confirmar, redireciona
// para a página final exibindo uma mensagem de agradecimento.

document.addEventListener('DOMContentLoaded', () => {
  // ----- recupera dados vindos da etapa anterior (contato.html) -----
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome') || '';
  const email = params.get('email') || '';
  const mensagem = params.get('mensagem') || '';

  const saudacao = document.getElementById('saudacaoNome');
  if (nome) saudacao.textContent = nome;

  // ----- elementos -----
  const cepInput = document.getElementById('cep');
  const buscarBtn = document.getElementById('buscarBtn');
  const cepStatus = document.getElementById('cepStatus');
  const enderecoBox = document.getElementById('enderecoBox');
  const ruaInput = document.getElementById('rua');
  const bairroInput = document.getElementById('bairro');
  const cidadeInput = document.getElementById('cidade');
  const numeroInput = document.getElementById('numero');
  const complementoInput = document.getElementById('complemento');
  const confirmarBtn = document.getElementById('confirmarBtn');
  const form = document.getElementById('cepForm');

  let enderecoEncontrado = null;

  // formata o CEP enquanto o usuário digita: 00000-000
  cepInput.addEventListener('input', () => {
    let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    cepInput.value = v;
  });

  // permite buscar pressionando Enter no campo de CEP
  cepInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarBtn.click();
    }
  });

  buscarBtn.addEventListener('click', async () => {
    const cepLimpo = cepInput.value.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      marcarCampoInvalido('fieldCep', true);
      cepStatus.textContent = '';
      return;
    }
    marcarCampoInvalido('fieldCep', false);

    buscarBtn.disabled = true;
    buscarBtn.textContent = 'Buscando...';
    cepStatus.className = 'cep-status loading';
    cepStatus.textContent = 'Consultando CEP...';
    enderecoBox.classList.remove('show');
    confirmarBtn.disabled = true;

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!resposta.ok) {
        throw new Error('Falha na requisição à API ViaCEP.');
      }

      const dados = await resposta.json();

      if (dados.erro) {
        cepStatus.className = 'cep-status error';
        cepStatus.textContent = 'CEP não encontrado. Confira o número digitado.';
        enderecoBox.classList.remove('show');
        return;
      }

      // preenche os campos de endereço com o retorno da API
      ruaInput.value = dados.logradouro || '';
      bairroInput.value = dados.bairro || '';
      cidadeInput.value = `${dados.localidade || ''} / ${dados.uf || ''}`;

      enderecoEncontrado = dados;
      enderecoBox.classList.add('show');
      confirmarBtn.disabled = false;

      cepStatus.className = 'cep-status success';
      cepStatus.textContent = 'Endereço encontrado! Complete o número e confirme abaixo.';
      numeroInput.focus();

    } catch (erro) {
      cepStatus.className = 'cep-status error';
      cepStatus.textContent = 'Não foi possível consultar o CEP agora. Tente novamente em instantes.';
    } finally {
      buscarBtn.disabled = false;
      buscarBtn.textContent = 'Buscar';
    }
  });

  // ----- ação final: confirmar e enviar -----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!enderecoEncontrado) return;

    const numeroOk = numeroInput.value.trim().length > 0;
    marcarCampoInvalido('fieldNumero', !numeroOk);
    if (!numeroOk) {
      numeroInput.focus();
      return;
    }

    // Monta o resumo completo para levar à página final.
    // Observação: para um site em produção, o ideal é enviar esses dados
    // via POST para um servidor/planilha, em vez de expor tudo na URL.
    const finalParams = new URLSearchParams({
      nome,
      email,
      mensagem,
      cep: cepInput.value,
      rua: ruaInput.value,
      bairro: bairroInput.value,
      cidade: cidadeInput.value,
      numero: numeroInput.value.trim(),
      complemento: complementoInput.value.trim()
    });

    confirmarBtn.disabled = true;
    confirmarBtn.textContent = 'Enviando...';

    setTimeout(() => {
      window.location.href = `mensagem.html?${finalParams.toString()}`;
    }, 600);
  });

  function marcarCampoInvalido(fieldId, invalido) {
    const wrapper = document.getElementById(fieldId);
    wrapper.classList.toggle('has-error', invalido);
    const input = wrapper.querySelector('input');
    if (input) input.classList.toggle('invalid', invalido);
  }
});