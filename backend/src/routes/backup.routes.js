import express from 'express';
import { body } from 'express-validator';
import { validarErros } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import * as backupController from '../controllers/backup.controller.js';

const router = express.Router();

// Middleware: requer autenticação e permissão de admin
const requireAdmin = [
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS])
];

// Obter configuração
router.get(
  '/config',
  ...requireAdmin,
  backupController.obterConfig
);

// Atualizar configuração
router.put(
  '/config',
  ...requireAdmin,
  [
    body('habilitado').optional().isBoolean(),
    body('intervalo').optional().isIn(['diario', 'semanal', 'manual']),
    body('horario').optional().matches(/^\d{2}:\d{2}$/),
    body('retencaoDias').optional().isInt({ min: 1, max: 365 }),
    validarErros
  ],
  backupController.atualizarConfig
);

// Criar backup manual
router.post(
  '/criar',
  ...requireAdmin,
  backupController.criarBackup
);

// Listar backups
router.get(
  '/listar',
  ...requireAdmin,
  backupController.listarBackups
);

// Download backup
router.get(
  '/download/:arquivo',
  ...requireAdmin,
  backupController.downloadBackup
);

// Deletar backup
router.delete(
  '/:arquivo',
  ...requireAdmin,
  backupController.deletarBackup
);

// Restaurar backup
router.post(
  '/restaurar/:arquivo',
  ...requireAdmin,
  backupController.restaurarBackup
);

// Limpar backups antigos
router.post(
  '/limpar',
  ...requireAdmin,
  backupController.limparBackups
);

export default router;
