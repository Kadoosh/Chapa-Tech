import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import configService from './config.service.js';

class PrinterService {
  constructor() {
    this.config = null;
    this.printers = {}; // { cozinha: ThermalPrinter, caixa: ThermalPrinter }
    this.configLoaded = false;
  }

  // Carregar configuração das impressoras do banco de dados
  async loadConfig() {
    if (this.configLoaded && this.config) {
      return this.config;
    }

    try {
      this.config = await configService.getPrinterConfig();
      this.configLoaded = true;
      return this.config;
    } catch (err) {
      console.error('Erro ao carregar config impressora:', err);
      return this.getDefaultConfig();
    }
  }

  // Configuração padrão
  getDefaultConfig() {
    return {
      cozinha: {
        habilitada: false,
        nome: 'Impressora Cozinha',
        tipo: 'EPSON',
        interface: 'network',
        endereco: '192.168.1.100',
        porta: 9100,
        larguraPapel: 48,
        autoImprimir: false,
        tamanhoFonte: 'normal',
        usarNegrito: true,
        imprimirData: true,
        imprimirCliente: true,
        cortarPapel: true,
      },
      caixa: {
        habilitada: false,
        nome: 'Impressora Caixa',
        tipo: 'EPSON',
        interface: 'network',
        endereco: '192.168.1.101',
        porta: 9100,
        larguraPapel: 48,
        autoImprimir: false,
        tamanhoFonte: 'normal',
        usarNegrito: true,
        imprimirData: true,
        imprimirCliente: true,
        cortarPapel: true,
      },
    };
  }

  // Salvar configuração no banco de dados
  async saveConfig(config) {
    try {
      await configService.savePrinterConfig(config);
      this.config = config;

      // Reinicializar printers com nova config
      this.printers = {};

      return config;
    } catch (err) {
      console.error('Erro ao salvar config impressora:', err);
      throw err;
    }
  }

  // Obter configuração (assíncrono agora)
  getConfig() {
    // Retornar config em cache ou padrão
    return this.config || this.getDefaultConfig();
  }

  // Garantir que config está carregada
  async ensureConfigLoaded() {
    if (!this.configLoaded) {
      await this.loadConfig();
    }
    return this.config;
  }

  // Inicializar conexão com uma impressora específica
  async inicializarPrinter(area) {
    await this.ensureConfigLoaded();
    const areaConfig = this.config[area];

    if (!areaConfig || !areaConfig.habilitada) {
      return null;
    }

    try {
      // Mapear tipo da impressora
      const tipoMap = {
        'EPSON': PrinterTypes.EPSON,
        'STAR': PrinterTypes.STAR,
        'TANCA': PrinterTypes.EPSON,
        'BEMATECH': PrinterTypes.EPSON,
      };

      const tipo = tipoMap[areaConfig.tipo] || PrinterTypes.EPSON;

      // Configurar interface
      let interfaceConfig;
      if (areaConfig.interface === 'network') {
        interfaceConfig = `tcp://${areaConfig.endereco}:${areaConfig.porta || 9100}`;
      } else if (areaConfig.interface === 'usb') {
        interfaceConfig = areaConfig.endereco;
      } else {
        interfaceConfig = areaConfig.endereco;
      }

      const printer = new ThermalPrinter({
        type: tipo,
        interface: interfaceConfig,
        characterSet: 'PC860_PORTUGUESE',
        removeSpecialCharacters: false,
        lineCharacter: '-',
        width: areaConfig.larguraPapel || 48,
      });

      this.printers[area] = printer;
      return printer;
    } catch (error) {
      console.error(`Erro ao inicializar impressora ${area}:`, error);
      this.printers[area] = null;
      return null;
    }
  }

  // Obter instância do printer por área (lazy loading)
  async getPrinter(area) {
    await this.ensureConfigLoaded();
    if (!this.printers[area] && this.config[area]?.habilitada) {
      await this.inicializarPrinter(area);
    }
    return this.printers[area];
  }

  // Helper para centralizar texto
  centralizar(texto, largura) {
    const espacos = Math.max(0, Math.floor((largura - texto.length) / 2));
    return ' '.repeat(espacos) + texto;
  }

  // Gerar texto formatado para pedido
  formatarPedido(pedido) {
    const largura = this.config.cozinha?.larguraPapel || 48;
    const linhas = [];
    const separador = '='.repeat(largura);
    const separadorLeve = '-'.repeat(largura);

    linhas.push(this.centralizar('SISTEMA LANCHONETE', largura));
    linhas.push(this.centralizar('PEDIDO DE COZINHA', largura));
    linhas.push(separador);
    linhas.push(`Pedido #${pedido.id}`);
    linhas.push(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
    linhas.push(`Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}`);

    if (pedido.cliente) {
      linhas.push(`Cliente: ${pedido.cliente.nome}`);
    }

    linhas.push(separadorLeve);
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

    if (pedido.observacao) {
      linhas.push('OBSERVACOES:');
      linhas.push(pedido.observacao);
      linhas.push(separador);
    }

    linhas.push(this.centralizar('*** FIM DO PEDIDO ***', largura));
    linhas.push('');
    linhas.push('');

    return linhas.join('\n');
  }

  // Gerar texto formatado para comprovante
  formatarComprovante(pedido) {
    const largura = this.config.caixa?.larguraPapel || 48;
    const linhas = [];
    const separador = '='.repeat(largura);
    const separadorLeve = '-'.repeat(largura);

    linhas.push(this.centralizar('SISTEMA LANCHONETE', largura));
    linhas.push(this.centralizar('COMPROVANTE DE PAGAMENTO', largura));
    linhas.push(separador);
    linhas.push(`Pedido #${pedido.id}`);
    linhas.push(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
    linhas.push(`Data: ${new Date().toLocaleString('pt-BR')}`);

    if (pedido.cliente) {
      linhas.push(`Cliente: ${pedido.cliente.nome}`);
    }

    linhas.push(separadorLeve);

    pedido.itens?.forEach((item) => {
      const nome = (item.produto?.nome || 'Produto').substring(0, 25);
      const qtd = item.quantidade;
      const valor = (item.subtotal || 0).toFixed(2);
      linhas.push(`${qtd}x ${nome}`);
      linhas.push(`${' '.repeat(largura - valor.length - 3)}R$ ${valor}`);
    });

    linhas.push(separadorLeve);

    const total = (pedido.total || 0).toFixed(2);
    linhas.push(`TOTAL:${' '.repeat(largura - total.length - 9)}R$ ${total}`);

    if (pedido.formaPagamento) {
      linhas.push(`Pagamento: ${pedido.formaPagamento}`);
    }

    linhas.push(separador);
    linhas.push(this.centralizar('OBRIGADO PELA PREFERENCIA!', largura));
    linhas.push(this.centralizar('Volte sempre!', largura));
    linhas.push('');
    linhas.push('');

    return linhas.join('\n');
  }

  // Imprimir pedido na COZINHA
  async imprimirPedido(pedido) {
    const area = 'cozinha';
    const textoSimulado = this.formatarPedido(pedido);
    const areaConfig = this.config[area];

    if (!areaConfig?.habilitada) {
      console.log('Impressora COZINHA desabilitada - simulando impressão');
      console.log('\n--- IMPRESSAO PEDIDO (SIMULADO) ---\n');
      console.log(textoSimulado);

      return { sucesso: true, texto: textoSimulado, simulado: true };
    }

    try {
      const printer = await this.getPrinter(area);

      if (!printer) {
        throw new Error('Não foi possível conectar à impressora da Cozinha');
      }

      // Aplicar configurações
      const cfg = areaConfig;

      printer.clear();

      // Tamanho da fonte
      if (cfg.tamanhoFonte === 'pequena') {
        printer.raw(Buffer.from([0x1B, 0x21, 0x01])); // Font B (menor)
      } else if (cfg.tamanhoFonte === 'grande') {
        printer.setTextSize(1, 1);
      }
      // 'normal' não precisa de comando especial

      // Cabeçalho
      printer.alignCenter();
      if (cfg.usarNegrito !== false) printer.bold(true);
      printer.println('SISTEMA LANCHONETE');
      printer.println('PEDIDO DE COZINHA');
      if (cfg.usarNegrito !== false) printer.bold(false);
      printer.drawLine();

      // Info do pedido - Cliente primeiro
      printer.alignLeft();

      // Debug: verificar dados do cliente
      console.log('Dados do pedido para impressão:', {
        cliente: pedido.cliente,
        observacao: pedido.observacao,
        cfg_imprimirCliente: cfg.imprimirCliente
      });

      // Cliente cadastrado
      if (cfg.imprimirCliente !== false && pedido.cliente && pedido.cliente.nome) {
        const nomeCompleto = pedido.cliente.sobrenome
          ? `${pedido.cliente.nome} ${pedido.cliente.sobrenome}`
          : pedido.cliente.nome;
        printer.println(`Cliente: ${nomeCompleto}`);
      }
      // Cliente temporário (Pedido Rápido) - nome está na observação
      else if (cfg.imprimirCliente !== false && pedido.observacao) {
        // Verificar se observação contém info do cliente
        const match = pedido.observacao.match(/Cliente:\s*([^|]+)/);
        if (match) {
          printer.println(`Cliente: ${match[1].trim()}`);
        }
      }

      printer.println(`Pedido: #${pedido.numero || pedido.id}`);

      // Mesa ou Para Viagem
      if (pedido.paraViagem) {
        if (cfg.usarNegrito !== false) printer.bold(true);
        printer.println('*** PEDIDO PARA VIAGEM ***');
        if (cfg.usarNegrito !== false) printer.bold(false);
      } else {
        printer.println(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
      }

      if (cfg.imprimirData !== false) {
        printer.println(`Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}`);
      }



      printer.drawLine();
      printer.alignCenter();
      if (cfg.usarNegrito !== false) printer.bold(true);
      printer.println('ITENS DO PEDIDO');
      if (cfg.usarNegrito !== false) printer.bold(false);
      printer.drawLine();
      printer.alignLeft();

      pedido.itens?.forEach((item, index) => {
        if (cfg.usarNegrito !== false) printer.bold(true);
        printer.println(`${index + 1}. ${item.produto?.nome || 'Produto'}`);
        if (cfg.usarNegrito !== false) printer.bold(false);
        printer.println(`   Qtd: ${item.quantidade}x`);
        if (item.observacao) {
          printer.println(`   OBS: ${item.observacao}`);
        }
        printer.newLine();
      });

      printer.drawLine();

      // Tratar observação para remover info do cliente
      let observacaoFinal = pedido.observacao;
      if (observacaoFinal) {
        // Se tiver info do cliente (Cliente: ... | obs), pegar só a obs
        if (observacaoFinal.includes('Cliente:')) {
          const partes = observacaoFinal.split('|');
          if (partes.length > 1) {
            observacaoFinal = partes.slice(1).join('|').trim();
          } else {
            // Se só tem o cliente, não mostrar nada
            observacaoFinal = '';
          }
        }
      }

      if (observacaoFinal) {
        if (cfg.usarNegrito !== false) printer.bold(true);
        printer.println('OBSERVACOES:');
        if (cfg.usarNegrito !== false) printer.bold(false);
        printer.println(observacaoFinal);
        printer.drawLine();
      }

      printer.alignCenter();
      if (cfg.usarNegrito !== false) printer.bold(true);
      printer.println('*** FIM DO PEDIDO ***');
      if (cfg.usarNegrito !== false) printer.bold(false);

      if (cfg.cortarPapel !== false) {
        printer.cut();
      } else {
        printer.newLine();
        printer.newLine();
        printer.newLine();
      }

      await printer.execute();
      console.log('Pedido impresso na COZINHA com sucesso!');

      return { sucesso: true, texto: textoSimulado, simulado: false };
    } catch (error) {
      console.error('Erro ao imprimir pedido:', error);
      return { sucesso: false, erro: error.message, texto: textoSimulado, simulado: true };
    }
  }

  // Imprimir comprovante no CAIXA
  async imprimirComprovante(pedido) {
    const area = 'caixa';
    const textoSimulado = this.formatarComprovante(pedido);
    const areaConfig = this.config[area];

    if (!areaConfig?.habilitada) {
      console.log('Impressora CAIXA desabilitada - simulando impressão');
      console.log('\n--- IMPRESSAO COMPROVANTE (SIMULADO) ---\n');
      console.log(textoSimulado);

      return { sucesso: true, texto: textoSimulado, simulado: true };
    }

    try {
      const printer = await this.getPrinter(area);

      if (!printer) {
        throw new Error('Não foi possível conectar à impressora do Caixa');
      }

      printer.clear();
      printer.alignCenter();
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println('SISTEMA LANCHONETE');
      printer.println('COMPROVANTE DE PAGAMENTO');
      printer.bold(false);
      printer.drawLine();

      printer.alignLeft();
      printer.println(`Pedido #${pedido.id}`);
      printer.println(`Mesa: ${pedido.mesa?.numero || 'N/A'}`);
      printer.println(`Data: ${new Date().toLocaleString('pt-BR')}`);

      if (pedido.cliente) {
        printer.println(`Cliente: ${pedido.cliente.nome}`);
      }

      printer.drawLine();

      pedido.itens?.forEach((item) => {
        const nome = (item.produto?.nome || 'Produto').substring(0, 25);
        const qtd = item.quantidade;
        const valor = (item.subtotal || 0).toFixed(2);
        printer.println(`${qtd}x ${nome}`);
        printer.alignRight();
        printer.println(`R$ ${valor}`);
        printer.alignLeft();
      });

      printer.drawLine();

      const total = (pedido.total || 0).toFixed(2);
      printer.bold(true);
      printer.alignRight();
      printer.println(`TOTAL: R$ ${total}`);
      printer.alignLeft();
      printer.bold(false);

      if (pedido.formaPagamento) {
        printer.println(`Pagamento: ${pedido.formaPagamento}`);
      }

      printer.drawLine();
      printer.alignCenter();
      printer.println('OBRIGADO PELA PREFERENCIA!');
      printer.println('Volte sempre!');
      printer.cut();

      await printer.execute();
      console.log('Comprovante impresso no CAIXA com sucesso!');

      return { sucesso: true, texto: textoSimulado, simulado: false };
    } catch (error) {
      console.error('Erro ao imprimir comprovante:', error);
      return { sucesso: false, erro: error.message, texto: textoSimulado, simulado: true };
    }
  }

  // Testar conexão com impressora de uma área específica
  async testarConexao(area = 'cozinha') {
    const areaConfig = this.config[area];

    if (!areaConfig) {
      return {
        sucesso: false,
        conectado: false,
        mensagem: `Área "${area}" não encontrada na configuração`,
        config: this.config,
      };
    }

    if (!areaConfig.habilitada) {
      return {
        sucesso: true,
        conectado: false,
        mensagem: `Impressora ${areaConfig.nome || area} desabilitada nas configurações`,
        config: this.config,
      };
    }

    try {
      const printer = await this.getPrinter(area);

      if (!printer) {
        throw new Error('Não foi possível inicializar a impressora');
      }

      const isConnected = await printer.isPrinterConnected();

      if (isConnected) {
        printer.clear();
        printer.alignCenter();
        printer.bold(true);
        printer.println(`=== TESTE ${area.toUpperCase()} ===`);
        printer.bold(false);
        printer.println('');
        printer.println('Sistema Lanchonete');
        printer.println(`Impressora: ${areaConfig.nome || area}`);
        printer.println('');
        printer.println(new Date().toLocaleString('pt-BR'));
        printer.drawLine();
        printer.println('Impressora OK!');
        printer.cut();

        await printer.execute();

        return {
          sucesso: true,
          conectado: true,
          mensagem: `${areaConfig.nome || area} conectada! Página de teste impressa.`,
          config: this.config,
        };
      } else {
        return {
          sucesso: false,
          conectado: false,
          mensagem: `${areaConfig.nome || area} não está respondendo.`,
          config: this.config,
        };
      }
    } catch (error) {
      console.error(`Erro ao testar conexão ${area}:`, error);

      return {
        sucesso: false,
        conectado: false,
        mensagem: `Erro ao conectar: ${error.message}`,
        config: this.config,
      };
    }
  }

  // Imprimir página de teste em uma área
  async imprimirTeste(area = 'cozinha') {
    const areaConfig = this.config[area];

    if (!areaConfig?.habilitada) {
      return {
        sucesso: false,
        mensagem: `Impressora ${areaConfig?.nome || area} desabilitada`,
      };
    }

    try {
      const printer = await this.getPrinter(area);

      if (!printer) {
        throw new Error('Não foi possível conectar à impressora');
      }

      printer.clear();
      printer.alignCenter();
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println(`TESTE ${area.toUpperCase()}`);
      printer.bold(false);
      printer.drawLine();
      printer.println('');
      printer.println('1234567890');
      printer.println('ABCDEFGHIJ');
      printer.println('');
      printer.println(`Area: ${areaConfig.nome || area}`);
      printer.println(`IP: ${areaConfig.endereco}:${areaConfig.porta}`);
      printer.println('');
      printer.drawLine();
      printer.println(new Date().toLocaleString('pt-BR'));
      printer.cut();

      await printer.execute();

      return {
        sucesso: true,
        mensagem: `Página de teste impressa em ${areaConfig.nome || area}!`,
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
      };
    }
  }
}

export default new PrinterService();
