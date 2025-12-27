import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export function AcompanhamentosModal({
    isOpen,
    onClose,
    produto,
    acompanhamentos = [],
    onConfirm,
}) {
    const [selecionados, setSelecionados] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSelecionados([]);
        }
    }, [isOpen]);

    const toggleAcompanhamento = (acomp) => {
        setSelecionados((prev) => {
            const existe = prev.find((s) => s.id === acomp.id);
            if (existe) {
                return prev.filter((s) => s.id !== acomp.id);
            }
            return [...prev, acomp];
        });
    };

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(preco);
    };

    const totalAcompanhamentos = selecionados.reduce((acc, a) => acc + a.valor, 0);
    const totalFinal = (produto?.preco || 0) + totalAcompanhamentos;

    const handleConfirm = () => {
        onConfirm(produto, selecionados);
        onClose();
    };

    if (!produto) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adicionar Acompanhamentos"
            size="md"
        >
            <div className="space-y-4">
                {/* Produto selecionado */}
                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900">{produto.nome}</h3>
                            {produto.descricao && (
                                <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
                            )}
                        </div>
                        <span className="text-lg font-bold text-primary-600">
                            {formatarPreco(produto.preco)}
                        </span>
                    </div>
                </div>

                {/* Lista de Acompanhamentos */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <span>🍟</span>
                        <span>Acompanhamentos Disponíveis</span>
                    </h4>

                    {acompanhamentos.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                            <p className="text-sm">Nenhum acompanhamento disponível para esta categoria.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {acompanhamentos.map((acomp) => {
                                const isSelected = selecionados.find((s) => s.id === acomp.id);
                                return (
                                    <label
                                        key={acomp.id}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                                ? 'bg-secondary-100 border-2 border-secondary-500'
                                                : 'bg-white border-2 border-gray-200 hover:border-secondary-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={!!isSelected}
                                                onChange={() => toggleAcompanhamento(acomp)}
                                                className="w-5 h-5 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                                            />
                                            <div>
                                                <span className={`font-medium ${isSelected ? 'text-secondary-700' : 'text-gray-900'}`}>
                                                    {acomp.nome}
                                                </span>
                                                {acomp.descricao && (
                                                    <p className="text-xs text-gray-500">{acomp.descricao}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${isSelected ? 'text-secondary-600' : 'text-gray-600'}`}>
                                            + {formatarPreco(acomp.valor)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Resumo do preço */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Produto:</span>
                        <span className="font-medium">{formatarPreco(produto.preco)}</span>
                    </div>
                    {selecionados.length > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                Acompanhamentos ({selecionados.length}):
                            </span>
                            <span className="font-medium text-secondary-600">
                                + {formatarPreco(totalAcompanhamentos)}
                            </span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-primary-600">
                            {formatarPreco(totalFinal)}
                        </span>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 font-bold"
                    >
                        🛒 Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </Modal>
    );
}
