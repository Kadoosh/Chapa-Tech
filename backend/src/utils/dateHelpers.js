import { format, differenceInMinutes, parseISO, startOfDay, endOfDay, subDays, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatarData = (data) => {
  return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatarDataCurta = (data) => {
  return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatarHora = (data) => {
  return format(new Date(data), 'HH:mm', { locale: ptBR });
};

export const formatarDataRelativa = (data) => {
  const date = new Date(data);
  
  if (isToday(date)) {
    return `Hoje às ${formatarHora(date)}`;
  }
  
  if (isYesterday(date)) {
    return `Ontem às ${formatarHora(date)}`;
  }
  
  return formatarData(date);
};

export const calcularTempoPreparo = (criadoEm, prontoEm) => {
  if (!prontoEm) return null;
  return differenceInMinutes(new Date(prontoEm), new Date(criadoEm));
};

export const calcularTempoPermanencia = (criadoEm, pagoEm) => {
  if (!pagoEm) return null;
  return differenceInMinutes(new Date(pagoEm), new Date(criadoEm));
};

export const calcularTempoDecorrido = (dataInicio) => {
  return differenceInMinutes(new Date(), new Date(dataInicio));
};

export const gerarNumeroPedido = (numero) => {
  return String(numero).padStart(3, '0'); // 001, 002, 003...
};

export const obterInicioFimDia = (data = new Date()) => {
  return {
    inicio: startOfDay(data),
    fim: endOfDay(data)
  };
};

export const obterUltimosDias = (dias = 7) => {
  const hoje = new Date();
  return {
    inicio: startOfDay(subDays(hoje, dias - 1)),
    fim: endOfDay(hoje)
  };
};

export const formatarDuracao = (minutos) => {
  if (minutos < 60) {
    return `${minutos}min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
};
