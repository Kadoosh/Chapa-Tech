import { Router } from 'express';
import { listar, criar, atualizar, remover } from '../controllers/acompanhamento.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin ou gerente
// Ajuste as permissões conforme necessário
router.use(authenticate);

router.get('/', listar);
router.post('/', requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS), criar);
router.put('/:id', requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS), atualizar);
router.delete('/:id', requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS), remover);

export default router;
