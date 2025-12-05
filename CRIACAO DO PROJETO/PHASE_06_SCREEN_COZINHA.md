# 👨‍🍳 PHASE 06 - PAINEL COZINHA (Tempo Real)

## 📌 Objetivo desta Fase
Criar o painel da cozinha com atualização em tempo real via WebSocket, sistema de colunas estilo Kanban (Preparando → Pronto), notificações sonoras e interface otimizada para monitores grandes.

---

## ✅ Checklist de Conclusão
Ao final desta fase, você deve ter:
- [ ] Página Cozinha responsiva e full-screen
- [ ] WebSocket conectado e funcionando
- [ ] 2 colunas: Preparando e Pronto
- [ ] Cards de pedido detalhados
- [ ] Botão "Marcar como Pronto"
- [ ] Notificação sonora ao novo pedido
- [ ] Atualização automática em tempo real
- [ ] Filtros (todos, preparando, pronto)
- [ ] Indicador de tempo desde criação
- [ ] Auto-refresh periódico
- [ ] Animações de entrada/saída

---

## 📁 Arquivos que Serão Criados

```
frontend/src/
├── pages/
│   └── Cozinha.jsx             🆕 Tela principal da cozinha
│
├── components/
│   └── cozinha/
│       ├── PedidoCard.jsx      🆕 Card de pedido
│       ├── ColunaKanban.jsx    🆕 Coluna preparando/pronto
│       └── FiltroPedidos.jsx   🆕 Filtros superiores
│
├── hooks/
│   └── useSocket.js            🆕 Hook WebSocket
│
├── services/
│   └── socket.js               🔄 Atualizar configuração
│
└── utils/
    └── sounds.js               🆕 Helpers de áudio
```

---

## 🔌 1. SERVICES - Socket (Atualizar)

Atualize `frontend/src/services/socket.js`:

```javascript
import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erro de conexão WebSocket:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Funções helpers para rooms
export const joinRoom = (room) => {
  const socket = getSocket();
  socket.emit(`join:${room}`);
  console.log(`📍 Entrou na room: ${room}`);
};

export const leaveRoom = (room) => {
  const socket = getSocket();
  socket.emit(`leave:${room}`);
  console.log(`📍 Saiu da room: ${room}`);
};
```

---

## 🪝 2. HOOKS - useSocket

Crie `frontend/src/hooks/useSocket.js`:

```javascript
import { useEffect, useState, useCallback } from 'react';
import { getSocket, joinRoom, leaveRoom } from '../services/socket';

export const useSocket = (room = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    const handleConnect = () => {
      setIsConnected(true);
      // Entrar na room se especificada
      if (room) {
        joinRoom(room);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Se já conectado, atualizar estado
    if (socketInstance.connected) {
      setIsConnected(true);
      if (room) {
        joinRoom(room);
      }
    }

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      
      // Sair da room ao desmontar
      if (room) {
        leaveRoom(room);
      }
    };
  }, [room]);

  // Função para escutar eventos
  const on = useCallback((event, callback) => {
    if (!socket) return;

    socket.on(event, callback);

    // Retornar função de cleanup
    return () => {
      socket.off(event, callback);
    };
  }, [socket]);

  // Função para emitir eventos
  const emit = useCallback((event, data) => {
    if (!socket) return;
    socket.emit(event, data);
  }, [socket]);

  return {
    socket,
    isConnected,
    on,
    emit,
  };
};
```

---

## 🔊 3. UTILS - Sounds

Crie `frontend/src/utils/sounds.js`:

```javascript
// Helpers para tocar sons de notificação

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  // Carregar som
  load(name, url) {
    try {
      this.sounds[name] = new Audio(url);
      this.sounds[name].preload = 'auto';
    } catch (err) {
      console.error(`Erro ao carregar som ${name}:`, err);
    }
  }

  // Tocar som
  play(name, volume = 0.5) {
    if (!this.enabled) return;

    try {
      const sound = this.sounds[name];
      if (!sound) {
        console.warn(`Som ${name} não encontrado`);
        return;
      }

      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.error(`Erro ao tocar som ${name}:`, err);
      });
    } catch (err) {
      console.error(`Erro ao tocar som ${name}:`, err);
    }
  }

  // Habilitar/desabilitar sons
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Verificar se está habilitado
  isEnabled() {
    return this.enabled;
  }
}

// Instância singleton
const soundManager = new SoundManager();

// Carregar sons (URLs podem ser locais ou CDN)
soundManager.load('novo_pedido', '/sounds/novo-pedido.mp3');
soundManager.load('pedido_pronto', '/sounds/pedido-pronto.mp3');

export default soundManager;
```

**Nota:** Coloque arquivos de som em `frontend/public/sounds/` ou use sons do sistema. 
Alternativa simples: usar Web Audio API para gerar beeps.

---

## 🎨 4. COMPONENTS - FiltroPedidos

Crie `frontend/src/components/cozinha/FiltroPedidos.jsx`:

```jsx
import React from 'react';
import Badge from '../common/Badge';

const FiltroPedidos = ({ filtro, onFiltroChange, contadores, somHabilitado, onToggleSom }) => {
  const filtros = [
    { id: 'todos', label: 'Todos', count: contadores.total },
    { id: 'preparando', label: 'Preparando', count: contadores.preparando },
    { id: 'pronto', label: 'Pronto', count: contadores.pronto },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between">
        {/* Filtros */}
        <div className="flex gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => onFiltroChange(f.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${filtro === f.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {f.label}
              <Badge 
                variant={filtro === f.id ? 'default' : 'primary'} 
                size="sm"
                className={filtro === f.id ? 'bg-white text-primary-600' : ''}
              >
                {f.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Toggle Som */}
        <button
          onClick={onToggleSom}
          className={`
            p-2 rounded-lg transition-colors
            ${somHabilitado 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }
          `}
          title={somHabilitado ? 'Desabilitar som' : 'Habilitar som'}
        >
          {somHabilitado ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default FiltroPedidos;
```

---

## 🎨 5. COMPONENTS - PedidoCard

Crie `frontend/src/components/cozinha/PedidoCard.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { differenceInMinutes } from 'date-fns';

const PedidoCard = ({ pedido, onMarcarPronto, loading }) => {
  const [tempoDecorrido, setTempoDecorrido] = useState(0);

  // Atualizar tempo decorrido a cada minuto
  useEffect(() => {
    const calcularTempo = () => {
      const minutos = differenceInMinutes(new Date(), new Date(pedido.criadoEm));
      setTempoDecorrido(minutos);
    };

    calcularTempo();
    const interval = setInterval(calcularTempo, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [pedido.criadoEm]);

  // Cor do badge de tempo (alerta se demorar muito)
  const getCorTempo = () => {
    if (tempoDecorrido < 15) return 'success';
    if (tempoDecorrido < 30) return 'warning';
    return 'danger';
  };

  const isPronto = pedido.status === 'pronto';

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-4 space-y-3 transition-all
        ${isPronto ? 'border-2 border-green-500' : 'border-2 border-transparent'}
        animate-fade-in-up
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">
              #{pedido.numero}
            </h3>
            <Badge variant={getCorTempo()} size="sm">
              {tempoDecorrido} min
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Mesa <span className="font-bold text-primary-600">{pedido.mesa.numero}</span>
          </p>
        </div>

        {/* Status Badge */}
        <Badge 
          variant={isPronto ? 'success' : 'warning'}
          size="lg"
        >
          {isPronto ? '✓ Pronto' : '🔥 Preparando'}
        </Badge>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Itens */}
      <div className="space-y-2">
        {pedido.itens.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {item.quantidade}x
                </span>
                <span className="text-gray-900">{item.produto.nome}</span>
              </div>
              {item.observacao && (
                <p className="text-sm text-orange-600 mt-1 ml-6">
                  📝 {item.observacao}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Observação do Pedido */}
      {pedido.observacao && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
          <p className="text-sm text-yellow-800">
            <strong>Obs:</strong> {pedido.observacao}
          </p>
        </div>
      )}

      {/* Cliente */}
      {pedido.cliente && (
        <div className="text-sm text-gray-600">
          👤 {pedido.cliente.nome} {pedido.cliente.sobrenome}
        </div>
      )}

      {/* Botão Marcar Pronto */}
      {!isPronto && (
        <Button
          variant="success"
          fullWidth
          onClick={() => onMarcarPronto(pedido.id)}
          loading={loading === pedido.id}
          disabled={loading}
        >
          ✓ Marcar como Pronto
        </Button>
      )}

      {/* Info se já está pronto */}
      {isPronto && pedido.prontoEm && (
        <div className="text-center text-sm text-green-600">
          Pronto às {new Date(pedido.prontoEm).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </div>
  );
};

export default PedidoCard;
```

---

## 🎨 6. COMPONENTS - ColunaKanban

Crie `frontend/src/components/cozinha/ColunaKanban.jsx`:

```jsx
import React from 'react';
import PedidoCard from './PedidoCard';

const ColunaKanban = ({ titulo, pedidos, cor, onMarcarPronto, loading }) => {
  const cores = {
    amarelo: 'border-yellow-500 bg-yellow-50',
    verde: 'border-green-500 bg-green-50',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`rounded-t-xl border-t-4 ${cores[cor]} p-4 mb-4`}>
        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-between">
          {titulo}
          <span className="text-2xl">{pedidos.length}</span>
        </h2>
      </div>

      {/* Cards (scroll) */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">✨</div>
            <p>Nenhum pedido</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onMarcarPronto={onMarcarPronto}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ColunaKanban;
```

---

## 📱 7. PÁGINA - Cozinha (COMPLETA)

Crie `frontend/src/pages/Cozinha.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import FiltroPedidos from '../components/cozinha/FiltroPedidos';
import ColunaKanban from '../components/cozinha/ColunaKanban';
import { useSocket } from '../hooks/useSocket';
import pedidosService from '../services/pedidos.service';
import api from '../services/api';
import soundManager from '../utils/sounds';

const Cozinha = () => {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('todos');
  const [somHabilitado, setSomHabilitado] = useState(true);
  const [loadingPedidoId, setLoadingPedidoId] = useState(null);

  // WebSocket
  const { isConnected, on } = useSocket('cozinha');

  // Query de pedidos
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos', { status: ['preparando', 'pronto'] }],
    queryFn: async () => {
      const response = await pedidosService.listar({
        status: 'preparando,pronto',
        limite: 100,
      });
      return response.pedidos || [];
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Mutation para marcar como pronto
  const marcarPronto = useMutation({
    mutationFn: async (pedidoId) => {
      const response = await api.patch(`/pedidos/${pedidoId}/status`, {
        status: 'pronto',
      });
      return response.data;
    },
    onMutate: (pedidoId) => {
      setLoadingPedidoId(pedidoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos']);
      // Tocar som
      if (somHabilitado) {
        soundManager.play('pedido_pronto', 0.3);
      }
    },
    onError: (error) => {
      alert('Erro ao marcar pedido como pronto: ' + error.message);
    },
    onSettled: () => {
      setLoadingPedidoId(null);
    },
  });

  // Escutar eventos WebSocket
  useEffect(() => {
    if (!isConnected) return;

    // Novo pedido
    const cleanupNovo = on('novo_pedido', (novoPedido) => {
      console.log('🆕 Novo pedido recebido:', novoPedido);
      
      // Atualizar cache
      queryClient.setQueryData(['pedidos', { status: ['preparando', 'pronto'] }], (old) => {
        if (!old) return [novoPedido];
        return [novoPedido, ...old];
      });

      // Tocar som
      if (somHabilitado) {
        soundManager.play('novo_pedido', 0.5);
      }

      // Notificação visual (opcional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Pedido!', {
          body: `Mesa ${novoPedido.mesa.numero} - ${novoPedido.itens.length} itens`,
          icon: '/icon-192.png',
        });
      }
    });

    // Pedido atualizado
    const cleanupAtualizado = on('pedido_atualizado', (pedidoAtualizado) => {
      console.log('🔄 Pedido atualizado:', pedidoAtualizado);
      queryClient.invalidateQueries(['pedidos']);
    });

    // Pedido cancelado
    const cleanupCancelado = on('pedido_cancelado', (pedidoCancelado) => {
      console.log('❌ Pedido cancelado:', pedidoCancelado);
      
      // Remover do cache
      queryClient.setQueryData(['pedidos', { status: ['preparando', 'pronto'] }], (old) => {
        if (!old) return [];
        return old.filter(p => p.id !== pedidoCancelado.id);
      });
    });

    // Pedido pago (remover da cozinha)
    const cleanupPago = on('pedido_pago', (pedidoPago) => {
      console.log('💰 Pedido pago:', pedidoPago);
      
      // Remover do cache
      queryClient.setQueryData(['pedidos', { status: ['preparando', 'pronto'] }], (old) => {
        if (!old) return [];
        return old.filter(p => p.id !== pedidoPago.id);
      });
    });

    return () => {
      cleanupNovo?.();
      cleanupAtualizado?.();
      cleanupCancelado?.();
      cleanupPago?.();
    };
  }, [isConnected, on, queryClient, somHabilitado]);

  // Solicitar permissão para notificações (primeira vez)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos?.filter(p => {
    if (filtro === 'todos') return true;
    return p.status === filtro;
  }) || [];

  // Separar por status
  const pedidosPreparando = pedidosFiltrados.filter(p => p.status === 'preparando');
  const pedidosProntos = pedidosFiltrados.filter(p => p.status === 'pronto');

  // Contadores
  const contadores = {
    total: pedidos?.length || 0,
    preparando: pedidos?.filter(p => p.status === 'preparando').length || 0,
    pronto: pedidos?.filter(p => p.status === 'pronto').length || 0,
  };

  // Toggle som
  const handleToggleSom = () => {
    const novoEstado = soundManager.toggle();
    setSomHabilitado(novoEstado);
  };

  // Loading inicial
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
        {/* Filtros */}
        <FiltroPedidos
          filtro={filtro}
          onFiltroChange={setFiltro}
          contadores={contadores}
          somHabilitado={somHabilitado}
          onToggleSom={handleToggleSom}
        />

        {/* Status WebSocket */}
        <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado - Tempo Real' : 'Desconectado'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Grid de Colunas Kanban */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Coluna Preparando */}
          <ColunaKanban
            titulo="🔥 Preparando"
            pedidos={filtro === 'todos' || filtro === 'preparando' ? pedidosPreparando : []}
            cor="amarelo"
            onMarcarPronto={(id) => marcarPronto.mutate(id)}
            loading={loadingPedidoId}
          />

          {/* Coluna Pronto */}
          <ColunaKanban
            titulo="✓ Pronto"
            pedidos={filtro === 'todos' || filtro === 'pronto' ? pedidosProntos : []}
            cor="verde"
            onMarcarPronto={() => {}}
            loading={null}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Cozinha;
```

---

## 🔊 8. ADICIONAR SONS (Opcional Simples)

Se não quiser arquivos de áudio, você pode gerar beeps com Web Audio API.

Crie `frontend/src/utils/beep.js`:

```javascript
// Gerar beep simples sem arquivos de áudio

export const playBeep = (frequency = 800, duration = 200, volume = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (err) {
    console.error('Erro ao tocar beep:', err);
  }
};

// Som de novo pedido (dois beeps)
export const playNovoPedidoBeep = () => {
  playBeep(800, 200, 0.3);
  setTimeout(() => playBeep(1000, 200, 0.3), 250);
};

// Som de pedido pronto (beep único mais longo)
export const playPedidoProntoBeep = () => {
  playBeep(600, 400, 0.2);
};
```

Atualize `sounds.js` para usar beeps se não houver arquivos:

```javascript
import { playNovoPedidoBeep, playPedidoProntoBeep } from './beep';

// ... resto do código

// No método play, adicionar fallback:
play(name, volume = 0.5) {
  if (!this.enabled) return;

  try {
    const sound = this.sounds[name];
    if (!sound || sound.error) {
      // Fallback para beep
      if (name === 'novo_pedido') {
        playNovoPedidoBeep();
      } else if (name === 'pedido_pronto') {
        playPedidoProntoBeep();
      }
      return;
    }

    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(err => {
      console.error(`Erro ao tocar som ${name}:`, err);
      // Fallback para beep
      if (name === 'novo_pedido') playNovoPedidoBeep();
      else if (name === 'pedido_pronto') playPedidoProntoBeep();
    });
  } catch (err) {
    console.error(`Erro ao tocar som ${name}:`, err);
  }
}
```

---

## 🔌 9. INSTALAR DEPENDÊNCIA SOCKET.IO CLIENT

Execute no frontend:

```bash
cd frontend
npm install socket.io-client
```

---

## 🔄 10. ADICIONAR ROTA NO APP.JSX

Atualize `frontend/src/App.jsx`:

```jsx
import Cozinha from './pages/Cozinha';

// ... dentro de Routes

<Route
  path="/cozinha"
  element={
    <ProtectedRoute requiredPermission="marcar_pronto">
      <Cozinha />
    </ProtectedRoute>
  }
/>
```

---

## ✅ 11. CHECKLIST FINAL DA PHASE 06

### Infraestrutura
- [x] Socket.io client instalado
- [x] Socket service configurado
- [x] Hook useSocket criado
- [x] Sistema de sons implementado

### Componentes
- [x] FiltroPedidos
- [x] PedidoCard (com timer)
- [x] ColunaKanban

### Página Principal
- [x] Cozinha.jsx completo

### Funcionalidades
- [x] WebSocket conectado
- [x] Room 'cozinha' ativa
- [x] Receber novos pedidos em tempo real
- [x] Notificação sonora (beep ou arquivo)
- [x] Filtros (todos/preparando/pronto)
- [x] 2 colunas Kanban
- [x] Marcar como pronto
- [x] Indicador de tempo decorrido
- [x] Auto-refresh periódico (fallback)
- [x] Animações de entrada
- [x] Status de conexão visível
- [x] Remoção automática de pedidos pagos/cancelados

---

## 🎨 12. RESULTADO VISUAL

### Layout:
- 📊 **2 colunas** lado a lado (Preparando | Pronto)
- 🎨 **Cores visuais** (amarelo = preparando, verde = pronto)
- ⏱️ **Timer em cada card** (atualiza a cada minuto)
- 🔔 **Badge de alerta** (verde < 15min, amarelo < 30min, vermelho > 30min)

### Interações:
- 🔄 **WebSocket** - Pedidos aparecem instantaneamente
- 🔊 **Som** - Beep ao receber novo pedido
- 🎯 **Botão grande** - "Marcar como Pronto"
- 🔀 **Filtros** - Alternar visualização
- 🔇 **Toggle som** - Habilitar/desabilitar áudio

### UX:
- ✨ **Animações** - Cards entram suavemente
- 💚 **Feedback visual** - Border verde quando pronto
- 📝 **Observações destacadas** - Amarelo para chamar atenção
- 📱 **Responsivo** - Funciona em monitores grandes e tablets

---

## 🧪 13. FLUXO DE USO

### 1. Cozinheiro abre o painel
- Vê 2 colunas vazias (se não houver pedidos)
- Status "Conectado - Tempo Real" aparece
- Som está habilitado por padrão

### 2. Atendente cria pedido (PHASE_05)
- Backend cria pedido e emite evento WebSocket
- **Painel da cozinha recebe instantaneamente**
- Som toca (beep-beep)
- Card aparece na coluna "Preparando"
- Timer começa a contar

### 3. Cozinha prepara
- Vê todos os detalhes do pedido
- Quantidade, produtos, observações
- Identificação da mesa e cliente

### 4. Pedido fica pronto
- Cozinheiro clica "Marcar como Pronto"
- Card move para coluna "Pronto"
- Border fica verde
- Som toca (beep único)

### 5. Garçom entrega + Caixa finaliza (PHASE_07)
- Card desaparece do painel automaticamente
- Mesa é liberada

---

## 🎯 PHASE 06 COMPLETA!

### O que foi entregue:

✅ **Painel completo da Cozinha**  
✅ **WebSocket integrado** (tempo real)  
✅ **Sistema de sons** (beeps ou arquivos)  
✅ **2 colunas Kanban** (Preparando → Pronto)  
✅ **Cards detalhados** com timer  
✅ **Filtros** de visualização  
✅ **Marcar como pronto** funcional  
✅ **Auto-atualização** (WebSocket + polling)  
✅ **Notificações visuais** (browser notifications)  
✅ **Animações suaves**  
✅ **Status de conexão** visível  
✅ **Toggle de som** (habilitar/desabilitar)  

### Próximas Fases:

**PHASE_07** - Tela Caixa (finalização + pagamento)  
**PHASE_08** - Admin Panel  
**PHASE_09** - Dashboard KPIs  

---

## 📝 Notas para Claude Opus 4.5

- WebSocket é CRÍTICO para esta tela funcionar corretamente
- Teste com múltiplas abas abertas: Atendente + Cozinha
- Sons podem não funcionar sem interação prévia do usuário (política do navegador)
- Browser notifications requerem permissão do usuário
- Timer atualiza a cada 1 minuto (não em tempo real para performance)
- Auto-refresh a cada 30s é fallback caso WebSocket caia
- Room 'cozinha' garante que apenas tela da cozinha recebe eventos
- Backend já emite todos os eventos necessários (PHASE_02)
- TESTE criando pedido no Atendente e vendo aparecer na Cozinha
- Verifique console do browser para logs de WebSocket

---

**Status:** ✅ Painel Cozinha Completo  
**Tempo estimado:** 3-4 horas  
**Complexidade:** Alta (WebSocket)  
**Dependências:** PHASE_02 (Backend), PHASE_03 (Auth), PHASE_05 (Atendente)