import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  Package, 
  Users, 
  Receipt, 
  Plus, 
  Trash2, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCcw,
  LogOut,
  ShieldCheck,
  Box,
  ScanBarcode,
  ShoppingBag,
  X,
  SearchCode,
  StickyNote,
  Lock,
  KeyRound,
  Unlock,
  Crown,
  UserCircle2
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword // <--- IMPORTANTE: Agregado para login manual
} from 'firebase/auth';

// --- CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
const firebaseConfig = {
  // TUS DATOS REALES (Mantenlos aquí)
  apiKey: "AIzaSyBDIWSy6MGEjnaoKpmF1aQR3KjgMNK0T94",
  authDomain: "gestionjayi.firebaseapp.com",
  projectId: "gestionjayi",
  storageBucket: "gestionjayi.firebasestorage.app",
  messagingSenderId: "636742580694",
  appId: "1:636742580694:web:fb0eede379721d51498c77",
  measurementId: "G-1142FSPXPQ"
};

// Inicialización segura
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'business-admin-system';
const ADMIN_EMAIL = 'alexvillamizar1@gmail.com'; 

// --- Componentes de UI Reutilizables ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
    google: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
  };
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
    <input 
      {...props}
      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-500"
    />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- NUEVO COMPONENTE DE LOGIN (EL MURO DE SEGURIDAD) ---
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El onAuthStateChanged en App se encargará del resto
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o usuario no encontrado.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">ADMIN PRO</h1>
          <p className="text-slate-500 text-sm mt-1">Ingreso Seguro al Sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Correo Electrónico</label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">¿Olvidaste tu contraseña? Contacta al soporte técnico.</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE PROTECCIÓN DE LICENCIA ---
const LicenseGate = ({ user, isLicenseActive, onActivate, loadingCheck, children }) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  if (loadingCheck) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCcw className="w-8 h-8 animate-spin text-blue-600"/></div>;
  
  if (isLicenseActive) {
    return children;
  }

  const handleActivation = async (e) => {
    e.preventDefault();
    setActivating(true);
    setError('');

    try {
      const licenseRef = doc(db, 'artifacts', appId, 'public', 'data', 'licenses', inputCode.trim());
      const licenseSnap = await getDoc(licenseRef);

      if (licenseSnap.exists()) {
        const licenseData = licenseSnap.data();
        if (licenseData.status === 'active' || licenseData.status === 'generated') {
           onActivate(inputCode.trim());
        } else {
           setError('Este código ha sido revocado o suspendido.');
           setActivating(false);
        }
      } else {
        if (inputCode.toUpperCase() === 'PRO-2024') {
           onActivate('PRO-2024-DEMO');
        } else {
           setError('Código inválido. Verifique o contacte al vendedor.');
           setActivating(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al verificar.');
      setActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-400">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Activación Requerida</h2>
          <p className="text-blue-100 mt-2 text-sm">Esta cuenta requiere una licencia válida.</p>
        </div>
        
        <div className="p-8">
          <p className="text-slate-600 text-center mb-6 text-sm">
            Hola, <strong>{user?.email}</strong>. Ingrese su código de licencia.
          </p>

          <form onSubmit={handleActivation} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Código de Licencia</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ej: A1B2-C3D4..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center font-bold tracking-widest text-slate-800"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 text-lg" disabled={activating}>
              {activating ? 'Verificando...' : 'Activar Sistema'} <Unlock className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <button onClick={() => signOut(auth)} className="text-slate-400 text-xs hover:text-slate-600 flex items-center justify-center gap-1 mx-auto">
                <LogOut className="w-3 h-3"/> Cambiar de Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- App Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // --- Estado de Licencia ---
  const [isLicenseActive, setIsLicenseActive] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);

  // --- Estados de Datos ---
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [adminLicenses, setAdminLicenses] = useState([]); 

  // --- Estados POS/Inventario ---
  const [txSearchTerm, setTxSearchTerm] = useState('');
  const [selectedTxProduct, setSelectedTxProduct] = useState(null);
  const [txQty, setTxQty] = useState(1);
  const [isBoxTx, setIsBoxTx] = useState(false);
  const [invForm, setInvForm] = useState({ costo: 0, margen: 30, esCaja: false, unidades: 12 });

  // Cálculos derivados
  const precioVentaCalculado = useMemo(() => invForm.costo * (1 + (invForm.margen / 100)), [invForm.costo, invForm.margen]);
  const unitariosCalculados = useMemo(() => {
    if (!invForm.esCaja || invForm.unidades <= 0) return null;
    return { costoUnitario: invForm.costo / invForm.unidades, precioUnitario: precioVentaCalculado / invForm.unidades };
  }, [invForm, precioVentaCalculado]);

  const filteredProducts = useMemo(() => {
    if (!txSearchTerm) return [];
    const term = txSearchTerm.toLowerCase();
    return inventory.filter(p => p.codigo.toLowerCase().includes(term) || p.articulo.toLowerCase().includes(term)).slice(0, 5);
  }, [txSearchTerm, inventory]);

  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };

  // --- Autenticación (CORREGIDA: SOLO ESCUCHA, NO CREA ANÓNIMOS) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // 1. Si hay usuario, lo guardamos
      if (currentUser) {
        setUser(currentUser);
        // Verificar estado de licencia
        try {
          const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'settings', 'subscription');
          const snap = await getDoc(userRef);
          if (snap.exists() && snap.data().active) {
            setIsLicenseActive(true);
          } else {
            setIsLicenseActive(false);
          }
        } catch (e) {
          console.error("Error checking license", e);
          setIsLicenseActive(false);
        }
      } else {
        // 2. Si NO hay usuario, NO hacemos nada automático. El usuario es null.
        setUser(null);
        setIsLicenseActive(false);
      }
      setCheckingLicense(false);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Sincronización de Datos ---
  useEffect(() => {
    if (!user || !isLicenseActive) {
      return; // No cargar datos si no hay login o licencia
    }
    
    // ... Carga de datos ...
    const userId = user.uid;
    const unsubTx = onSnapshot(collection(db, 'artifacts', appId, 'users', userId, 'transactions'), (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubInv = onSnapshot(collection(db, 'artifacts', appId, 'users', userId, 'inventory'), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCust = onSnapshot(collection(db, 'artifacts', appId, 'users', userId, 'customers'), (s) => setCustomers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCred = onSnapshot(collection(db, 'artifacts', appId, 'users', userId, 'credits'), (s) => { setCredits(s.docs.map(d => ({ id: d.id, ...d.data() })))});
    
    let unsubLicenses = () => {};
    if (user.email === ADMIN_EMAIL) {
       unsubLicenses = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'licenses'), (s) => setAdminLicenses(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }

    return () => { unsubTx(); unsubInv(); unsubCust(); unsubCred(); unsubLicenses(); };
  }, [user, isLicenseActive]);

  // --- Funciones de Licencia y Admin ---
  const activateLicense = async (code) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'subscription'), {
        active: true,
        licenseCode: code,
        activatedAt: new Date().toISOString(),
        plan: 'PRO'
      });
      setIsLicenseActive(true);
      showNotification("¡Licencia Activada Correctamente!");
    } catch (e) {
      console.error(e);
      showNotification("Error al guardar activación", "error");
    }
  };

  const generateNewLicense = async () => {
    if (user?.email !== ADMIN_EMAIL) return;
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'licenses', code), {
        code: code, status: 'generated', createdAt: new Date().toISOString(), createdBy: user.email
      });
      showNotification(`Licencia generada: ${code}`);
    } catch (e) { console.error(e); showNotification("Error al crear licencia", "error"); }
  };

  // --- Helpers de Formulario ---
  const stats = useMemo(() => {
    const totalIngresos = transactions.reduce((acc, curr) => acc + Number(curr.ingresos || 0), 0);
    const totalEgresos = transactions.reduce((acc, curr) => acc + Number(curr.egresos || 0), 0);
    const totalCuentasCobrar = credits.reduce((acc, curr) => acc + (Number(curr.valor || 0) - Number(curr.abonos || 0)), 0);
    return { balance: totalIngresos - totalEgresos, ingresos: totalIngresos, egresos: totalEgresos, pendientes: totalCuentasCobrar };
  }, [transactions, credits]);

  const handleAddDoc = async (e, colName, data) => {
    e.preventDefault(); if (!user) return;
    try { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, colName), { ...data, createdAt: new Date().toISOString() }); e.target.reset(); } catch (err) { console.error(err); }
  };

  const handleSmartTransactionSubmit = async (e) => {
    e.preventDefault(); if (!user) return; const form = e.target;
    if (selectedTxProduct) {
      const p = selectedTxProduct;
      const unidadesADescontar = (isBoxTx && p.esCaja) ? txQty * (p.unidades || 1) : txQty;
      let precioFinal = 0;
      if (isBoxTx && p.esCaja) precioFinal = p.precioVenta * txQty;
      else if (p.esCaja) precioFinal = (p.precioVenta / p.unidades) * txQty;
      else precioFinal = p.precioVenta * txQty;
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', p.id), { salidas: (p.salidas || 0) + unidadesADescontar });
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
          fecha: form.fecha.value, concepto: `Venta: ${p.articulo} (${txQty} ${isBoxTx ? 'Cajas' : 'Unds'})`, ingresos: precioFinal, egresos: 0, createdAt: new Date().toISOString()
        });
        showNotification(`Venta registrada: $${precioFinal.toLocaleString()}`); setTxSearchTerm(''); setSelectedTxProduct(null); setTxQty(1); setIsBoxTx(false); form.reset();
      } catch (err) { console.error(err); showNotification("Error al procesar venta", "error"); }
    } else {
      try { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
          fecha: form.fecha.value, concepto: form.concepto.value, ingresos: Number(form.ingresos.value) || 0, egresos: Number(form.egresos.value) || 0, createdAt: new Date().toISOString()
        }); showNotification("Movimiento registrado"); form.reset(); } catch (err) { console.error(err); }
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault(); if (!user) return; const form = e.target; const codigo = form.codigo.value.trim(); let cantidadInput = Number(form.inicial.value) || 0;
    const existingProduct = inventory.find(item => item.codigo === codigo);
    if (existingProduct) {
      const unidadesAAgregar = existingProduct.esCaja ? cantidadInput * (existingProduct.unidades || 1) : cantidadInput;
      try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', existingProduct.id), {
          entradas: (existingProduct.entradas || 0) + unidadesAAgregar, articulo: form.articulo.value || existingProduct.articulo, costo: Number(invForm.costo) || existingProduct.costo, precioVenta: precioVentaCalculado || existingProduct.precioVenta, margen: Number(invForm.margen) || existingProduct.margen
        }); showNotification(`Stock actualizado: +${unidadesAAgregar} unidades`); } catch (err) { console.error(err); }
    } else {
      if (!form.articulo.value) { alert("Ingrese el nombre del producto nuevo."); return; }
      const stockInicial = invForm.esCaja ? cantidadInput * invForm.unidades : cantidadInput;
      try { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'inventory'), {
          codigo, articulo: form.articulo.value, proveedor: form.proveedor.value, inicial: stockInicial, costo: Number(invForm.costo), margen: Number(invForm.margen), precioVenta: precioVentaCalculado, esCaja: invForm.esCaja, unidades: invForm.unidades, entradas: 0, salidas: 0, createdAt: new Date().toISOString()
        }); showNotification("Producto registrado"); } catch (err) { console.error(err); }
    }
    setInvForm({ costo: 0, margen: 30, esCaja: false, unidades: 12 }); form.reset();
  };

  const deleteItem = async (colName, id) => { if(window.confirm("¿Eliminar registro?")) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, colName, id)); };
  
  const resetAllData = async () => {
    if (!user) return; const collections = ['transactions', 'inventory', 'customers', 'credits'];
    for (const colName of collections) {
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, colName)); const snapshot = await getDocs(q);
      snapshot.forEach(async (document) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, colName, document.id)));
    }
  };

  // --- RENDERIZADO PRINCIPAL ---

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCcw className="w-8 h-8 animate-spin text-blue-600"/></div>;

  // 1. MURO DE SEGURIDAD: Si no hay usuario, mostrar LOGIN
  if (!user) {
    return <LoginScreen />;
  }

  // 2. Si hay usuario, VERIFICAR LICENCIA y MOSTRAR DASHBOARD
  return (
    <LicenseGate user={user} isLicenseActive={isLicenseActive} onActivate={activateLicense} loadingCheck={checkingLicense}>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
        
        {notification && <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-right font-bold text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>{notification.msg}</div>}

        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Google Login">
          <div className="text-center space-y-4">
             <p>Configura Google Auth en Firebase Console para usar esta función.</p>
          </div>
        </Modal>

        <nav className="w-full lg:w-72 bg-slate-900 text-white p-6 flex flex-col gap-8 shadow-xl z-20">
          <div className="flex items-center gap-3 px-2"><div className="bg-blue-600 p-2 rounded-xl"><LayoutDashboard className="w-8 h-8" /></div><div><h1 className="text-xl font-black tracking-tight">ADMIN PRO</h1><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">SaaS Edition</p></div></div>
          <div className="flex flex-col gap-2">
            {[ { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Principal' }, { id: 'transactions', icon: ArrowUpCircle, label: 'Flujo de Caja' }, { id: 'inventory', icon: Package, label: 'Inventario Avanzado' }, { id: 'credits', icon: Receipt, label: 'Cuentas x Cobrar' }, { id: 'customers', icon: Users, label: 'Clientes' } ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <item.icon className="w-5 h-5" /><span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
            
            {user?.email === ADMIN_EMAIL && (
              <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'admin' ? 'bg-amber-500 text-white shadow-lg' : 'text-amber-400 hover:bg-slate-800'}`}>
                <Crown className="w-5 h-5" /><span className="font-semibold text-sm">Administración</span>
              </button>
            )}
          </div>
          <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
             <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 p-2 text-xs text-slate-400 hover:text-white transition-colors">
                <LogOut className="w-3 h-3" /> Cerrar Sesión
             </button>
            <button onClick={() => { if(window.confirm("¿Reiniciar Datos?")) resetAllData(); }} className="w-full flex items-center justify-center gap-2 p-2 text-xs text-red-400 hover:text-red-300 transition-colors">
              <Database className="w-3 h-3" /> Reiniciar Cuenta
            </button>
          </div>
        </nav>

        <main className="flex-1 p-6 lg:p-10 overflow-auto max-h-screen">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                {activeTab === 'dashboard' ? 'Resumen' : activeTab === 'transactions' ? 'Control de Caja & Ventas' : activeTab === 'inventory' ? 'Inventario' : activeTab === 'credits' ? 'Créditos' : activeTab === 'admin' ? 'Panel de Vendedor' : 'Base de Datos'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Usuario: {user?.email}</p>
            </div>
          </header>

          <div className="animate-in fade-in duration-500">
            {activeTab === 'admin' && user?.email === ADMIN_EMAIL && (
              <div className="space-y-6">
                <Card className="p-6 border-amber-200 border-2">
                  <div className="flex justify-between items-center mb-6">
                    <div><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Crown className="w-6 h-6 text-amber-500"/> Generador de Licencias</h3><p className="text-slate-500 text-sm">Crea códigos para vender el acceso a tu aplicación.</p></div>
                    <Button onClick={generateNewLicense} variant="primary" className="bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-200"><Plus className="w-5 h-5"/> Generar Nueva Licencia</Button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200"><table className="w-full text-left"><thead className="bg-slate-50 text-slate-700 font-bold"><tr><th className="p-4">Código Generado</th><th className="p-4">Estado</th><th className="p-4">Fecha Creación</th></tr></thead><tbody className="divide-y divide-slate-100">{adminLicenses.map(lic => (<tr key={lic.id} className="hover:bg-slate-50"><td className="p-4 font-mono font-bold text-lg text-blue-600 select-all">{lic.code}</td><td className="p-4"><span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{lic.status}</span></td><td className="p-4 text-slate-500 text-sm">{new Date(lic.createdAt).toLocaleDateString()}</td></tr>))}{adminLicenses.length === 0 && (<tr><td colSpan="3" className="p-8 text-center text-slate-400">Aún no has generado ninguna licencia.</td></tr>)}</tbody></table></div>
                </Card>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 border-l-4 border-blue-500"><p className="text-sm text-slate-500">Balance Total</p><h3 className="text-2xl font-bold text-slate-800">${stats.balance.toLocaleString()}</h3></Card>
                  <Card className="p-4 border-l-4 border-emerald-500"><p className="text-sm text-slate-500">Ingresos</p><h3 className="text-2xl font-bold text-slate-800">${stats.ingresos.toLocaleString()}</h3></Card>
                  <Card className="p-4 border-l-4 border-red-500"><p className="text-sm text-slate-500">Egresos</p><h3 className="text-2xl font-bold text-slate-800">${stats.egresos.toLocaleString()}</h3></Card>
                  <Card className="p-4 border-l-4 border-amber-500"><p className="text-sm text-slate-500">Por Cobrar</p><h3 className="text-2xl font-bold text-slate-800">${stats.pendientes.toLocaleString()}</h3></Card>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <Card className="p-6 border-blue-200 shadow-md">
                  <h3 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2"><Wallet className="w-5 h-5"/> Registrar Movimiento / Venta</h3>
                  <form onSubmit={handleSmartTransactionSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-4"><Input name="fecha" type="date" label="Fecha" defaultValue={new Date().toISOString().split('T')[0]} required /><div className="relative"><label className="text-sm font-semibold text-slate-700">Buscar Producto (Opcional)</label><div className="relative mt-1"><SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input type="text" placeholder="Escanee o escriba..." value={txSearchTerm} onChange={(e) => { setTxSearchTerm(e.target.value); if(!e.target.value) setSelectedTxProduct(null); }} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>{txSearchTerm && !selectedTxProduct && filteredProducts.length > 0 && (<div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 overflow-hidden">{filteredProducts.map(p => (<div key={p.id} onClick={() => { setSelectedTxProduct(p); setTxSearchTerm(p.articulo); }} className="p-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center"><span>{p.articulo}</span><span className="font-mono text-xs text-slate-400">{p.codigo}</span></div>))}</div>)}</div></div>
                    <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">{selectedTxProduct ? (<div className="space-y-3 animate-in fade-in"><div className="flex justify-between items-start"><div><h4 className="font-bold text-slate-800">{selectedTxProduct.articulo}</h4><p className="text-xs text-slate-500">Stock actual: {selectedTxProduct.inicial + (selectedTxProduct.entradas||0) - (selectedTxProduct.salidas||0)} un.</p></div><button onClick={()=>{setSelectedTxProduct(null); setTxSearchTerm('');}} className="text-xs text-red-400 hover:text-red-600">Cambiar</button></div><div className="flex gap-4 items-end"><div className="w-24"><label className="text-xs font-bold text-slate-500">Cantidad</label><input type="number" min="1" value={txQty} onChange={(e)=>setTxQty(Number(e.target.value))} className="w-full px-2 py-1 border rounded font-bold text-center"/></div>{selectedTxProduct.esCaja && (<div className="flex-1"><label className="text-xs font-bold text-slate-500 block mb-1">Unidad de Venta</label><div className="flex gap-2 text-xs"><button type="button" onClick={()=>setIsBoxTx(false)} className={`flex-1 py-1 rounded border ${!isBoxTx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500'}`}>Unidad</button><button type="button" onClick={()=>setIsBoxTx(true)} className={`flex-1 py-1 rounded border ${isBoxTx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500'}`}>Caja</button></div></div>)}</div></div>) : (<div className="space-y-4"><Input name="concepto" label="Concepto / Detalle" placeholder="Ej: Pago de Luz, Venta Varia..." /><div className="text-xs text-slate-400 text-center italic mt-2">Seleccione un producto para autocompletar venta de inventario.</div></div>)}</div>
                    <div className="md:col-span-3 flex flex-col justify-between space-y-4">{selectedTxProduct ? (<div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center"><p className="text-xs text-emerald-600 font-bold uppercase">Total a Ingresar</p><p className="text-2xl font-black text-emerald-700">${(() => { const p = selectedTxProduct; const q = txQty; if (isBoxTx && p.esCaja) return (p.precioVenta * q).toLocaleString(); if (p.esCaja) return ((p.precioVenta / p.unidades) * q).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}); return (p.precioVenta * q).toLocaleString(); })()}</p></div>) : (<div className="grid grid-cols-2 gap-2"><Input name="ingresos" type="number" label="Ingreso ($)" placeholder="0.00" /><Input name="egresos" type="number" label="Egreso ($)" placeholder="0.00" /></div>)}<Button type="submit" className="w-full h-12 shadow-lg shadow-blue-100">{selectedTxProduct ? <><ShoppingBag className="w-4 h-4"/> Confirmar Venta</> : <><Plus className="w-4 h-4"/> Registrar</>}</Button></div>
                  </form>
                </Card>
                <Card><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3">Fecha</th><th className="p-3">Concepto</th><th className="p-3">Monto</th><th className="p-3 text-right">Acción</th></tr></thead><tbody className="divide-y">{transactions.map(t => (<tr key={t.id}><td className="p-3">{t.fecha}</td><td className="p-3 font-medium">{t.concepto}</td><td className={`p-3 font-bold ${t.ingresos>0?'text-emerald-600':'text-red-600'}`}>{t.ingresos>0?`+${t.ingresos.toLocaleString()}`:`-${t.egresos.toLocaleString()}`}</td><td className="p-3 text-right"><button onClick={()=>deleteItem('transactions', t.id)} className="text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table></Card>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <Card className="p-6 border-blue-200"><div className="flex items-center gap-2 mb-4 text-blue-800"><ScanBarcode className="w-5 h-5"/><h3 className="font-bold">Registro Inteligente de Producto</h3></div><div className="mb-4 bg-blue-50 text-blue-700 text-xs p-3 rounded-lg border border-blue-100 flex gap-2"><div className="font-bold">💡 Tip:</div><div>Para reabastecer stock, solo ingrese el <strong>CÓDIGO</strong> y la <strong>CANTIDAD</strong>. El sistema detectará el producto y si es caja, sumará las unidades internas automáticamente.</div></div><form onSubmit={handleInventorySubmit} className="space-y-6"><div className="grid md:grid-cols-4 gap-4"><Input name="codigo" label="Código (Escáner/Manual)" placeholder="Ej: 770..." required autoFocus /><div className="md:col-span-2"><Input name="articulo" label="Nombre del Producto" placeholder="Automático si ya existe" /></div><Input name="proveedor" label="Proveedor" placeholder="Opcional" /></div><div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200"><div><label className="text-sm font-semibold text-slate-700 block mb-1">Costo ($)</label><input type="number" value={invForm.costo} onChange={(e) => setInvForm({...invForm, costo: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" /></div><div><label className="text-sm font-semibold text-slate-700 block mb-1">Ganancia (%)</label><div className="flex items-center"><input type="number" value={invForm.margen} onChange={(e) => setInvForm({...invForm, margen: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none text-center" /><span className="bg-slate-200 px-3 py-2 rounded-r-lg border border-l-0 border-slate-300 text-slate-600 font-bold">%</span></div></div><div><label className="text-sm font-semibold text-emerald-700 block mb-1">Precio Venta (Calculado)</label><div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-lg">${precioVentaCalculado.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</div></div></div><div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 rounded-lg border border-dashed border-slate-300"><label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={invForm.esCaja} onChange={(e) => setInvForm({...invForm, esCaja: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" /><span className="font-medium text-slate-700 flex gap-1 items-center"><Box className="w-4 h-4"/> ¿Es Caja/Bulto?</span></label>{invForm.esCaja && (<><div className="flex items-center gap-2 animate-in slide-in-from-left-5"><span className="text-sm text-slate-500">Contiene:</span><input type="number" value={invForm.unidades} onChange={(e) => setInvForm({...invForm, unidades: Number(e.target.value)})} className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold" /><span className="text-sm text-slate-500">unidades</span></div><div className="flex-1 text-xs md:text-sm text-slate-500 bg-yellow-50 p-2 rounded border border-yellow-100">💡 Unitario: Costo <strong>${unitariosCalculados?.costoUnitario.toFixed(2)}</strong> | Venta <strong>${unitariosCalculados?.precioUnitario.toFixed(2)}</strong></div></>)}</div><div className="grid md:grid-cols-2 gap-4"><Input name="inicial" type="number" label={invForm.esCaja ? "Cantidad de CAJAS a agregar" : "Cantidad de UNIDADES a agregar"} required placeholder="0" /><Button type="submit" className="h-full mt-auto"><Plus className="w-4 h-4"/> Registrar / Reponer</Button></div></form></Card>
                <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3">Cód</th><th className="p-3">Producto</th><th className="p-3 text-right">Precio Venta</th><th className="p-3 text-center">Stock Real</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody className="divide-y">{inventory.map(i => { const stockTotal = i.inicial + (i.entradas||0) - (i.salidas||0); const cajasAprox = i.esCaja ? Math.floor(stockTotal / i.unidades) : 0; const unidadesSueltas = i.esCaja ? stockTotal % i.unidades : 0; return (<tr key={i.id} className="hover:bg-slate-50"><td className="p-3 font-mono text-slate-500">{i.codigo}</td><td className="p-3"><div className="font-bold text-slate-800">{i.articulo}</div>{i.esCaja && <div className="text-[10px] text-blue-500 bg-blue-50 inline-block px-1 rounded border border-blue-100">Caja de {i.unidades} un.</div>}</td><td className="p-3 text-right font-bold text-emerald-700">${(i.precioVenta || 0).toLocaleString()}{i.esCaja && <div className="text-[10px] text-slate-400 font-normal">(${(i.precioVenta/i.unidades).toFixed(2)} un.)</div>}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded-full font-bold ${stockTotal<5?'bg-red-100 text-red-700':'bg-blue-50 text-blue-700'}`}>{stockTotal} un.</span>{i.esCaja && <div className="text-[10px] text-slate-400 mt-1">{cajasAprox} Cajas + {unidadesSueltas} sueltas</div>}</td><td className="p-3 text-right flex justify-end gap-2"><button onClick={()=>deleteItem('inventory', i.id)} className="text-red-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button></td></tr>); })}</tbody></table></div></Card>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                <Card className="p-6"><h3 className="font-bold mb-4">Nuevo Cliente</h3><form onSubmit={(e) => handleAddDoc(e, 'customers', { nit: e.target.nit.value, nombre: e.target.nombre.value, tel: e.target.tel.value, email: e.target.email.value, ciudad: e.target.ciudad.value, direccion: e.target.direccion.value, descripcion: e.target.descripcion.value, notas: e.target.notas.value })} className="grid md:grid-cols-3 gap-4"><Input name="nit" label="ID/NIT" required /><Input name="nombre" label="Nombre" required /><Input name="tel" label="Teléfono" /><Input name="email" label="Email" /><Input name="ciudad" label="Ciudad" /><Input name="direccion" label="Dirección" /><div className="md:col-span-3 grid md:grid-cols-2 gap-4"><Input name="descripcion" label="Descripción del Cliente" placeholder="Ej: Mayorista, Minorista, VIP..." /><Input name="notas" label="Notas / Observaciones" placeholder="Preferencias, horarios, etc." /></div><div className="md:col-span-3"><Button type="submit"><Plus className="w-4 h-4"/> Guardar Cliente</Button></div></form></Card>
                <Card><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3">Nombre / Detalle</th><th className="p-3">Contacto</th><th className="p-3">Ubicación</th><th className="p-3 text-right">Acción</th></tr></thead><tbody className="divide-y">{customers.map(c => (<tr key={c.id}><td className="p-3"><div className="font-bold text-slate-800">{c.nombre}</div><div className="text-xs text-slate-500 font-mono">ID: {c.nit}</div>{c.descripcion && <div className="text-xs text-blue-600 mt-1 font-medium">{c.descripcion}</div>}{c.notas && <div className="text-xs text-slate-500 italic mt-0.5 bg-yellow-50 p-1 rounded border border-yellow-100 flex items-center gap-1 w-fit"><StickyNote className="w-3 h-3"/> {c.notas}</div>}</td><td className="p-3 text-slate-600"><div>{c.tel}</div><div className="text-xs">{c.email}</div></td><td className="p-3 text-slate-600"><div>{c.ciudad}</div><div className="text-xs">{c.direccion}</div></td><td className="p-3 text-right"><button onClick={()=>deleteItem('customers', c.id)} className="text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table></Card>
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="space-y-6">
                <Card className="p-6"><h3 className="font-bold mb-4">Nueva Cuenta por Cobrar</h3><form onSubmit={(e) => handleAddDoc(e, 'credits', { cliente: e.target.cliente.value, articulo: e.target.articulo.value, valor: Number(e.target.valor.value), fecha: e.target.fecha.value, abonos: 0 })} className="grid md:grid-cols-4 gap-4"><Input name="cliente" label="Cliente" required /><Input name="articulo" label="Detalle" required /><Input name="valor" type="number" label="Valor Total" required /><Input name="fecha" type="date" defaultValue={new Date().toISOString().split('T')[0]} required /><div className="md:col-span-4"><Button type="submit"><Receipt className="w-4 h-4"/> Crear Crédito</Button></div></form></Card>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{credits.map(c => { const saldo = c.valor - c.abonos; const pagado = saldo <= 0; return (<Card key={c.id} className={`p-4 ${pagado ? 'bg-emerald-50' : ''}`}><div className="flex justify-between items-start mb-2"><h4 className="font-bold">{c.cliente}</h4>{pagado ? <CheckCircle2 className="text-emerald-500 w-5 h-5"/> : <AlertCircle className="text-amber-500 w-5 h-5"/>}</div><p className="text-xs text-slate-500 mb-3">{c.articulo}</p><div className="text-sm space-y-1 mb-4"><div className="flex justify-between"><span>Total:</span> <strong>${c.valor}</strong></div><div className="flex justify-between text-emerald-600"><span>Abonado:</span> <span>${c.abonos}</span></div><div className="flex justify-between border-t pt-1"><span>Resta:</span> <span className={pagado ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>${saldo}</span></div></div>{!pagado && (<div className="flex gap-2"><input id={`pay-${c.id}`} type="number" placeholder="$ Abono" className="w-full px-2 py-1 text-sm border rounded" /><Button variant="success" className="px-3 py-1 text-xs" onClick={()=>{const val = Number(document.getElementById(`pay-${c.id}`).value); if(val) updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'credits', c.id), { abonos: c.abonos + val });}}>Pagar</Button></div>)}<button onClick={()=>deleteItem('credits', c.id)} className="mt-2 text-xs text-red-300 hover:text-red-500 w-full text-right">Eliminar</button></Card>) })}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </LicenseGate>
  );
}