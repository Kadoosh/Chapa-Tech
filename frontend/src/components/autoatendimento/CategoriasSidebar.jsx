/**
 * Sidebar com lista de categorias
 */
export function CategoriasSidebar({
    categorias,
    produtos,
    categoriaAtiva,
    onSelectCategoria
}) {
    return (
        <aside className="w-72 bg-white shadow-xl overflow-y-auto border-r border-gray-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    📋 Categorias
                </h2>
                <nav className="space-y-2">
                    {categorias.map((categoria) => {
                        const produtosCount = produtos.filter(p => p.categoriaId === categoria.id).length;
                        const isActive = categoriaAtiva === categoria.id;

                        return (
                            <button
                                key={categoria.id}
                                onClick={() => onSelectCategoria(categoria.id)}
                                className={`w-full text-left px-4 py-4 rounded-xl font-medium transition-all transform ${isActive
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">{categoria.nome}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-200'
                                        }`}>
                                        {produtosCount}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {categorias.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Nenhuma categoria disponível</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
