/**
 * Utilitários de formatação centralizados
 * Evita duplicação de funções de formatação em vários componentes
 */

/**
 * Formata valor para moeda brasileira
 * @param {number} preco - Valor a formatar
 * @returns {string} Valor formatado em BRL
 */
export const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(preco);
};

/**
 * Formata data para padrão brasileiro
 * @param {string|Date} data - Data a formatar
 * @param {boolean} incluirHora - Se deve incluir hora
 * @returns {string} Data formatada
 */
export const formatarData = (data, incluirHora = true) => {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (incluirHora) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(new Date(data));
};

/**
 * Formata telefone para padrão brasileiro
 * @param {string} valor - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
};

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} valor - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (valor) => {
    return valor
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formata número do pedido
 * @param {number|string} numero - Número do pedido
 * @returns {string} Número formatado com zeros à esquerda
 */
export const formatarNumeroPedido = (numero) => {
    return String(numero).padStart(3, '0');
};
