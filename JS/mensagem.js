// mensagem.js
// Endereço: vem pela query string (página de CEP).
// Nome e e-mail: vêm do usuário que fez login (guardado pelo auth.js).

// >>> AJUSTE AQUI se o auth.js guardar o usuário logado em outra chave <<<
const CHAVES_SESSAO = ['usuarioLogado', 'usuario', 'user', 'currentUser', 'sessao', 'logado'];

function lerUsuarioLogado() {
  for (const store of [sessionStorage, localStorage]) {
    for (const chave of CHAVES_SESSAO) {
      let raw;
      try { raw = store.getItem(chave); } catch (e) { continue; }
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') return obj;
        if (typeof obj === 'string' && obj.includes('@')) return { email: obj };
      } catch (e) {
        if (raw.includes('@')) return { email: raw };
      }
    }
  }
  return {};
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const user = lerUsuarioLogado();

  const dados = {
    nome: user.nome || user.name || params.get('nome') || '—',
    email: user.email || params.get('email') || '—',
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
    { k: 'Endereço', v: enderecoCompleto }
  ];

  document.getElementById('resumoBox').innerHTML = linhas.map(linha => `
    <div class="item">
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