export function CategoriaList({ categorias, categoriaSelecionada, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
          !categoriaSelecionada
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todos
      </button>
      {categorias?.map((categoria) => (
        <button
          key={categoria.id}
          onClick={() => onSelect(categoria.id)}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            categoriaSelecionada === categoria.id
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {categoria.nome}
        </button>
      ))}
    </div>
  );
}
