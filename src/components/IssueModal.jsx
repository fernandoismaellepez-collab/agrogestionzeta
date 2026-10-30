import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

export default function IssueModal({ isOpen, onClose, onSave, lotsList }) {
  const [lote, setLote] = useState('');
  const [issueType, setIssueType] = useState('Plaga / Insectos (Isoca, etc.)');
  const [severity, setSeverity] = useState('Moderado');
  const [damagePercent, setDamagePercent] = useState('15');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLote(lotsList && lotsList.length > 0 ? lotsList[0].name : 'Lote 1 - Principal');
      setIssueType('Plaga / Insectos (Isoca, etc.)');
      setSeverity('Moderado');
      setDamagePercent('15');
      setDescription('');
      setImagePreview(null);
    }
  }, [isOpen, lotsList]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ lote, issueType, severity, damagePercent, description, image: imagePreview });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/80 rounded-xl"><Camera size={20} className="text-blue-100" /></div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Reportar Falla a Campo</h3>
              <p className="text-[11px] text-blue-100">Monitoreo de lotes y cultivos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white p-1.5"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Lote / Establecimiento</label>
            <select 
              value={lote} 
              onChange={(e) => setLote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl outline-none focus:border-blue-600 text-sm font-medium text-gray-800"
            >
              {lotsList && lotsList.length > 0 ? (
                lotsList.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)
              ) : (
                <option value="Lote 1 - Principal">Lote 1 - Principal</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tipo de Problema</label>
            <select 
              value={issueType} 
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl outline-none focus:border-blue-600 text-sm font-medium text-gray-800"
            >
              <option value="Plaga / Insectos (Isoca, etc.)">Plaga / Insectos (Isoca, etc.)</option>
              <option value="Maleza / Rompepicos">Maleza / Rompepicos</option>
              <option value="Estrés Hídrico / Sequía">Estrés Hídrico / Sequía</option>
              <option value="Enfermedad fúngica / Mancha">Enfermedad fúngica / Mancha</option>
              <option value="Otro motivo agronómico">Otro motivo agronómico</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Severidad</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-3 rounded-xl outline-none text-sm font-medium">
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Daño Estimado (%)</label>
              <input type="number" min="1" max="100" value={damagePercent} onChange={(e) => setDamagePercent(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-3 rounded-xl outline-none text-sm font-medium" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Descripción y Observaciones</label>
            <textarea rows="3" required placeholder="Detalle de lo observado a campo..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none text-sm resize-none"></textarea>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">Fotografía de Evidencia</label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex flex-col items-center">
                <img src={imagePreview} alt="Evidencia" className="w-full h-36 object-cover rounded-xl" />
                <button type="button" onClick={() => setImagePreview(null)} className="mt-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">Quitar o cambiar foto</button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                <Camera size={24} className="text-blue-600 mb-2" />
                <span className="font-bold text-gray-700 text-xs">Tomar foto o adjuntar archivo</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-sm">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md">Registrar Falla</button>
          </div>
        </form>
      </div>
    </div>
  );
}