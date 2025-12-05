import usuarioService from '../services/usuario.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ============================================
// USUÁRIOS
// ============================================

export const listarUsuarios = asyncHandler(async (req, res) => {
  const { busca, grupoId, ativo, page, limit } = req.query;
  const resultado = await usuarioService.listarUsuarios({ busca, grupoId, ativo, page, limit });
  res.json(resultado);
});

export const buscarUsuario = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.buscarUsuarioPorId(req.params.id);
  res.json(usuario);
});

export const criarUsuario = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.criarUsuario(req.body);
  res.status(201).json(usuario);
});

export const atualizarUsuario = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.atualizarUsuario(req.params.id, req.body);
  res.json(usuario);
});

export const deletarUsuario = asyncHandler(async (req, res) => {
  // Impede que o usuário delete a si mesmo
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário' });
  }
  
  const resultado = await usuarioService.deletarUsuario(req.params.id);
  res.json(resultado);
});

export const alternarStatusUsuario = asyncHandler(async (req, res) => {
  // Impede que o usuário desative a si mesmo
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
  }
  
  const usuario = await usuarioService.alternarStatusUsuario(req.params.id);
  res.json(usuario);
});

// ============================================
// GRUPOS
// ============================================

export const listarGrupos = asyncHandler(async (req, res) => {
  const { ativo } = req.query;
  const grupos = await usuarioService.listarGrupos({ ativo });
  res.json(grupos);
});

export const buscarGrupo = asyncHandler(async (req, res) => {
  const grupo = await usuarioService.buscarGrupoPorId(req.params.id);
  res.json(grupo);
});

export const criarGrupo = asyncHandler(async (req, res) => {
  const grupo = await usuarioService.criarGrupo(req.body);
  res.status(201).json(grupo);
});

export const atualizarGrupo = asyncHandler(async (req, res) => {
  const grupo = await usuarioService.atualizarGrupo(req.params.id, req.body);
  res.json(grupo);
});

export const deletarGrupo = asyncHandler(async (req, res) => {
  const resultado = await usuarioService.deletarGrupo(req.params.id);
  res.json(resultado);
});

export const vincularPermissoes = asyncHandler(async (req, res) => {
  const grupo = await usuarioService.vincularPermissoes(req.params.id, req.body.permissoesIds);
  res.json(grupo);
});

// ============================================
// PERMISSÕES
// ============================================

export const listarPermissoes = asyncHandler(async (req, res) => {
  const { modulo } = req.query;
  const permissoes = await usuarioService.listarPermissoes({ modulo });
  res.json(permissoes);
});

export const listarModulos = asyncHandler(async (req, res) => {
  const modulos = await usuarioService.listarModulos();
  res.json(modulos);
});
