export function FiltrosPeriodo({ periodo, onChangePeriodo }) {
  const periodos = [
    { valor: 'hoje', label: 'Hoje' },
    { valor: 'semana', label: 'Esta Semana' },
    { valor: 'mes', label: 'Este Mês' },
    { valor: 'ano', label: 'Este Ano' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {periodos.map((p) => (
        <button
          key={p.valor}
          onClick={() => onChangePeriodo(p.valor)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            periodo === p.valor
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
