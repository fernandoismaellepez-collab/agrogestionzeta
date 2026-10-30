import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

export default function LotModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [hectares, setHectares] = useState('');
  const [crop, setCrop] = useState('');
  const [soil, setSoil] = useState('Franco');
  const [water, setWater] = useState('Óptimo');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setHectares(initialData.hectares || '');
      setCrop(initialData.crop || '');
      setSoil(initialData.soil || 'Franco');
      setWater(initialData.water || 'Óptimo');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setHectares('');
      setCrop('');
      setSoil('Franco');
      setWater('Óptimo');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, hectares, crop, soil, water, notes });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        
        <div className="bg-emerald-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-700/80 rounded-xl">
              <MapPin size={20} className="text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                {initialData ? 'Editar Lote / Potrero' : 'Nuevo Lote del Establecimiento'}
              </h3>
              <p className="text-[11px] text-emerald-200">Especificaciones agronómicas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1.5"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nombre del Lote / Potrero</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Lote 1 - Principal, El Bajo..."
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Superficie (ha)</label>
              <input 
                type="number" 
                placeholder="Ej. 100"
                value={hectares} 
                onChange={(e) => setHectares(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Cultivo / Campaña</label>
              <input 
                type="text" 
                placeholder="Ej. Soja 1ra / Maíz"
                value={crop} 
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Calidad del Suelo</label>
              <select 
                value={soil} 
                onChange={(e) => setSoil(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800"
              >
                <option value="Franco">Franco</option>
                <option value="Franco-Arcilloso">Franco-Arcilloso</option>
                <option value="Arenoso">Arenoso</option>
                <option value="Arcilloso">Arcilloso / Bajo</option>
                <option value="Limoso">Limoso</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Estado Hídrico / Agua</label>
              <select 
                value={water} 
                onChange={(e) => setWater(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800"
              >
                <option value="Óptimo">Óptimo / Capacidad de campo</option>
                <option value="Exceso hídrico">Exceso hídrico / Encharcado</option>
                <option value="Estrés moderado">Estrés hídrico moderado</option>
                <option value="Sequía crítica">Sequía crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Observaciones / Datos Relevantes</label>
            <textarea 
              rows="2"
              placeholder="Historial de fertilización, tipo de napas, pasturas..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium text-gray-800 resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition">Cancelar</button>
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition">Guardar Lote</button>
          </div>

        </form>
      </div>
    </div>
  );
}