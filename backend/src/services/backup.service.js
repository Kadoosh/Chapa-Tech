import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.dbPath = path.join(__dirname, '../../prisma/dev.db');
    this.config = this.loadConfig();
    this.cronJob = null;
    
    // Criar diretório de backups se não existir
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Carregar configuração
  loadConfig() {
    const configPath = path.join(__dirname, '../../config/backup.json');
    
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (err) {
      console.error('Erro ao carregar config backup:', err);
    }

    return {
      habilitado: true,
      intervalo: 'diario', // diario, semanal, manual
      horario: '03:00',
      retencaoDias: 30,
      ultimoBackup: null,
    };
  }

  // Salvar configuração
  saveConfig(config) {
    const configPath = path.join(__dirname, '../../config/backup.json');
    const dir = path.dirname(configPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.config = config;
    
    // Reconfigurar cron se necessário
    this.configurarCron();
    
    return config;
  }

  // Obter configuração
  getConfig() {
    return this.config;
  }

  // Criar backup
  async criarBackup(tipo = 'manual') {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const nomeArquivo = `backup_${tipo}_${timestamp}.zip`;
      const caminhoBackup = path.join(this.backupDir, nomeArquivo);

      // Verificar se o banco existe
      if (!fs.existsSync(this.dbPath)) {
        reject(new Error('Banco de dados não encontrado'));
        return;
      }

      // Criar arquivo ZIP
      const output = fs.createWriteStream(caminhoBackup);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        const tamanho = archive.pointer();
        
        // Atualizar último backup
        this.config.ultimoBackup = new Date().toISOString();
        this.saveConfig(this.config);

        // Log
        console.log(`Backup criado: ${nomeArquivo} (${this.formatarTamanho(tamanho)})`);

        resolve({
          sucesso: true,
          arquivo: nomeArquivo,
          caminho: caminhoBackup,
          tamanho,
          tamanhoFormatado: this.formatarTamanho(tamanho),
          criadoEm: new Date().toISOString(),
          tipo,
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Adicionar banco de dados ao ZIP
      archive.file(this.dbPath, { name: 'dev.db' });

      // Adicionar configs se existirem
      const configDir = path.join(__dirname, '../../config');
      if (fs.existsSync(configDir)) {
        archive.directory(configDir, 'config');
      }

      archive.finalize();
    });
  }

  // Listar backups
  listarBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const arquivos = fs.readdirSync(this.backupDir)
      .filter(f => f.endsWith('.zip'))
      .map(arquivo => {
        const caminho = path.join(this.backupDir, arquivo);
        const stats = fs.statSync(caminho);
        
        // Extrair tipo e data do nome
        const match = arquivo.match(/backup_(\w+)_(.+)\.zip/);
        
        return {
          arquivo,
          caminho,
          tamanho: stats.size,
          tamanhoFormatado: this.formatarTamanho(stats.size),
          criadoEm: stats.birthtime.toISOString(),
          tipo: match ? match[1] : 'desconhecido',
        };
      })
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    return arquivos;
  }

  // Deletar backup
  deletarBackup(nomeArquivo) {
    const caminho = path.join(this.backupDir, nomeArquivo);
    
    if (!fs.existsSync(caminho)) {
      throw new Error('Backup não encontrado');
    }

    fs.unlinkSync(caminho);
    return { sucesso: true, mensagem: 'Backup deletado com sucesso' };
  }

  // Restaurar backup
  async restaurarBackup(nomeArquivo) {
    const caminho = path.join(this.backupDir, nomeArquivo);
    
    if (!fs.existsSync(caminho)) {
      throw new Error('Backup não encontrado');
    }

    // Por segurança, criar backup antes de restaurar
    await this.criarBackup('pre-restauracao');

    // Nota: A restauração real requer extract-zip e reinício do servidor
    // Por enquanto, retornamos instruções
    return {
      sucesso: true,
      mensagem: 'Para restaurar, pare o servidor, extraia o ZIP e substitua o dev.db',
      arquivo: nomeArquivo,
    };
  }

  // Limpar backups antigos
  limparBackupsAntigos() {
    const diasRetencao = this.config.retencaoDias || 30;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasRetencao);

    const backups = this.listarBackups();
    let removidos = 0;

    backups.forEach(backup => {
      const dataBackup = new Date(backup.criadoEm);
      if (dataBackup < dataLimite && backup.tipo !== 'pre-restauracao') {
        try {
          fs.unlinkSync(backup.caminho);
          removidos++;
          console.log(`Backup antigo removido: ${backup.arquivo}`);
        } catch (err) {
          console.error(`Erro ao remover backup: ${err.message}`);
        }
      }
    });

    return { removidos };
  }

  // Configurar cron job
  configurarCron() {
    // Cancelar job anterior
    if (this.cronJob) {
      this.cronJob.stop();
    }

    if (!this.config.habilitado || this.config.intervalo === 'manual') {
      return;
    }

    let cronExpression;
    const [hora, minuto] = (this.config.horario || '03:00').split(':');

    switch (this.config.intervalo) {
      case 'diario':
        cronExpression = `${minuto} ${hora} * * *`;
        break;
      case 'semanal':
        cronExpression = `${minuto} ${hora} * * 0`; // Domingo
        break;
      default:
        return;
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('Executando backup automático...');
      try {
        await this.criarBackup('automatico');
        this.limparBackupsAntigos();
      } catch (err) {
        console.error('Erro no backup automático:', err);
      }
    });

    console.log(`Backup automático configurado: ${this.config.intervalo} às ${this.config.horario}`);
  }

  // Iniciar serviço
  iniciar() {
    this.configurarCron();
    console.log('Serviço de backup iniciado');
  }

  // Helper para formatar tamanho
  formatarTamanho(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new BackupService();
