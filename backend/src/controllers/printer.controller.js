import printerService from '../services/printer.service.js';
import pedidoService from '../services/pedido.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Obter configuração da impressora
export const obterConfig = asyncHandler(async (req, res) => {
  const config = printerService.getConfig();
  res.json(config);
});

// Atualizar configuração da impressora
export const atualizarConfig = asyncHandler(async (req, res) => {
  const config = printerService.saveConfig(req.body);
  res.json({
    mensagem: 'Configuração salva com sucesso',
    config,
  });
});

// Testar conexão com impressora
export const testarConexao = asyncHandler(async (req, res) => {
  const resultado = await printerService.testarConexao();
  res.json(resultado);
});

// Imprimir pedido
export const imprimirPedido = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;
  
  // Buscar pedido completo
  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));
  
  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }
  
  const resultado = await printerService.imprimirPedido(pedido);
  res.json(resultado);
});

// Imprimir comprovante
export const imprimirComprovante = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;
  
  // Buscar pedido completo
  const pedido = await pedidoService.buscarPorId(parseInt(pedidoId));
  
  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado' });
  }
  
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
