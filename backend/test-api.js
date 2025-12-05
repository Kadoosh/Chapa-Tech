// Teste da API de Login
const testeLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sistema.com',
        senha: 'admin123',
      }),
    });

    const data = await response.json();
    console.log('✅ Resposta do Login:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.token) {
      console.log('\n🔑 Token JWT recebido!');
      console.log('👤 Usuário:', data.data.usuario.nome, data.data.usuario.sobrenome);
      console.log('📧 Email:', data.data.usuario.email);
      console.log('👥 Grupo:', data.data.usuario.grupo.nome);
      return data.data.token;
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

const testeMe = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('\n✅ Dados do usuário autenticado:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

const testeHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    console.log('\n💚 Health Check:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Servidor offline:', error.message);
  }
};

// Executar testes
(async () => {
  console.log('🧪 Iniciando testes da API...\n');
  
  await testeHealth();
  const token = await testeLogin();
  
  if (token) {
    await testeMe(token);
  }
  
  console.log('\n✅ Testes concluídos!');
})();
