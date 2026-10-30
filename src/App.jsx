import React, { useState, useEffect } from 'react';
import { Home, DollarSign, AlertTriangle, Package, Plus, Clock, Trash2, Edit2, TrendingUp, ShieldAlert, Calendar, Filter, X, BarChart3, ArrowUpRight, CheckCircle2, Eye, MapPin, Droplet, Layers, Activity } from 'lucide-react';
import ExpenseModal from './components/ExpenseModal';
import IssueModal from './components/IssueModal';
import InventoryModal from './components/InventoryModal';
import LotModal from './components/LotModal';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [editingLot, setEditingLot] = useState(null);

  const [lots, setLots] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [modalDetail, setModalDetail] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sincronización en tiempo real con Firestore
  useEffect(() => {
    const unsubscribeExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setExpenses(data);
    });

    const unsubscribeIssues = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setIssues(data);
    });

    const unsubscribeInventory = onSnapshot(collection(db, "inventory"), async (snapshot) => {
      if (snapshot.empty) {
        const defaultItems = [
          { name: 'Glifosato 48%', stock: 450, unit: 'Litros', min: 200, createdAt: Date.now() },
          { name: 'Urea Granulada', stock: 12000, unit: 'Kilos', min: 5000, createdAt: Date.now() },
          { name: 'Gasoil Grado 2', stock: 1500, unit: 'Litros', min: 1000, createdAt: Date.now() }
        ];
        for (const item of defaultItems) {
          await addDoc(collection(db, "inventory"), item);
        }
      } else {
        const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setInventory(data);
      }
    });

    const unsubscribeLots = onSnapshot(collection(db, "lots"), async (snapshot) => {
      if (snapshot.empty) {
        const defaultLots = [
          { name: 'Lote 1 - Principal', hectares: '100', crop: 'Soja 1ra', soil: 'Franco', water: 'Óptimo', notes: 'Lote principal de alta producción', createdAt: Date.now() },
          { name: 'Lote 2 - Norte', hectares: '75', crop: 'Maíz Tardío', soil: 'Arenoso', water: 'Estrés moderado', notes: 'Requiere seguimiento hídrico', createdAt: Date.now() }
        ];
        for (const l of defaultLots) {
          await addDoc(collection(db, "lots"), l);
        }
      } else {
        const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLots(data);
      }
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeIssues();
      unsubscribeInventory();
      unsubscribeLots();
    };
  }, []);

  const filteredExpenses = expenses.filter(exp => {
    if (!exp.createdAt) return true;
    const expDate = new Date(exp.createdAt).toISOString().split('T')[0];
    if (startDate && expDate < startDate) return false;
    if (endDate && expDate > endDate) return false;
    return true;
  });

  const expensesARS = filteredExpenses.filter(exp => exp.currency === 'ARS' || !exp.currency);
  const expensesUSD = filteredExpenses.filter(exp => exp.currency === 'USD');

  const totalARS = expensesARS.reduce((acc, exp) => acc + (parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0), 0);
  const totalUSD = expensesUSD.reduce((acc, exp) => acc + (parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0), 0);

  // --- CÁLCULOS ANALÍTICOS PARA EL DASHBOARD ---
  // 1. Lote con mayor cantidad de intervenciones (monitoreo / alertas)
  const interventionCounts = issues.reduce((acc, issue) => {
    acc[issue.lote] = (acc[issue.lote] || 0) + 1;
    return acc;
  }, {});
  let mostIntervenedLot = 'Sin registros';
  let maxInterventions = 0;
  Object.entries(interventionCounts).forEach(([lote, count]) => {
    if (count > maxInterventions) {
      maxInterventions = count;
      mostIntervenedLot = lote;
    }
  });

  // 2. Lote con mayor gasto acumulado
  const lotExpenseCounts = filteredExpenses.reduce((acc, exp) => {
    const num = parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0;
    const val = exp.currency === 'USD' ? num * 1200 : num; // Conversión referencial para estimación
    acc[exp.lote] = (acc[exp.lote] || 0) + val;
    return acc;
  }, {});
  let highestExpenseLot = 'Sin registros';
  let maxLotExpense = 0;
  Object.entries(lotExpenseCounts).forEach(([lote, total]) => {
    if (total > maxLotExpense) {
      maxLotExpense = total;
      highestExpenseLot = lote;
    }
  });

  // 3. Mayor gasto individual registrado
  let highestSingleExpense = { amount: 0, notes: 'Ninguno', currency: 'ARS' };
  filteredExpenses.forEach(exp => {
    const num = parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0;
    if (num > (parseFloat(String(highestSingleExpense.amount).replace(/\./g, '').replace(',', '.')) || 0)) {
      highestSingleExpense = exp;
    }
  });

  // 4. Tipo de gasto / Categoría más frecuente
  const categoryCounts = filteredExpenses.reduce((acc, exp) => {
    const cat = exp.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  let topCategory = 'Sin datos';
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });
  // ---------------------------------------------

  // CRUD Lotes detallados
  const handleSaveLot = async (lotDataInput) => {
    const payload = {
      name: lotDataInput.name,
      hectares: lotDataInput.hectares || '0',
      crop: lotDataInput.crop || 'Sin definir',
      soil: lotDataInput.soil || 'Franco',
      water: lotDataInput.water || 'Óptimo',
      notes: lotDataInput.notes || '',
      createdAt: editingLot ? editingLot.createdAt : Date.now()
    };
    if (editingLot) {
      await updateDoc(doc(db, "lots", editingLot.id), payload);
    } else {
      await addDoc(collection(db, "lots"), payload);
    }
    setEditingLot(null);
    setIsLotModalOpen(false);
  };

  const handleDeleteLot = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este lote?")) {
      await deleteDoc(doc(db, "lots", id));
    }
  };

  // CRUD Gastos
  const handleSaveExpense = async (expenseDataInput) => {
    const payload = {
      lote: expenseDataInput.lote,
      category: expenseDataInput.category,
      amount: Number(expenseDataInput.amount).toLocaleString('es-AR'),
      currency: expenseDataInput.currency,
      supplier: expenseDataInput.supplier || '',
      notes: expenseDataInput.notes || '',
      date: expenseDataInput.date || new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
      createdAt: editingExpense ? editingExpense.createdAt : Date.now()
    };
    if (editingExpense) {
      await updateDoc(doc(db, "expenses", editingExpense.id), payload);
    } else {
      await addDoc(collection(db, "expenses"), payload);
    }
    setEditingExpense(null);
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este gasto?")) {
      await deleteDoc(doc(db, "expenses", id));
    }
  };

  // CRUD Fallas
  const handleSaveIssue = async (newIssue) => {
    await addDoc(collection(db, "issues"), {
      lote: newIssue.lote,
      type: newIssue.issueType,
      severity: newIssue.severity,
      damagePercent: newIssue.damagePercent || '10',
      description: newIssue.description,
      image: newIssue.image || null,
      status: 'Pendiente de Receta',
      time: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
      createdAt: Date.now()
    });
    setIsIssueModalOpen(false);
  };

  const handleUpdateIssueStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Pendiente de Receta' ? 'En Tratamiento' : currentStatus === 'En Tratamiento' ? 'Resuelto' : 'Pendiente de Receta';
    await updateDoc(doc(db, "issues", id), { status: nextStatus });
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm("¿Eliminar este registro de monitoreo?")) {
      await deleteDoc(doc(db, "issues", id));
    }
  };

  // CRUD Insumos
  const handleSaveInventoryItem = async (itemDataInput) => {
    const payload = {
      name: itemDataInput.name,
      stock: Number(itemDataInput.stock) || 0,
      unit: itemDataInput.unit || 'Unidades',
      min: Number(itemDataInput.min) || 0,
      createdAt: editingInventoryItem ? editingInventoryItem.createdAt : Date.now()
    };
    if (editingInventoryItem) {
      await updateDoc(doc(db, "inventory", editingInventoryItem.id), payload);
    } else {
      await addDoc(collection(db, "inventory"), payload);
    }
    setEditingInventoryItem(null);
    setIsInventoryModalOpen(false);
  };

  const handleDeleteInventoryItem = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este insumo?")) {
      await deleteDoc(doc(db, "inventory", id));
    }
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col bg-gray-100 select-none">
      <header className="bg-emerald-800 text-white px-4 py-3.5 shadow-md sticky top-0 z-40 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-base sm:text-lg tracking-wide">AgroGestión Zeta</h1>
          <p className="text-[10px] text-emerald-200">Operaciones de Campo</p>
        </div>
        <span className="text-[11px] bg-emerald-700/95 border border-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">Online ☁️</span>
      </header>

      <main className="flex-1 p-3 sm:p-4 max-w-5xl w-full mx-auto space-y-4">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-emerald-700/60 text-emerald-100 px-2 py-0.5 rounded font-medium">Panel Operativo</span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">Resumen del Establecimiento</h2>
                </div>
                <div className="bg-emerald-700/50 p-2 rounded-xl border border-emerald-600/50">
                  <TrendingUp size={20} className="text-emerald-200" />
                </div>
              </div>

              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 space-y-2 text-xs">
                <span className="flex items-center text-emerald-200 font-medium">
                  <Calendar size={14} className="mr-1.5" /> Filtrar período analítico:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-emerald-300">Desde:</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-emerald-900/60 border border-emerald-600 text-white px-2 py-1.5 rounded-lg text-xs outline-none w-full" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-emerald-300">Hasta:</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-emerald-900/60 border border-emerald-600 text-white px-2 py-1.5 rounded-lg text-xs outline-none w-full" />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-1.5 rounded-lg font-medium transition text-center mt-1">Limpiar Filtro</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => setModalDetail('ars')} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2 cursor-pointer hover:border-emerald-500 transition active:scale-95">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">Gastos ARS</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800 truncate">$ {totalARS.toLocaleString('es-AR')}</p>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">Ver detalle <ArrowUpRight size={12} className="ml-0.5" /></span>
                </div>
              </div>

              <div onClick={() => setModalDetail('usd')} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2 cursor-pointer hover:border-blue-500 transition active:scale-95">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">Gastos USD</span>
                  <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"><DollarSign size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800 truncate">U$S {totalUSD.toLocaleString('es-AR')}</p>
                  <span className="text-[10px] text-blue-600 font-medium flex items-center">Ver detalle <ArrowUpRight size={12} className="ml-0.5" /></span>
                </div>
              </div>

              <div onClick={() => setModalDetail('movements')} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2 cursor-pointer hover:border-purple-500 transition active:scale-95">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">Movimientos</span>
                  <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"><Package size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800">{filteredExpenses.length} <span className="text-xs font-normal text-gray-500">ítems</span></p>
                  <span className="text-[10px] text-purple-600 font-medium flex items-center">Ver resumen <ArrowUpRight size={12} className="ml-0.5" /></span>
                </div>
              </div>

              <div onClick={() => setModalDetail('alerts')} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2 cursor-pointer hover:border-amber-500 transition active:scale-95">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">Alertas</span>
                  <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg"><ShieldAlert size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800">{issues.length} <span className="text-xs font-normal text-gray-500">lotes</span></p>
                  <span className="text-[10px] text-amber-600 font-medium flex items-center">Ver incidencias <ArrowUpRight size={12} className="ml-0.5" /></span>
                </div>
              </div>
            </div>

            {/* MÓDULO DE ANALÍTICAS Y MÉTRICAS INTELIGENTES */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Activity size={18} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Analíticas y Métricas del Establecimiento</h3>
                  <p className="text-[11px] text-gray-400">Indicadores clave extraídos de tus registros</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">Lote más intervenido (Monitoreo)</span>
                  <p className="font-extrabold text-gray-900 text-sm flex items-center">
                    📍 {mostIntervenedLot} <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{maxInterventions} alertas</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">Lote con mayor inversión</span>
                  <p className="font-extrabold text-gray-900 text-sm flex items-center">
                    💰 {highestExpenseLot}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">Mayor gasto individual</span>
                  <p className="font-extrabold text-emerald-700 text-sm">
                    {highestSingleExpense.currency === 'USD' ? 'U$S' : '$'} {highestSingleExpense.amount} <span className="text-gray-500 font-normal text-xs">({highestSingleExpense.notes || 'Sin nota'})</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">Tipo de gasto más frecuente</span>
                  <p className="font-extrabold text-blue-700 text-sm">
                    🏷️ {topCategory} <span className="text-gray-500 font-normal text-xs">({maxCatCount} registros)</span>
                  </p>
                </div>
              </div>

              {/* Gráfico de Barras Proporcional de Intervenciones por Lote */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Distribución de Intervenciones por Lote</h4>
                <div className="space-y-2">
                  {Object.keys(interventionCounts).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">Sin datos de intervenciones a campo.</p>
                  ) : (
                    Object.entries(interventionCounts).map(([lote, count]) => {
                      const percentage = issues.length > 0 ? Math.round((count / issues.length) * 100) : 0;
                      return (
                        <div key={lote} className="space-y-1 text-xs">
                          <div className="flex justify-between font-semibold text-gray-700">
                            <span>{lote}</span>
                            <span className="text-emerald-700">{count} intervenciones ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><BarChart3 size={18} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Tendencia y Comparativa de Costos</h3>
                  <p className="text-[11px] text-gray-400">Distribución financiera del establecimiento</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Proporción de Inversión por Moneda</span>
                  <span className="text-emerald-700">ARS vs USD</span>
                </div>
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex shadow-inner">
                  <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${totalARS + totalUSD > 0 ? 50 : 50}%` }}></div>
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${totalARS + totalUSD > 0 ? 50 : 50}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-medium">
                  <span className="text-emerald-700 font-bold">ARS: $ {totalARS.toLocaleString('es-AR')}</span>
                  <span className="text-blue-700 font-bold">USD: U$S {totalUSD.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <h3 className="font-bold text-gray-800 text-sm mb-2.5">Acciones Rápidas en Campo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="bg-emerald-600 active:bg-emerald-700 text-white p-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-sm transition">
                  <Plus size={18} className="mr-2" /> Cargar Nuevo Gasto
                </button>
                <button onClick={() => setIsIssueModalOpen(true)} className="bg-blue-600 active:bg-blue-700 text-white p-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-sm transition">
                  <Plus size={18} className="mr-2" /> Reportar Falla a Campo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GASTOS */}
        {activeTab === 'expenses' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Control de Gastos</h2>
              <button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm">+ Nuevo Gasto</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {filteredExpenses.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">No se encontraron gastos.</p>
              ) : (
                filteredExpenses.map((exp) => (
                  <div key={exp.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{exp.notes || exp.category}</p>
                      <span className="text-[11px] text-gray-500 block mt-0.5">{exp.lote} {exp.supplier ? `• ${exp.supplier}` : ''} • {exp.date}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-emerald-700 text-xs sm:text-sm">{exp.currency === 'USD' ? 'U$S' : '$'} {exp.amount}</span>
                      <button onClick={() => { setEditingExpense(exp); setIsExpenseModalOpen(true); }} className="text-gray-400 hover:text-blue-600 p-1.5"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-400 hover:text-red-600 p-1.5"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MONITOREO */}
        {activeTab === 'issues' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Monitoreo a Campo</h2>
                <p className="text-xs text-gray-400">Seguimiento de plagas y estado sanitario</p>
              </div>
              <button onClick={() => setIsIssueModalOpen(true)} className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm transition">
                + Reportar Falla
              </button>
            </div>

            <div className="space-y-3">
              {issues.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400 border border-gray-100 shadow-sm">
                  No hay fallas o incidencias reportadas en los lotes.
                </div>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3 transition hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${issue.severity === 'Crítico' ? 'bg-red-100 text-red-800' : issue.severity === 'Moderado' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {issue.severity}
                          </span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                            Daño: ~{issue.damagePercent || '10'}%
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-900 mt-1">{issue.type}</h4>
                        <p className="text-xs font-semibold text-emerald-700">📍 {issue.lote}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-[11px] text-gray-400">{issue.time}</span>
                        <button onClick={() => handleDeleteIssue(issue.id)} className="text-gray-300 hover:text-red-600 p-1 transition" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {issue.image && (
                        <div onClick={() => setViewingImage(issue.image)} className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden cursor-pointer group flex-shrink-0 border border-gray-200">
                          <img src={issue.image} alt="Evidencia" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                            <Eye size={18} />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">{issue.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button 
                        onClick={() => handleUpdateIssueStatus(issue.id, issue.status)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center shadow-xs ${
                          issue.status === 'Resuelto' ? 'bg-emerald-100 text-emerald-800' : issue.status === 'En Tratamiento' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <CheckCircle2 size={13} className="mr-1.5" /> Estado: {issue.status || 'Pendiente de Receta'} (Tocar para cambiar)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INVENTARIO */}
        {activeTab === 'inventory' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Depósito e Insumos</h2>
              <button onClick={() => { setEditingInventoryItem(null); setIsInventoryModalOpen(true); }} className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm">+ Nuevo Insumo</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {inventory.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">No hay insumos registrados.</p>
              ) : (
                inventory.map((item) => (
                  <div key={item.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{item.name}</p>
                      <span className="text-[11px] text-gray-500 block">Stock Mínimo Alerta: {item.min} {item.unit}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-800 text-sm">{item.stock}</span>
                        <span className="text-[10px] text-gray-500 block">{item.unit}</span>
                      </div>
                      <button onClick={() => { setEditingInventoryItem(item); setIsInventoryModalOpen(true); }} className="text-gray-400 hover:text-blue-600 p-1.5"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteInventoryItem(item.id)} className="text-gray-400 hover:text-red-600 p-1.5"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LOTES (MODULO DETALLADO AGRONÓMICO) */}
        {activeTab === 'lots' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Lotes y Especificaciones</h2>
                <p className="text-xs text-gray-400">Superficie, cultivo, suelo y estado hídrico</p>
              </div>
              <button onClick={() => { setEditingLot(null); setIsLotModalOpen(true); }} className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm transition">
                + Nuevo Lote
              </button>
            </div>

            <div className="space-y-3">
              {lots.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center bg-white rounded-xl shadow-sm">No hay lotes cargados.</p>
              ) : (
                lots.map((lot) => (
                  <div key={lot.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 transition hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">{lot.name}</h4>
                          <span className="text-xs font-semibold text-emerald-700">🌱 Cultivo: {lot.crop || 'Sin definir'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => { setEditingLot(lot); setIsLotModalOpen(true); }} className="text-gray-400 hover:text-blue-600 p-1.5" title="Editar"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteLot(lot.id)} className="text-gray-400 hover:text-red-600 p-1.5" title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Superficie</span>
                        <span className="font-bold text-gray-800">{lot.hectares || '0'} ha</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Suelo</span>
                        <span className="font-bold text-gray-800">{lot.soil || 'Franco'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Agua / Riego</span>
                        <span className="font-bold text-emerald-700">{lot.water || 'Óptimo'}</span>
                      </div>
                    </div>

                    {lot.notes && (
                      <p className="text-xs text-gray-600 italic bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100/50">
                        "{lot.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL LOTE DETALLADO */}
      <LotModal isOpen={isLotModalOpen} onClose={() => { setIsLotModalOpen(false); setEditingLot(null); }} onSave={handleSaveLot} initialData={editingLot} />

      {/* VISOR DE FOTO AMPLIADA */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <button onClick={() => setViewingImage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"><X size={28} /></button>
            <img src={viewingImage} alt="Ampliada" className="max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/20" />
          </div>
        </div>
      )}

      {/* MODAL DETALLE DASHBOARD */}
      {modalDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-emerald-800 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">Detalle Operativo</h3>
              <button onClick={() => setModalDetail(null)} className="text-emerald-200 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {modalDetail === 'ars' && expensesARS.map(exp => (
                <div key={exp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs">
                  <span>{exp.notes || exp.category} ({exp.lote})</span>
                  <span className="font-bold text-emerald-700">$ {exp.amount}</span>
                </div>
              ))}
              {modalDetail === 'usd' && expensesUSD.map(exp => (
                <div key={exp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs">
                  <span>{exp.notes || exp.category} ({exp.lote})</span>
                  <span className="font-bold text-blue-700">U$S {exp.amount}</span>
                </div>
              ))}
              {modalDetail === 'movements' && filteredExpenses.map(exp => (
                <div key={exp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs">
                  <span>{exp.notes || exp.category} ({exp.lote})</span>
                  <span className="font-bold">{exp.currency === 'USD' ? 'U$S' : '$'} {exp.amount}</span>
                </div>
              ))}
              {modalDetail === 'alerts' && issues.map(iss => (
                <div key={iss.id} className="bg-amber-50 p-3 rounded-xl border text-xs space-y-1">
                  <p className="font-bold">{iss.type} en {iss.lote}</p>
                  <p className="text-gray-600">{iss.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALES PRINCIPALES */}
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} onSave={handleSaveExpense} initialData={editingExpense} lotsList={lots} />
      <IssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onSave={handleSaveIssue} lotsList={lots} />
      <InventoryModal isOpen={isInventoryModalOpen} onClose={() => { setIsInventoryModalOpen(false); setEditingInventoryItem(null); }} onSave={handleSaveInventoryItem} initialData={editingInventoryItem} />

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2.5 z-30 shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <Home size={20} /><span className="text-[10px] mt-0.5">Inicio</span>
        </button>
        <button onClick={() => setActiveTab('expenses')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'expenses' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <DollarSign size={20} /><span className="text-[10px] mt-0.5">Gastos</span>
        </button>
        <button onClick={() => setActiveTab('issues')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'issues' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <AlertTriangle size={20} /><span className="text-[10px] mt-0.5">Monitoreo</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'inventory' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <Package size={20} /><span className="text-[10px] mt-0.5">Stock</span>
        </button>
        <button onClick={() => setActiveTab('lots')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'lots' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <MapPin size={20} /><span className="text-[10px] mt-0.5">Lotes</span>
        </button>
      </nav>
    </div>
  );
}