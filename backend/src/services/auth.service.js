import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service de autenticação
 */
class AuthService {
  /**
   * Realiza login do usuário
   * @param {string} login - Login do usuário (email)
   * @param {string} senha - Senha do usuário
   * @returns {Promise<{usuario: Object, token: string}>}
   */
  async login(login, senha) {
    // Buscar usuário por login (email)
    const usuario = await prisma.usuario.findUnique({
      where: { email: login },
      include: {
        grupo: {
          include: {
            permissoes: {
              include: {
                permissao: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('Login ou senha inválidos', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador.', 401);
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Gerar token
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      grupoId: usuario.grupoId,
    });

    // Formatar permissões
    const permissoes = usuario.grupo.permissoes.map(p => ({
      id: p.permissao.id,
      chave: p.permissao.chave,
      nome: p.permissao.nome,
      modulo: p.permissao.modulo,
    }));

    // Remover senha do objeto retornado
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      usuario: {
        ...usuarioSemSenha,
        grupo: {
          ...usuario.grupo,
          permissoes,
        },
      },
      token,
    };
  }

  /**
   * Busca dados do usuário autenticado
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise<Object>}
   */
  async me(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        grupo: {
          include: {
            permissoes: {
              include: {
                permissao: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Formatar permissões
    const permissoes = usuario.grupo.permissoes.map(p => ({
      id: p.permissao.id,
      chave: p.permissao.chave,
      nome: p.permissao.nome,
      modulo: p.permissao.modulo,
    }));

    // Remover senha
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      ...usuarioSemSenha,
      grupo: {
        ...usuario.grupo,
        permissoes,
      },
    };
  }

  /**
   * Atualiza senha do usuário
   * @param {number} usuarioId - ID do usuário
   * @param {string} senhaAtual - Senha atual
   * @param {string} novaSenha - Nova senha
   */
  async alterarSenha(usuarioId, senhaAtual, novaSenha) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw new AppError('Senha atual incorreta', 400);
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: novaSenhaHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Registra novo usuário (apenas admin pode fazer)
   * @param {Object} dados - Dados do usuário
   */
  async registrar(dados) {
    const { nome, sobrenome, email, senha, telefone, grupoId } = dados;

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Verificar se grupo existe
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: grupoId },
    });

    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        sobrenome,
        email,
        senha: senhaHash,
        telefone,
        grupoId,
      },
      include: {
        grupo: true,
      },
    });

    // Remover senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  }
}

export default new AuthService();
