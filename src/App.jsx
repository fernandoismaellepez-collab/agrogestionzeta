import React, { useState, useEffect } from 'react';
import { Home, DollarSign, AlertTriangle, Package, Plus, Clock, Trash2, Edit2, TrendingUp, ShieldAlert, Calendar, Filter } from 'lucide-react';
import ExpenseModal from './components/ExpenseModal';
import IssueModal from './components/IssueModal';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [inventory] = useState([
    { id: 1, name: 'Glifosato 48%', stock: 450, unit: 'Litros', min: 200 },
    { id: 2, name: 'Urea Granulada', stock: 12000, unit: 'Kilos', min: 5000 },
    { id: 3, name: 'Gasoil Grado 2', stock: 1500, unit: 'Litros', min: 1000 }
  ]);

  // Estados para el filtro de fechas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sincronización en tiempo real desde Firestore
  useEffect(() => {
    const unsubscribeExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setExpenses(data);
    }, (error) => {
      console.error("Error al sincronizar gastos:", error);
    });

    const unsubscribeIssues = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setIssues(data);
    }, (error) => {
      console.error("Error al sincronizar problemas:", error);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeIssues();
    };
  }, []);

  // Filtrar gastos según el rango de fechas
  const filteredExpenses = expenses.filter(exp => {
    if (!exp.createdAt) return true;
    const expDate = new Date(exp.createdAt).toISOString().split('T')[0];
    if (startDate && expDate < startDate) return false;
    if (endDate && expDate > endDate) return false;
    return true;
  });

  // Métricas calculadas sobre los gastos filtrados
  const totalExpensesCount = filteredExpenses.length;
  const totalIssuesCount = issues.length;

  const totalARS = filteredExpenses
    .filter(exp => exp.currency === 'ARS' || !exp.currency)
    .reduce((acc, exp) => {
      const cleanNum = parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0;
      return acc + cleanNum;
    }, 0);

  const totalUSD = filteredExpenses
    .filter(exp => exp.currency === 'USD')
    .reduce((acc, exp) => {
      const cleanNum = parseFloat(String(exp.amount).replace(/\./g, '').replace(',', '.')) || 0;
      return acc + cleanNum;
    }, 0);

  // Crear o Editar Gasto en Firestore
  const handleSaveExpense = async (expenseDataInput) => {
    try {
      const payload = {
        lote: expenseDataInput.lote,
        category: expenseDataInput.category,
        amount: Number(expenseDataInput.amount).toLocaleString('es-AR'),
        currency: expenseDataInput.currency,
        supplier: expenseDataInput.supplier || 'Sin especificar',
        notes: expenseDataInput.notes || '',
        date: expenseDataInput.date || new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        createdAt: editingExpense ? editingExpense.createdAt : Date.now()
      };

      if (editingExpense) {
        const expenseRef = doc(db, "expenses", editingExpense.id);
        await updateDoc(expenseRef, payload);
      } else {
        await addDoc(collection(db, "expenses"), payload);
      }

      setEditingExpense(null);
      setIsExpenseModalOpen(false);
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      alert("No se pudo guardar el cambio en la nube.");
    }
  };

  // Eliminar Gasto de Firestore
  const handleDeleteExpense = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro de gasto?")) {
      try {
        await deleteDoc(doc(db, "expenses", id));
      } catch (error) {
        console.error("Error al eliminar gasto:", error);
        alert("No se pudo eliminar el registro.");
      }
    }
  };

  const handleOpenEditExpense = (exp) => {
    setEditingExpense(exp);
    setIsExpenseModalOpen(true);
  };

  // Guardar Falla en Firestore
  const handleSaveIssue = async (newIssue) => {
    try {
      await addDoc(collection(db, "issues"), {
        lote: newIssue.lote,
        type: newIssue.issueType === 'pest' ? 'Plaga' : 'Maleza/Otro',
        severity: newIssue.severity === 'critical' ? 'Crítico' : newIssue.severity === 'medium' ? 'Moderado' : 'Leve',
        description: newIssue.description,
        status: 'Pendiente de Receta',
        time: 'Recién',
        createdAt: Date.now()
      });
      setIsIssueModalOpen(false);
    } catch (error) {
      console.error("Error al guardar problema:", error);
      alert("No se pudo registrar la falla.");
    }
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col bg-gray-100 select-none">
      {/* Header Superior Optimizado para Móvil */}
      <header className="bg-emerald-800 text-white px-4 py-3.5 shadow-md sticky top-0 z-40 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-base sm:text-lg tracking-wide">AgroGestión Zeta</h1>
          <p className="text-[10px] text-emerald-200">Operaciones de Campo</p>
        </div>
        <span className="text-[11px] bg-emerald-700/90 border border-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">Online ☁️</span>
      </header>

      {/* Contenido Principal Adaptado */}
      <main className="flex-1 p-3 sm:p-4 max-w-5xl w-full mx-auto space-y-4">
        
        {/* VISTA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Banner y Selector Global de Fechas */}
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

              {/* Filtro de Fechas Integrado en el Dashboard */}
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 space-y-2 text-xs">
                <span className="flex items-center text-emerald-200 font-medium">
                  <Calendar size={14} className="mr-1.5" /> Filtrar período:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-emerald-300">Desde:</span>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-emerald-900/60 border border-emerald-600 text-white px-2 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-400 w-full"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-emerald-300">Hasta:</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-emerald-900/60 border border-emerald-600 text-white px-2 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-400 w-full"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-1.5 rounded-lg font-medium transition text-center mt-1"
                  >
                    Limpiar Filtro
                  </button>
                )}
              </div>
            </div>

            {/* Cuadrícula de Métricas Clave (Filtradas) */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Gastos ARS</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800 truncate">$ {totalARS.toLocaleString('es-AR')}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">En período</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Gastos USD</span>
                  <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"><DollarSign size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800 truncate">U$S {totalUSD.toLocaleString('es-AR')}</p>
                  <span className="text-[10px] text-blue-600 font-medium">En período</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Movimientos</span>
                  <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"><Package size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800">{totalExpensesCount} <span className="text-xs font-normal text-gray-500">ítems</span></p>
                  <span className="text-[10px] text-purple-600 font-medium">Registrados</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Alertas</span>
                  <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg"><ShieldAlert size={15} /></div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-extrabold text-gray-800">{totalIssuesCount} <span className="text-xs font-normal text-gray-500">lotes</span></p>
                  <span className="text-[10px] text-amber-600 font-medium">Abiertas</span>
                </div>
              </div>

            </div>

            {/* Accesos Rápidos Táctiles */}
            <div className="pt-1">
              <h3 className="font-bold text-gray-800 text-sm mb-2.5">Acciones Rápidas en Campo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button 
                  onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}
                  className="bg-emerald-600 active:bg-emerald-700 text-white p-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-sm transition"
                >
                  <Plus size={18} className="mr-2" /> Cargar Nuevo Gasto
                </button>
                <button 
                  onClick={() => setIsIssueModalOpen(true)}
                  className="bg-blue-600 active:bg-blue-700 text-white p-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-sm transition"
                >
                  <Plus size={18} className="mr-2" /> Reportar Falla a Campo
                </button>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">Gastos Recientes</h3>
                <button onClick={() => setActiveTab('expenses')} className="text-xs text-emerald-700 font-semibold hover:underline">
                  Ver todos ({filteredExpenses.length})
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3 text-center">No hay registros para este período.</p>
                ) : (
                  filteredExpenses.slice(0, 3).map((exp) => (
                    <div key={exp.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-800">{exp.lote}</span>
                        <span className="text-gray-500 block">{exp.category} • {exp.supplier}</span>
                      </div>
                      <span className="font-extrabold text-emerald-800">{exp.currency === 'USD' ? 'U$S' : '$'} {exp.amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VISTA 2: GASTOS */}
        {activeTab === 'expenses' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Control de Gastos</h2>
              <button 
                onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}
                className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
              >
                + Nuevo Gasto
              </button>
            </div>

            {/* Selector de Fechas para la vista de Gastos */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 space-y-2.5 text-xs">
              <span className="flex items-center text-gray-600 font-semibold">
                <Filter size={14} className="mr-1.5 text-emerald-700" /> Filtrar fechas:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-gray-400">Desde:</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-600 w-full"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-gray-400">Hasta:</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg text-xs outline-none focus:border-emerald-600 w-full"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="w-full bg-gray-100 active:bg-gray-200 text-gray-700 py-1.5 rounded-lg font-medium transition text-center"
                >
                  Limpiar Filtro
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {filteredExpenses.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">No se encontraron gastos en el rango seleccionado.</p>
              ) : (
                filteredExpenses.map((exp) => (
                  <div key={exp.id} className="p-3.5 sm:p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{exp.lote}</p>
                      <span className="text-[11px] text-gray-500">{exp.category} • {exp.supplier} • {exp.date}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-emerald-700 text-xs sm:text-sm">{exp.currency === 'USD' ? 'U$S' : '$'} {exp.amount}</span>
                      <button 
                        onClick={() => handleOpenEditExpense(exp)} 
                        className="text-gray-400 hover:text-blue-600 p-1.5 transition"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)} 
                        className="text-gray-400 hover:text-red-600 p-1.5 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 3: MONITOREO */}
        {activeTab === 'issues' && (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Monitoreo a Campo</h2>
              <button 
                onClick={() => setIsIssueModalOpen(true)}
                className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
              >
                + Registrar Falla
              </button>
            </div>

            <div className="space-y-3">
              {issues.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-500">No hay fallas reportadas en la nube.</div>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${issue.severity === 'Crítico' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {issue.severity}
                        </span>
                        <h4 className="font-bold text-sm text-gray-800 mt-1">{issue.type} en {issue.lote}</h4>
                      </div>
                      <span className="text-[11px] text-gray-400">{issue.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {issue.description}
                    </p>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md font-medium flex items-center">
                        <Clock size={11} className="mr-1" /> {issue.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 4: INVENTARIO */}
        {activeTab === 'inventory' && (
          <div className="space-y-3.5">
            <h2 className="text-xl font-bold text-gray-800">Depósito e Insumos</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                    <span className="text-[11px] text-gray-500">Stock Mínimo Alerta: {item.min} {item.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-800 text-base">{item.stock}</span>
                    <span className="text-[11px] text-gray-500 block">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Modales */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} 
        onSave={handleSaveExpense} 
        initialData={editingExpense}
      />
      <IssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onSave={handleSaveIssue} />

      {/* Barra de Navegación Inferior Móvil (Fija y Táctil) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2.5 z-30 shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <Home size={21} /><span className="text-[10px] mt-0.5">Inicio</span>
        </button>
        <button onClick={() => setActiveTab('expenses')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'expenses' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <DollarSign size={21} /><span className="text-[10px] mt-0.5">Gastos</span>
        </button>
        <button onClick={() => setActiveTab('issues')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'issues' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <AlertTriangle size={21} /><span className="text-[10px] mt-0.5">Monitoreo</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'inventory' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <Package size={21} /><span className="text-[10px] mt-0.5">Stock</span>
        </button>
      </nav>
    </div>
  );
}