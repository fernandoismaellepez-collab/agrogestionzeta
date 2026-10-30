import React, { useState, useEffect } from 'react';
import { X, PackagePlus } from 'lucide-react';

export default function InventoryModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Litros');
  const [min, setMin] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setStock(initialData.stock || '');
      setUnit(initialData.unit || 'Litros');
      setMin(initialData.min || '');
    } else {
      setName('');
      setStock('');
      setUnit('Litros');
      setMin('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || stock === '') return;
    onSave({ name, stock, unit, min });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del Modal */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-700/80 rounded-xl">
              <PackagePlus size={20} className="text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                {initialData ? 'Editar Insumo' : 'Nuevo Insumo'}
              </h3>
              <p className="text-[11px] text-emerald-200">Depósito del establecimiento</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-emerald-700/50 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nombre del Insumo
            </label>
            <input 
              type="text" 
              required
              placeholder="Ej. Glifosato 48%, Gasoil, Urea..."
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-sm font-medium text-gray-800 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Stock Actual
              </label>
              <input 
                type="number" 
                required
                placeholder="0"
                value={stock} 
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-sm font-medium text-gray-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Unidad
              </label>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3 py-3 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-sm font-medium text-gray-800 transition"
              >
                <option value="Litros">Litros</option>
                <option value="Kilos">Kilos</option>
                <option value="Unidades">Unidades</option>
                <option value="Bolsas">Bolsas</option>
                <option value="Toneladas">Toneladas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Stock Mínimo (Alerta de reposición)
            </label>
            <input 
              type="number" 
              placeholder="Ej. 200"
              value={min} 
              onChange={(e) => setMin(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-sm font-medium text-gray-800 transition"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 py-3.5 rounded-xl font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition"
            >
              Guardar Insumo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}