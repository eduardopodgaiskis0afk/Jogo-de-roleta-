// ===== Auth compartilhado (cadastro + login) — dados salvos no navegador (localStorage) =====
const CHAVE_USUARIOS = 'usuarios';       // { "email": { nome, senha(hash), criadoEm } }
const CHAVE_SESSAO   = 'usuarioLogado';  // { nome, email }
const CHAVE_TOKEN    = 'token';          // a roleta (index.html) usa esta chave em estaLogado()

const lerUsuarios = () => { try { return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || {}; } catch (e) { return {}; } };
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(e);

async function hashSenha(s) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'plain:' + s; // fallback quando o navegador não libera crypto (ex.: file://)
}

function formatarDoisPrimeirosNomes(texto) {
  return texto.trim().replace(/\s+/g, ' ').split(' ').slice(0, 2)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

// Cadastro: salva o usuário. Retorna { ok, message }
async function salvarUsuarioLocal(email, senha, nome) {
  try {
    const usuarios = lerUsuarios();
    if (usuarios[email]) return { ok: false, message: 'Este e-mail já está cadastrado. Tente entrar.' };
    usuarios[email] = { nome, senha: await hashSenha(senha), criadoEm: Date.now() };
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: 'Não foi possível salvar no navegador. Verifique se o armazenamento está liberado.' };
  }
}

// Login: confere e-mail/senha e cria a sessão. Retorna { ok, nome, message }
async function autenticarUsuario(email, senha) {
  try {
    const u = lerUsuarios()[email];
    if (!u || u.senha !== await hashSenha(senha)) return { ok: false, message: 'E-mail ou senha incorretos.' };
    const token = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ nome: u.nome, email }));
    return { ok: true, nome: u.nome };
  } catch (e) {
    return { ok: false, message: 'Não foi possível acessar o armazenamento do navegador.' };
  }
}

function sair() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_SESSAO);
}

// Notificação do navegador. Chame pedirPermissaoNotificacao() direto no clique/submit.
function pedirPermissaoNotificacao() {
  if (!('Notification' in window)) return Promise.resolve('unsupported');
  if (Notification.permission !== 'default') return Promise.resolve(Notification.permission);
  return Notification.requestPermission().catch(() => 'denied');
}
function notificarBoasVindas(nome) {
  const texto = `Bem-vindo ${nome}`;
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('Roleta de Prêmios', { body: texto }); } catch (e) {}
  }
  return texto;
}

// ===== Helpers de interface =====
function mostrarMsg(id, texto, tipo = 'erro') {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.classList.remove('erro', 'sucesso');
  el.classList.add('show', tipo);
}
function alternarSenha(id, botao) {
  const input = document.getElementById(id);
  const visivel = input.type === 'text';
  input.type = visivel ? 'password' : 'text';
  botao.classList.toggle('on', !visivel);
}
function checarForca(valor) {
  let p = 0;
  if (valor.length >= 6) p++;
  if (valor.length >= 10) p++;
  if (/[A-Z]/.test(valor) && /[0-9]/.test(valor)) p++;
  if (/[^A-Za-z0-9]/.test(valor)) p++;
  const n = [['0%', '#5f5a70'], ['30%', '#f0709a'], ['55%', '#e0a35c'], ['80%', '#a78bfa'], ['100%', '#8b5cf6']][Math.min(p, 4)];
  const f = document.getElementById('strength-fill');
  f.style.width = n[0]; f.style.background = n[1];
}
const OLHO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';