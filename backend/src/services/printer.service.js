import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PrinterService {
  constructor() {
    this.config = this.loadConfig();
  }

  // Carregar configuração da impressora
  loadConfig() {
    const configPath = path.join(__dirname, '../../config/printer.json');
    
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (err) {
      console.error('Erro ao carregar config impressora:', err);
    }

    // Configuração padrão
    return {
      habilitada: false,
      tipo: 'EPSON',
      interface: 'network',
      endereco: '192.168.1.100',
      porta: 9100,
      larguraPapel: 48,
      autoImprimirPedido: false,
      autoImprimirComprovante: false,
    };
  }

  // Salvar configuração
  saveConfig(config) {
    const configPath = path.join(__dirname, '../../config/printer.json');
    const dir = path.dirname(configPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.config = config;
    return config;
  }

  // Obter configuração
  getConfig() {
    return this.config;
  }

  // Gerar texto formatado para pedido (simulação ESC/POS)
  formatarPedido(pedido) {
    const linhas = [];
    const largura = this.config.larguraPapel || 48;
    const separador = '='.repeat(largura);
    const separadorLeve = '-'.repeat(largura);

    // Cabeçalho
    linhas.push(this.centralizar('SISTEMA LANCHONETE', largura));
    linhas.push(this.centralizar('PEDIDO DE COZINHA', largura));
    linhas.push(separador);
    
    // Info do pedido
    linhas.push(`Pedido #${pedido.id}`);
    linhas.push(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
    linhas.push(`Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}`);
    
    if (pedido.cliente) {
      linhas.push(`Cliente: ${pedido.cliente.nome}`);
    }
    
    linhas.push(separadorLeve);
    
    // Itens
    linhas.push(this.centralizar('ITENS DO PEDIDO', largura));
    linhas.push(separadorLeve);
    
    pedido.itens?.forEach((item, index) => {
      linhas.push(`${index + 1}. ${item.produto?.nome || 'Produto'}`);
      linhas.push(`   Qtd: ${item.quantidade}x`);
      
      if (item.observacao) {
        linhas.push(`   OBS: ${item.observacao}`);
      }
      linhas.push('');
    });
    
    linhas.push(separador);
    
    // Observações gerais
    if (pedido.observacao) {
      linhas.push('OBSERVACOES:');
      linhas.push(pedido.observacao);
      linhas.push(separador);
    }
    
    // Rodapé
    linhas.push(this.centralizar('*** FIM DO PEDIDO ***', largura));
    linhas.push('');
    linhas.push('');
    linhas.push('');

    return linhas.join('\n');
  }

  // Gerar texto formatado para comprovante
  formatarComprovante(pedido) {
    const linhas = [];
    const largura = this.config.larguraPapel || 48;
    const separador = '='.repeat(largura);
    const separadorLeve = '-'.repeat(largura);

    // Cabeçalho
    linhas.push(this.centralizar('SISTEMA LANCHONETE', largura));
    linhas.push(this.centralizar('COMPROVANTE DE PAGAMENTO', largura));
    linhas.push(separador);
    
    // Info
    linhas.push(`Pedido #${pedido.id}`);
    linhas.push(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
    linhas.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
    
    if (pedido.cliente) {
      linhas.push(`Cliente: ${pedido.cliente.nome}`);
    }
    
    linhas.push(separadorLeve);
    
    // Itens
    pedido.itens?.forEach((item) => {
      const nome = (item.produto?.nome || 'Produto').substring(0, 25);
      const qtd = item.quantidade;
      const valor = (item.subtotal || 0).toFixed(2);
      linhas.push(`${qtd}x ${nome}`);
      linhas.push(`${' '.repeat(largura - valor.length - 3)}R$ ${valor}`);
    });
    
    linhas.push(separadorLeve);
    
    // Total
    const total = (pedido.total || 0).toFixed(2);
    linhas.push(`TOTAL:${' '.repeat(largura - total.length - 9)}R$ ${total}`);
    
    // Forma de pagamento
    if (pedido.formaPagamento) {
      linhas.push(`Pagamento: ${pedido.formaPagamento}`);
    }
    
    linhas.push(separador);
    linhas.push(this.centralizar('OBRIGADO PELA PREFERENCIA!', largura));
    linhas.push(this.centralizar('Volte sempre!', largura));
    linhas.push('');
    linhas.push('');
    linhas.push('');

    return linhas.join('\n');
  }

  // Helper para centralizar texto
  centralizar(texto, largura) {
    const espacos = Math.max(0, Math.floor((largura - texto.length) / 2));
    return ' '.repeat(espacos) + texto;
  }

  // Simular impressão (retorna o texto formatado)
  async imprimirPedido(pedido) {
    if (!this.config.habilitada) {
      console.log('Impressora desabilitada - simulando impressão');
    }
    
    const texto = this.formatarPedido(pedido);
    console.log('\n--- IMPRESSAO PEDIDO ---\n');
    console.log(texto);
    console.log('--- FIM IMPRESSAO ---\n');
    
    return {
      sucesso: true,
      texto,
      simulado: !this.config.habilitada,
    };
  }

  // Simular impressão de comprovante
  async imprimirComprovante(pedido) {
    if (!this.config.habilitada) {
      console.log('Impressora desabilitada - simulando impressão');
    }
    
    const texto = this.formatarComprovante(pedido);
    console.log('\n--- IMPRESSAO COMPROVANTE ---\n');
    console.log(texto);
    console.log('--- FIM IMPRESSAO ---\n');
    
    return {
      sucesso: true,
      texto,
      simulado: !this.config.habilitada,
    };
  }

  // Testar conexão com impressora
  async testarConexao() {
    // Simulação de teste
    return {
      sucesso: true,
      mensagem: this.config.habilitada 
        ? 'Conexão simulada com sucesso' 
        : 'Impressora desabilitada',
      config: this.config,
    };
  }
}

export default new PrinterService();
