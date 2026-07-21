// mensagem.js
// Lê todos os dados recebidos via query string (vindos da página de CEP)
// e monta o resumo exibido nesta página de agradecimento/confirmação.

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  const dados = {
    nome: params.get('nome') || '—',
    email: params.get('email') || '—',
    mensagem: params.get('mensagem') || '—',
    cep: params.get('cep') || '—',
    rua: params.get('rua') || '—',
    bairro: params.get('bairro') || '—',
    cidade: params.get('cidade') || '—',
    numero: params.get('numero') || '—',
    complemento: params.get('complemento') || ''
  };

  document.getElementById('nomeDestaque').textContent = dados.nome !== '—' ? dados.nome : 'ganhador(a)';

  const enderecoCompleto = `${dados.rua}, ${dados.numero}${dados.complemento ? ' - ' + dados.complemento : ''} — ${dados.bairro}, ${dados.cidade} — CEP ${dados.cep}`;

  const linhas = [
    { k: 'Nome', v: dados.nome },
    { k: 'E-mail', v: dados.email },
    { k: 'Endereço', v: enderecoCompleto },
    { k: 'Mensagem', v: dados.mensagem, msg: true }
  ];

  const resumoBox = document.getElementById('resumoBox');
  resumoBox.innerHTML = linhas.map(linha => `
    <div class="item${linha.msg ? ' msg' : ''}">
      <span class="k">${linha.k}</span>
      <span class="v">${escapeHtml(linha.v)}</span>
    </div>
  `).join('');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});