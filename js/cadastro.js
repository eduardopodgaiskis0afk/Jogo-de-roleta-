const USUARIOS_KEY = 'usuarios-site';
const AUTH_KEY = 'authToken';

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function obterUsuarios() {
  try {
    const valor = window.localStorage.getItem(USUARIOS_KEY);
    if (!valor) return [];
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch (erro) {
    console.error('Não foi possível ler os usuários do localStorage:', erro);
    alert('Seu navegador está bloqueando o armazenamento local (localStorage). ' +
          'Abra o site por um servidor local (http://) em vez de abrir o arquivo direto, ' +
          'ou desative o modo de navegação privada/sandbox.');
    return [];
  }
}

function salvarUsuarios(usuarios) {
  try {
    window.localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  } catch (erro) {
    console.error('Não foi possível salvar os usuários no localStorage:', erro);
    alert('Não foi possível salvar seu cadastro: o armazenamento local está bloqueado neste navegador/ambiente.');
    return false;
  }
}

function usuarioExiste(email) {
  const usuarios = obterUsuarios();
  return usuarios.some((usuario) => usuario.email === normalizarEmail(email));
}

function salvarUsuarioLocal(email, senha) {
  const usuarios = obterUsuarios();
  const emailNormalizado = normalizarEmail(email);

  if (usuarios.some((usuario) => usuario.email === emailNormalizado)) {
    return { ok: false, message: 'Este e-mail já está cadastrado.' };
  }

  usuarios.push({ email: emailNormalizado, senha });
  const salvou = salvarUsuarios(usuarios);

  if (!salvou) {
    return { ok: false, message: 'Falha ao salvar o cadastro (armazenamento local indisponível).' };
  }

  return { ok: true, message: 'Cadastro realizado com sucesso.' };
}

function validarLoginLocal(email, senha) {
  const usuarios = obterUsuarios();
  return usuarios.find(
    (usuario) => usuario.email === normalizarEmail(email) && usuario.senha === senha
  );
}

function enviarLogin(e) {
  e.preventDefault();

  const email = normalizarEmail(document.getElementById('email-entrar').value);
  const password = document.getElementById('senha-entrar').value;

  mostrarMsg('msg-entrar', 'Autenticando...');

  const usuario = validarLoginLocal(email, password);

  if (usuario) {
    try {
      window.localStorage.setItem(AUTH_KEY, btoa(`${email}:${Date.now()}`));
    } catch (erro) {
      console.error('Não foi possível salvar o token de autenticação:', erro);
    }

    mostrarMsg('msg-entrar', 'Login realizado com sucesso! Redirecionando...');

    setTimeout(() => {
      window.location.href = 'roleta.html';
    }, 1500);
  } else {
    mostrarMsg(
      'msg-entrar',
      'E-mail ou senha inválidos. Caso não tenha cadastro, realize o registro primeiro.'
    );
  }

  return false;
}