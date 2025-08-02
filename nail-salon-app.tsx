import React, { useState, useEffect } from 'react';
import { User, CreditCard, Gift, QrCode, Search, Plus, Eye, Activity, DollarSign, Users, Calendar } from 'lucide-react';

// Datos iniciales simulados
const initialData = {
  users: [
    { id: 1, email: 'admin@honeydae.com', password: 'admin123', role: 'admin', name: 'Administrador' },
    { id: 2, email: 'cliente@email.com', password: 'cliente123', role: 'client', name: 'María García' }
  ],
  cards: [
    {
      id: 1,
      code: 'HONEY-A1B2C3',
      balance: 500,
      originalAmount: 1000,
      ownerId: 2,
      ownerName: 'María García',
      createdAt: '2024-01-15',
      isActive: true,
      history: [
        { date: '2024-01-20', type: 'uso', amount: -300, description: 'Manicure completo', balance: 700 },
        { date: '2024-01-25', type: 'uso', amount: -200, description: 'Pedicure', balance: 500 }
      ]
    }
  ]
};

const HoneydaeApp = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialData.users);
  const [cards, setCards] = useState(initialData.cards);
  const [activeTab, setActiveTab] = useState('login');
  const [searchCode, setSearchCode] = useState('');

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [cardForm, setCardForm] = useState({ amount: '', ownerEmail: '', description: '' });

  // Función para generar código único de tarjeta
  const generateCardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HONEY-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Función de login
  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  // Función de registro
  const handleRegister = () => {
    if (users.find(u => u.email === registerForm.email)) {
      alert('El email ya está registrado');
      return;
    }
    const newUser = {
      id: users.length + 1,
      ...registerForm
    };
    setUsers([...users, newUser]);
    alert('Usuario registrado exitosamente');
    setActiveTab('login');
  };

  // Función para crear nueva tarjeta
  const handleCreateCard = () => {
    const owner = users.find(u => u.email === cardForm.ownerEmail);
    if (!owner) {
      alert('Usuario no encontrado');
      return;
    }

    const newCard = {
      id: cards.length + 1,
      code: generateCardCode(),
      balance: parseFloat(cardForm.amount),
      originalAmount: parseFloat(cardForm.amount),
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      history: [{
        date: new Date().toISOString().split('T')[0],
        type: 'creación',
        amount: parseFloat(cardForm.amount),
        description: cardForm.description || 'Tarjeta creada',
        balance: parseFloat(cardForm.amount)
      }]
    };

    setCards([...cards, newCard]);
    setCardForm({ amount: '', ownerEmail: '', description: '' });
    alert(`Tarjeta creada exitosamente: ${newCard.code}`);
  };

  // Función para recargar saldo
  const handleRecharge = (cardId, amount) => {
    const rechargeAmount = parseFloat(prompt('Ingrese el monto a recargar:'));
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) return;

    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newBalance = card.balance + rechargeAmount;
        return {
          ...card,
          balance: newBalance,
          history: [{
            date: new Date().toISOString().split('T')[0],
            type: 'recarga',
            amount: rechargeAmount,
            description: 'Recarga de saldo',
            balance: newBalance
          }, ...card.history]
        };
      }
      return card;
    }));
  };

  // Función para usar tarjeta (simulación)
  const handleUseCard = (cardId) => {
    const useAmount = parseFloat(prompt('Ingrese el monto a descontar:'));
    const description = prompt('Descripción del servicio:') || 'Servicio de uñas';
    
    if (isNaN(useAmount) || useAmount <= 0) return;

    setCards(cards.map(card => {
      if (card.id === cardId) {
        if (card.balance < useAmount) {
          alert('Saldo insuficiente');
          return card;
        }
        const newBalance = card.balance - useAmount;
        return {
          ...card,
          balance: newBalance,
          history: [{
            date: new Date().toISOString().split('T')[0],
            type: 'uso',
            amount: -useAmount,
            description: description,
            balance: newBalance
          }, ...card.history]
        };
      }
      return card;
    }));
  };

  // Función de logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('login');
  };

  // Buscar tarjeta por código
  const searchCard = cards.find(card => 
    card.code.toLowerCase().includes(searchCode.toLowerCase())
  );

  // Estadísticas para admin
  const stats = {
    totalCards: cards.length,
    activeCards: cards.filter(c => c.isActive && c.balance > 0).length,
    totalBalance: cards.reduce((sum, card) => sum + card.balance, 0),
    totalUsers: users.filter(u => u.role === 'client').length
  };

  // Tarjetas del cliente actual
  const userCards = cards.filter(card => card.ownerId === currentUser?.id);

  // Componente de Login
  const LoginForm = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border border-pink-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🍯 Honeydae</h2>
        <p className="text-gray-600">Sistema de Tarjetas de Regalo</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
          />
        </div>
        <button 
          onClick={handleLogin}
          className="w-full bg-pink-400 text-white p-3 rounded-lg hover:bg-pink-500 transition-colors shadow-lg"
        >
          Iniciar Sesión
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          onClick={() => setActiveTab('register')}
          className="text-pink-400 hover:text-pink-500 font-medium"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>

      <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
        <p className="text-sm text-gray-600 mb-2">Usuarios de prueba:</p>
        <p className="text-xs">Admin: admin@honeydae.com / admin123</p>
        <p className="text-xs">Cliente: cliente@email.com / cliente123</p>
      </div>
    </div>
  );

  // Componente de Registro
  const RegisterForm = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border border-pink-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Registro</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={registerForm.name}
          onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
          className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
        />
        <input
          type="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
          className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={registerForm.password}
          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
          className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
        />
        
        <button 
          onClick={handleRegister}
          className="w-full bg-pink-400 text-white p-3 rounded-lg hover:bg-pink-500 transition-colors shadow-lg"
        >
          Registrarse
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          onClick={() => setActiveTab('login')}
          className="text-pink-400 hover:text-pink-500 font-medium"
        >
          ¿Ya tienes cuenta? Inicia Sesión
        </button>
      </div>
    </div>
  );

  // Dashboard del Administrador
  const AdminDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-rose-50">
      <nav className="bg-white shadow-sm border-b border-pink-100 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Panel Administrativo - Honeydae</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hola, {currentUser.name}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 bg-gradient-to-br from-pink-25 to-rose-50 min-h-screen">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-pink-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Tarjetas</p>
                <p className="text-2xl font-bold text-pink-500">{stats.totalCards}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-rose-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tarjetas Activas</p>
                <p className="text-2xl font-bold text-rose-500">{stats.activeCards}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-pink-300" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Saldo Total</p>
                <p className="text-2xl font-bold text-pink-600">${stats.totalBalance}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-rose-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-rose-500">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crear nueva tarjeta */}
        <div className="bg-white rounded-lg shadow-lg border border-pink-100 p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600">
            <Plus className="w-5 h-5 mr-2" />
            Crear Nueva Tarjeta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="email"
              placeholder="Email del cliente"
              value={cardForm.ownerEmail}
              onChange={(e) => setCardForm({...cardForm, ownerEmail: e.target.value})}
              className="p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
            />
            <input
              type="number"
              placeholder="Monto inicial"
              value={cardForm.amount}
              onChange={(e) => setCardForm({...cardForm, amount: e.target.value})}
              className="p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={cardForm.description}
              onChange={(e) => setCardForm({...cardForm, description: e.target.value})}
              className="p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
            />
            <button 
              onClick={handleCreateCard}
              className="bg-pink-400 text-white p-3 rounded-lg hover:bg-pink-500 shadow-lg transition-colors"
            >
              Crear Tarjeta
            </button>
          </div>
        </div>

        {/* Buscar tarjeta */}
        <div className="bg-white rounded-lg shadow-lg border border-pink-100 p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600">
            <Search className="w-5 h-5 mr-2" />
            Buscar Tarjeta
          </h3>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Ingrese código de tarjeta"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1 p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-pink-25"
            />
          </div>
          
          {searchCode && searchCard && (
            <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-pink-600">{searchCard.code}</p>
                  <p className="text-gray-600">Cliente: {searchCard.ownerName}</p>
                  <p className="text-pink-500 font-bold">Saldo: ${searchCard.balance}</p>
                </div>
                <div className="space-x-2">
                  <button 
                    onClick={() => handleRecharge(searchCard.id)}
                    className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500 shadow transition-colors"
                  >
                    Recargar
                  </button>
                  <button 
                    onClick={() => handleUseCard(searchCard.id)}
                    className="bg-rose-400 text-white px-4 py-2 rounded hover:bg-rose-500 shadow transition-colors"
                  >
                    Usar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de todas las tarjetas */}
        <div className="bg-white rounded-lg shadow-lg border border-pink-100">
          <div className="p-6 border-b border-pink-100 bg-pink-25">
            <h3 className="text-lg font-bold text-pink-600">Todas las Tarjetas</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50 border-b border-pink-100">
                <tr>
                  <th className="p-4 text-left text-pink-600 font-semibold">Código</th>
                  <th className="p-4 text-left text-pink-600 font-semibold">Cliente</th>
                  <th className="p-4 text-left text-pink-600 font-semibold">Saldo</th>
                  <th className="p-4 text-left text-pink-600 font-semibold">Fecha Creación</th>
                  <th className="p-4 text-left text-pink-600 font-semibold">Estado</th>
                  <th className="p-4 text-left text-pink-600 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id} className="border-b border-pink-100 hover:bg-pink-25 transition-colors">
                    <td className="p-4 font-mono text-sm text-pink-500 font-medium">{card.code}</td>
                    <td className="p-4 text-gray-700">{card.ownerName}</td>
                    <td className="p-4 font-bold text-pink-600">${card.balance}</td>
                    <td className="p-4 text-gray-600">{card.createdAt}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        card.balance > 0 ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {card.balance > 0 ? 'Activa' : 'Sin saldo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRecharge(card.id)}
                          className="bg-pink-400 text-white px-3 py-1 rounded text-sm hover:bg-pink-500 shadow transition-colors"
                        >
                          Recargar
                        </button>
                        <button 
                          onClick={() => handleUseCard(card.id)}
                          className="bg-rose-400 text-white px-3 py-1 rounded text-sm hover:bg-rose-500 shadow transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard del Cliente
  const ClientDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-rose-50">
      <nav className="bg-white shadow-sm border-b border-pink-100 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Mis Tarjetas Honeydae</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hola, {currentUser.name}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 bg-gradient-to-br from-pink-25 to-rose-50 min-h-screen">
        {userCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-200">
              <Gift className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">No tienes tarjetas de regalo</h3>
            <p className="text-pink-400">Contacta con Honeydae para obtener tu primera tarjeta</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCards.map(card => (
              <div key={card.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-pink-100 hover:shadow-xl transition-shadow">
                {/* Tarjeta principal */}
                <div className="bg-gradient-to-r from-pink-300 to-rose-400 text-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">🍯 Honeydae</h3>
                      <p className="text-pink-100">Tarjeta de Regalo</p>
                    </div>
                    <QrCode className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-mono text-sm bg-white bg-opacity-25 rounded px-2 py-1 inline-block border border-white border-opacity-30">
                      {card.code}
                    </p>
                    <div>
                      <p className="text-pink-100 text-sm">Saldo disponible</p>
                      <p className="text-3xl font-bold">${card.balance}</p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="p-4 bg-pink-25">
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Creada: {card.createdAt}</span>
                    <span>Monto original: ${card.originalAmount}</span>
                  </div>

                  {/* Historial reciente */}
                  <div>
                    <h4 className="font-bold text-pink-600 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Historial Reciente
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {card.history.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-pink-50 rounded border border-pink-200">
                          <div>
                            <p className="font-medium text-gray-700">{item.description}</p>
                            <p className="text-gray-500 text-xs">{item.date}</p>
                          </div>
                          <span className={`font-bold ${
                            item.type === 'uso' ? 'text-rose-500' : 'text-pink-500'
                          }`}>
                            {item.type === 'uso' ? '-' : '+'}${Math.abs(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón para pago simulado */}
                  <div className="mt-4 pt-4 border-t border-pink-200">
                    <button 
                      onClick={() => alert('Función de pago en desarrollo. Presenta esta tarjeta en Honeydae.')}
                      className="w-full bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition-colors shadow-lg"
                    >
                      💳 Pagar con esta tarjeta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100">
      {activeTab === 'login' && <LoginForm />}
      {activeTab === 'register' && <RegisterForm />}
      {activeTab === 'admin-dashboard' && currentUser?.role === 'admin' && <AdminDashboard />}
      {activeTab === 'client-dashboard' && currentUser?.role === 'client' && <ClientDashboard />}
    </div>
  );
};

export default HoneydaeApp;