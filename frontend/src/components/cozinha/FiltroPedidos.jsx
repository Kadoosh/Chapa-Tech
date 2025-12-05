export function FiltroPedidos({ filtroAtivo, onChangeFiltro }) {
  const filtros = [
    { valor: 'todos', label: 'Todos', emoji: '📋' },
    { valor: 'preparando', label: 'Preparando', emoji: '🔥' },
    { valor: 'pronto', label: 'Prontos', emoji: '✅' },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {filtros.map((filtro) => (
        <button
          key={filtro.valor}
          onClick={() => onChangeFiltro(filtro.valor)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroAtivo === filtro.valor
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-2">{filtro.emoji}</span>
          {filtro.label}
        </button>
      ))}
    </div>
  );
}
