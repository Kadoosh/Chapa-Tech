import backupService from '../services/backup.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Obter configuração de backup
export const obterConfig = asyncHandler(async (req, res) => {
  const config = backupService.getConfig();
  res.json(config);
});

// Atualizar configuração de backup
export const atualizarConfig = asyncHandler(async (req, res) => {
  const config = backupService.saveConfig(req.body);
  res.json({
    mensagem: 'Configuração salva com sucesso',
    config,
  });
});

// Criar backup manual
export const criarBackup = asyncHandler(async (req, res) => {
  const resultado = await backupService.criarBackup('manual');
  res.json(resultado);
});

// Listar backups
export const listarBackups = asyncHandler(async (req, res) => {
  const backups = backupService.listarBackups();
  res.json({
    total: backups.length,
    backups,
  });
});

// Deletar backup
export const deletarBackup = asyncHandler(async (req, res) => {
  const { arquivo } = req.params;
  const resultado = backupService.deletarBackup(arquivo);
  res.json(resultado);
});

// Restaurar backup
export const restaurarBackup = asyncHandler(async (req, res) => {
  const { arquivo } = req.params;
  const resultado = await backupService.restaurarBackup(arquivo);
  res.json(resultado);
});

// Limpar backups antigos
export const limparBackups = asyncHandler(async (req, res) => {
  const resultado = backupService.limparBackupsAntigos();
  res.json({
    mensagem: `${resultado.removidos} backup(s) antigo(s) removido(s)`,
    ...resultado,
  });
});

// Download de backup
export const downloadBackup = asyncHandler(async (req, res) => {
  const { arquivo } = req.params;
  const backups = backupService.listarBackups();
  const backup = backups.find(b => b.arquivo === arquivo);
  
  if (!backup) {
    return res.status(404).json({ erro: 'Backup não encontrado' });
  }
  
  res.download(backup.caminho, backup.arquivo);
});
