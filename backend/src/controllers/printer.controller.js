import printerService from '../services/printer.service.js';
import pedidoService from '../services/pedido.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Obter configuração das impressoras
export const obterConfig = asyncHandler(async (req, res) => {
  await printerService.ensureConfigLoaded();
  const config = printerService.getConfig();
  res.json(config);
});

// Atualizar configuração das impressoras
export const atualizarConfig = asyncHandler(async (req, res) => {
  const config = await printerService.saveConfig(req.body);
  res.json({
    mensagem: 'Configuração salva com sucesso',
    config,
  });
});

// Testar conexão com impressora de uma área específica
export const testarConexao = asyncHandler(async (req, res) => {
  await printerService.ensureConfigLoaded();
  const { area } = req.query; // ?area=cozinha ou ?area=caixa
  const resultado = await printerService.testarConexao(area || 'cozinha');
  res.json(resultado);
});

// Imprimir pedido (vai para COZINHA)
export const imprimirPedido = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;

  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }

  await printerService.ensureConfigLoaded();
  const resultado = await printerService.imprimirPedido(pedido);
  res.json(resultado);
});

// Imprimir comprovante (vai para CAIXA)
export const imprimirComprovante = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;

  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }

  await printerService.ensureConfigLoaded();
  const resultado = await printerService.imprimirComprovante(pedido);
  res.json(resultado);
});

// Preview de impressão (retorna texto formatado)
export const previewPedido = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;

  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }

  const texto = printerService.formatarPedido(pedido);
  res.json({ texto });
});

export const previewComprovante = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;

  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }

  const texto = printerService.formatarComprovante(pedido);
  res.json({ texto });
});

// Imprimir página de teste em uma área específica
export const imprimirTeste = asyncHandler(async (req, res) => {
  await printerService.ensureConfigLoaded();
  const { area } = req.query; // ?area=cozinha ou ?area=caixa
  const resultado = await printerService.imprimirTeste(area || 'cozinha');
  res.json(resultado);
});
