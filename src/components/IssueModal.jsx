import React, { useState } from 'react';
import { X, AlertTriangle, Camera } from 'lucide-react';

export default function IssueModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    lote: 'Lote 1 - Principal',
    issueType: 'pest',
    severity: 'medium',
    description: '',
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
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center space-x-2 text-blue-800">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-lg">Reportar Falla o Plaga</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Lote / Establecimiento</label>
            <select 
              value={formData.lote}
              onChange={(e) => setFormData({...formData, lote: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>Lote 1 - Principal</option>
              <option>Lote 2 - El Bajo</option>
              <option>Lote 3 - Norte</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Problema</label>
            <select 
              value={formData.issueType}
              onChange={(e) => setFormData({...formData, issueType: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="pest">Plaga / Insectos (Isoca, etc.)</option>
              <option value="weed">Maleza / Enmalezamiento</option>
              <option value="disease">Enfermedad / Fúngica</option>
              <option value="nutrient_deficiency">Deficiencia Nutricional</option>
              <option value="infrastructure">Infraestructura (Alambrado/Riego)</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Severidad</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, severity: 'low'})}
                className={`p-2.5 rounded-xl text-xs font-bold border transition ${formData.severity === 'low' ? 'bg-yellow-50 text-yellow-800 border-yellow-300 ring-2 ring-yellow-400' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                Leve
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, severity: 'medium'})}
                className={`p-2.5 rounded-xl text-xs font-bold border transition ${formData.severity === 'medium' ? 'bg-orange-50 text-orange-800 border-orange-300 ring-2 ring-orange-400' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                Moderado
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, severity: 'critical'})}
                className={`p-2.5 rounded-xl text-xs font-bold border transition ${formData.severity === 'critical' ? 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-400' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                Crítico
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Descripción y Observaciones</label>
            <textarea 
              rows="3"
              required
              placeholder="Detalle de lo observado a campo..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 cursor-pointer transition">
            <Camera size={24} className="mx-auto text-gray-400 mb-1" />
            <span className="text-xs font-medium text-gray-600">Adjuntar foto desde la cámara</span>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-medium text-sm shadow hover:bg-blue-700 transition">
              Registrar Falla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}