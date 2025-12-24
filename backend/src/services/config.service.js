import prisma from '../config/database.js';

/**
 * Service para gerenciar configurações no banco de dados
 */
class ConfigService {
    // Cache em memória para evitar consultas repetidas
    cache = {};

    /**
     * Obter uma configuração por chave
     */
    async get(chave, valorPadrao = null) {
        // Verificar cache primeiro
        if (this.cache[chave] !== undefined) {
            return this.cache[chave];
        }

        const config = await prisma.configuracao.findUnique({
            where: { chave },
        });

        if (!config) {
            return valorPadrao;
        }

        const valor = this.parseValor(config.valor, config.tipo);
        this.cache[chave] = valor;
        return valor;
    }

    /**
     * Obter todas as configurações de uma categoria
     */
    async getByCategoria(categoria) {
        const configs = await prisma.configuracao.findMany({
            where: { categoria },
        });

        const result = {};
        for (const config of configs) {
            result[config.chave] = this.parseValor(config.valor, config.tipo);
        }
        return result;
    }

    /**
     * Salvar uma configuração
     */
    async set(chave, valor, opcoes = {}) {
        const { tipo = 'string', descricao = null, categoria = 'geral' } = opcoes;

        const valorString = this.stringifyValor(valor, tipo);

        const config = await prisma.configuracao.upsert({
            where: { chave },
            update: {
                valor: valorString,
                tipo,
                descricao: descricao ?? undefined,
                categoria,
            },
            create: {
                chave,
                valor: valorString,
                tipo,
                descricao,
                categoria,
            },
        });

        // Atualizar cache
        this.cache[chave] = valor;

        return config;
    }

    /**
     * Obter configurações de impressora
     */
    async getPrinterConfig() {
        const config = await this.get('printer_config', null);

        if (config) {
            return config;
        }

        // Retornar configuração padrão se não existir
        return {
            cozinha: {
                habilitada: false,
                nome: 'Impressora Cozinha',
                tipo: 'EPSON',
                interface: 'network',
                endereco: '',
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
                endereco: '',
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

    /**
     * Salvar configurações de impressora
     */
    async savePrinterConfig(config) {
        return await this.set('printer_config', config, {
            tipo: 'json',
            categoria: 'impressao',
            descricao: 'Configurações das impressoras térmicas',
        });
    }

    /**
     * Parse valor baseado no tipo
     */
    parseValor(valorString, tipo) {
        switch (tipo) {
            case 'number':
                return parseFloat(valorString);
            case 'boolean':
                return valorString === 'true';
            case 'json':
                try {
                    return JSON.parse(valorString);
                } catch {
                    return null;
                }
            default:
                return valorString;
        }
    }

    /**
     * Stringify valor baseado no tipo
     */
    stringifyValor(valor, tipo) {
        switch (tipo) {
            case 'json':
                return JSON.stringify(valor);
            case 'boolean':
                return valor ? 'true' : 'false';
            default:
                return String(valor);
        }
    }

    /**
     * Limpar cache (útil após atualizações externas)
     */
    clearCache() {
        this.cache = {};
    }
}

export default new ConfigService();
