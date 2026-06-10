import React from 'react';
import { WorkExperience } from '../../types/resume';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface ExperienceFormProps {
  experience: WorkExperience[];
  onChangeExperience: (experience: WorkExperience[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onChangeExperience
}) => {
  const handleAddItem = () => {
    const newItem: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      hidden: false
    };
    onChangeExperience([...experience, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChangeExperience(experience.filter((item) => item.id !== id));
  };

  const handleToggleHide = (id: string) => {
    const updated = experience.map((item) => {
      if (item.id === id) {
        return { ...item, hidden: !item.hidden };
      }
      return item;
    });
    onChangeExperience(updated);
  };

  const handleChangeItem = (id: string, field: keyof WorkExperience, value: any) => {
    const updated = experience.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChangeExperience(updated);
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Experiencia Laboral
        </h3>
        <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
          + Agregar
        </Button>
      </div>

      {experience.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">
          No se ha agregado ninguna experiencia laboral.
        </p>
      ) : (
        <div className="space-y-6">
          {experience.map((item, index) => (
            <div key={item.id} className={`relative border-b border-slate-100 pb-6 last:border-b-0 last:pb-0 transition-opacity duration-200 ${item.hidden ? 'opacity-65' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  Puesto #{index + 1} {item.hidden && <span className="text-amber-600 font-bold ml-1.5">(Oculto en PDF)</span>}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={item.hidden ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleHide(item.id)}
                    className={item.hidden ? '!bg-amber-50 !text-amber-700 !border-amber-100 hover:!bg-amber-100' : ''}
                  >
                    {item.hidden ? 'Mostrar' : 'Ocultar'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Empresa"
                  id={`exp-company-${item.id}`}
                  value={item.company}
                  onChange={(e) => handleChangeItem(item.id, 'company', e.target.value)}
                  placeholder="Ej. Tech Corp"
                />
                <Input
                  label="Puesto / Rol"
                  id={`exp-role-${item.id}`}
                  value={item.role}
                  onChange={(e) => handleChangeItem(item.id, 'role', e.target.value)}
                  placeholder="Ej. Frontend Developer"
                />
                <Input
                  label="Fecha de Inicio"
                  id={`exp-start-${item.id}`}
                  value={item.startDate}
                  onChange={(e) => handleChangeItem(item.id, 'startDate', e.target.value)}
                  placeholder="Ej. AAAA-MM o Mes AAAA"
                />
                <Input
                  label="Fecha de Fin"
                  id={`exp-end-${item.id}`}
                  value={item.endDate}
                  onChange={(e) => handleChangeItem(item.id, 'endDate', e.target.value)}
                  placeholder="Ej. AAAA-MM o Presente"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Ubicación"
                    id={`exp-loc-${item.id}`}
                    value={item.location}
                    onChange={(e) => handleChangeItem(item.id, 'location', e.target.value)}
                    placeholder="Ej. Madrid, España (Híbrido)"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Descripción de Funciones / Logros"
                    id={`exp-desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                    placeholder="Describe tus tareas clave, responsabilidades y logros medibles..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
