import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    lote: 'Lote 1 - Principal',
    category: 'agrochemicals',
    amount: '',
    currency: 'ARS',
    supplier: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center space-x-2 text-emerald-800">
            <DollarSign size={24} />
            <h3 className="font-bold text-lg">Registrar Nuevo Gasto</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Lote */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Lote / Establecimiento</label>
            <select 
              value={formData.lote}
              onChange={(e) => setFormData({...formData, lote: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option>Lote 1 - Principal</option>
              <option>Lote 2 - El Bajo</option>
              <option>Lote 3 - Norte</option>
              <option>General / Establecimiento</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Categoría</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="seeds">Semillas</option>
              <option value="agrochemicals">Agroquímicos</option>
              <option value="fertilizers">Fertilizantes</option>
              <option value="fuel">Combustible</option>
              <option value="machinery_repair">Reparaciones / Mecánica</option>
              <option value="labor">Mano de Obra</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Importe y Moneda */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Importe</label>
              <input 
                type="number" 
                required
                placeholder="Ej: 450000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Moneda</label>
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD (U$S)</option>
              </select>
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Proveedor</label>
            <input 
              type="text" 
              placeholder="Ej: YPF Agro / Distribuidora..."
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Notas / Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notas o Detalle</label>
            <textarea 
              rows="2"
              placeholder="Detalle opcional..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Botones de Acción */}
          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-medium text-sm shadow hover:bg-emerald-700 transition"
            >
              Guardar Gasto
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}