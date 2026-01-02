import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Package, 
  Users, 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  Wallet, 
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCcw,
  LogOut,
  Settings,
  ShieldCheck
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// ⚠️ SUSTITUYE ESTO CON TUS DATOS REALES DE FIREBASE
const firebaseConfig = {
  // Pega aquí tu configuración de Firebase si es diferente
  apiKey: "AIzaSyBDIWSy6MGEjnaoKpmF1aQR3KjgMNK0T94",
  authDomain: "gestionjayi.firebaseapp.com",
  projectId: "gestionjayi",
  storageBucket: "gestionjayi.firebasestorage.app",
  messagingSenderId: "636742580694",
  appId: "1:636742580694:web:fb0eede379721d51498c77",
  measurementId: "G-1142FSPXPQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // <--- ¡AQUÍ ESTABA EL ERROR! AGREGADO CORRECTAMENTE
const db = getFirestore(app);

// --- COMPONENTES AUXILIARES ---

// Tarjeta de Estadística
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center bg-gray-50 px-2 py-1 rounded-lg`}>
          {trend >= 0 ? '+' : ''}{trend}%
          <TrendingUp className="w-3 h-3 ml-1" />
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

// Modal Genérico
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  // Estados Principales
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  
  // Estados de Datos
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // Estados de Formularios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Efecto de Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) loadData();
    });
    return () => unsubscribe();
  }, []);

  // Cargar Datos de Firestore
  const loadData = () => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSales = onSnapshot(collection(db, "sales"), (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubProducts(); unsubSales(); unsubExpenses(); };
  };

  // Funciones de Autenticación
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Error de acceso: " + error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // Lógica del Dashboard
  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalProfit = totalSales - totalExpenses;
    const stockCount = products.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);

    return { totalSales, totalExpenses, totalProfit, stockCount };
  }, [sales, expenses, products]);

  // Manejadores de Formularios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'products') {
        await addDoc(collection(db, "products"), {
          ...formData,
          createdAt: serverTimestamp()
        });
      } else if (activeTab === 'sales') {
        // Reducir stock al vender
        const product = products.find(p => p.id === formData.productId);
        if (product && product.stock >= formData.quantity) {
           await addDoc(collection(db, "sales"), {
            ...formData,
            total: formData.quantity * product.price,
            productName: product.name,
            createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "products", product.id), {
            stock: parseInt(product.stock) - parseInt(formData.quantity)
          });
        } else {
          alert("Stock insuficiente");
          return;
        }
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  // Renderizado Condicional: Login
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Cargando sistema...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Sistema Admin Pro</h1>
            <p className="text-gray-500">Ingresa tus credenciales</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Renderizado Principal: Dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Database className="w-6 h-6" /> AdminPro
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
            { id: 'sales', icon: ArrowUpCircle, label: 'Ventas' },
            { id: 'products', icon: Package, label: 'Inventario' },
            { id: 'expenses', icon: ArrowDownCircle, label: 'Gastos' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' ? 'Resumen General' : 
               activeTab === 'sales' ? 'Gestión de Ventas' :
               activeTab === 'products' ? 'Inventario de Productos' : 'Control de Gastos'}
            </h1>
            <p className="text-gray-500 text-sm">Bienvenido de nuevo, Admin</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
            >
              <Plus className="w-5 h-5" /> Nuevo Registro
            </button>
          </div>
        </header>

        {/* VISTA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Ventas Totales" value={`$${stats.totalSales}`} icon={Wallet} color="bg-green-500" trend={12} />
            <StatCard title="Gastos" value={`$${stats.totalExpenses}`} icon={Receipt} color="bg-red-500" trend={-5} />
            <StatCard title="Beneficio Neto" value={`$${stats.totalProfit}`} icon={TrendingUp} color="bg-blue-500" />
            <StatCard title="Stock Total" value={stats.stockCount} icon={Package} color="bg-purple-500" />
          </div>
        )}

        {/* VISTA: TABLAS DE DATOS */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  {activeTab === 'products' && (
                    <>
                      <th className="px-6 py-4 text-left font-medium">Producto</th>
                      <th className="px-6 py-4 text-left font-medium">Precio</th>
                      <th className="px-6 py-4 text-left font-medium">Stock</th>
                      <th className="px-6 py-4 text-left font-medium">Estado</th>
                    </>
                  )}
                  {activeTab === 'sales' && (
                    <>
                      <th className="px-6 py-4 text-left font-medium">Producto</th>
                      <th className="px-6 py-4 text-left font-medium">Cantidad</th>
                      <th className="px-6 py-4 text-left font-medium">Total</th>
                      <th className="px-6 py-4 text-left font-medium">Fecha</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(activeTab === 'products' ? products : sales)
                  .filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'products' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">${item.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.stock} un.
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.stock > 0 ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                        </td>
                      </>
                    )}
                     {activeTab === 'sales' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-800">{item.productName}</td>
                        <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">${item.total}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">Hace un momento</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL DE FORMULARIOS */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Nuevo ${activeTab === 'products' ? 'Producto' : 'Registro'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'products' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input 
                    required type="number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                  <input 
                    required type="number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'sales' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Producto</label>
                <select 
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setFormData({...formData, productId: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input 
                  required type="number" min="1"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
            </>
          )}

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 mt-6">
            Guardar Registro
          </button>
        </form>
      </Modal>
    </div>
  );
}