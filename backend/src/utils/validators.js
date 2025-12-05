export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefone = (telefone) => {
  // Remove caracteres não numéricos
  const cleaned = telefone.replace(/\D/g, '');
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validarCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(cleaned.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
  
  return digitoVerificador2 === parseInt(cleaned.charAt(10));
};

export const validarSenha = (senha) => {
  // Mínimo 6 caracteres
  return senha && senha.length >= 6;
};

export const sanitizarTexto = (texto) => {
  if (!texto) return '';
  return texto.trim();
};

export const validarPreco = (preco) => {
  return typeof preco === 'number' && preco >= 0;
};

export const validarQuantidade = (quantidade) => {
  return Number.isInteger(quantidade) && quantidade > 0;
};

export const validarStatus = (status, statusPermitidos) => {
  return statusPermitidos.includes(status);
};
