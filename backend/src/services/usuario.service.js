import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';

class UsuarioService {
  // ============================================
  // USUÁRIOS
  // ============================================
  
  async listarUsuarios({ busca, grupoId, ativo, page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } }
      ];
    }
    
    if (grupoId) {
      where.grupoId = parseInt(grupoId);
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true' || ativo === true;
    }
    
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          grupo: {
            include: {
              permissoes: {
                include: {
                  permissao: true
                }
              }
            }
          }
        },
        orderBy: { nome: 'asc' },
        skip,
        take: limit
      }),
      prisma.usuario.count({ where })
    ]);
    
    // Remove senha da resposta
    const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);
    
    return {
      usuarios: usuariosSemSenha,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async buscarUsuarioPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        grupo: {
          include: {
            permissoes: {
              include: {
                permissao: true
              }
            }
          }
        }
      }
    });
    
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }
    
    // Remove senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
  
  async criarUsuario(data) {
    // Verifica se grupo existe
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: data.grupoId }
    });
    
    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);
    
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        senha: senhaHash
      },
      include: {
        grupo: {
          include: {
            permissoes: {
              include: {
                permissao: true
              }
            }
          }
        }
      }
    });
    
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
  
  async atualizarUsuario(id, data) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!usuarioExistente) {
      throw new AppError('Usuário não encontrado', 404);
    }
    
    // Se estiver alterando grupo, verifica se existe
    if (data.grupoId) {
      const grupo = await prisma.grupoUsuario.findUnique({
        where: { id: data.grupoId }
      });
      
      if (!grupo) {
        throw new AppError('Grupo não encontrado', 404);
      }
    }
    
    // Se estiver alterando senha, faz hash
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      include: {
        grupo: {
          include: {
            permissoes: {
              include: {
                permissao: true
              }
            }
          }
        }
      }
    });
    
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
  
  async deletarUsuario(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }
    
    // Não permite deletar o próprio usuário
    // (isso seria verificado no controller com req.user.id)
    
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Usuário deletado com sucesso' };
  }
  
  async alternarStatusUsuario(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }
    
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { ativo: !usuario.ativo },
      include: {
        grupo: true
      }
    });
    
    const { senha, ...usuarioSemSenha } = usuarioAtualizado;
    return usuarioSemSenha;
  }
  
  // ============================================
  // GRUPOS
  // ============================================
  
  async listarGrupos({ ativo } = {}) {
    const where = {};
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true' || ativo === true;
    }
    
    return prisma.grupoUsuario.findMany({
      where,
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        },
        _count: {
          select: { usuarios: true }
        }
      },
      orderBy: { nome: 'asc' }
    });
  }
  
  async buscarGrupoPorId(id) {
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        },
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true
          }
        }
      }
    });
    
    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }
    
    return grupo;
  }
  
  async criarGrupo(data) {
    const grupoExistente = await prisma.grupoUsuario.findUnique({
      where: { nome: data.nome }
    });
    
    if (grupoExistente) {
      throw new AppError('Grupo com esse nome já existe', 400);
    }
    
    return prisma.grupoUsuario.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        ativo: data.ativo ?? true
      },
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        }
      }
    });
  }
  
  async atualizarGrupo(id, data) {
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }
    
    if (data.nome && data.nome !== grupo.nome) {
      const nomeEmUso = await prisma.grupoUsuario.findUnique({
        where: { nome: data.nome }
      });
      
      if (nomeEmUso) {
        throw new AppError('Grupo com esse nome já existe', 400);
      }
    }
    
    return prisma.grupoUsuario.update({
      where: { id: parseInt(id) },
      data,
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        }
      }
    });
  }
  
  async deletarGrupo(id) {
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { usuarios: true }
        }
      }
    });
    
    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }
    
    if (grupo._count.usuarios > 0) {
      throw new AppError('Não é possível deletar grupo com usuários vinculados', 400);
    }
    
    await prisma.grupoUsuario.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Grupo deletado com sucesso' };
  }
  
  async vincularPermissoes(grupoId, permissoesIds) {
    const grupo = await prisma.grupoUsuario.findUnique({
      where: { id: parseInt(grupoId) }
    });
    
    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }
    
    // Remove todas as permissões atuais
    await prisma.permissaoGrupo.deleteMany({
      where: { grupoId: parseInt(grupoId) }
    });
    
    // Adiciona as novas permissões
    const permissoes = permissoesIds.map(permissaoId => ({
      grupoId: parseInt(grupoId),
      permissaoId: parseInt(permissaoId)
    }));
    
    await prisma.permissaoGrupo.createMany({
      data: permissoes
    });
    
    return this.buscarGrupoPorId(grupoId);
  }
  
  // ============================================
  // PERMISSÕES
  // ============================================
  
  async listarPermissoes({ modulo } = {}) {
    const where = {};
    
    if (modulo) {
      where.modulo = modulo;
    }
    
    return prisma.permissao.findMany({
      where,
      orderBy: [
        { modulo: 'asc' },
        { nome: 'asc' }
      ]
    });
  }
  
  async listarModulos() {
    const permissoes = await prisma.permissao.findMany({
      select: { modulo: true },
      distinct: ['modulo']
    });
    
    return permissoes.map(p => p.modulo);
  }
}

export default new UsuarioService();
