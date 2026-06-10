import React from 'react';
import { Education } from '../../types/resume';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface EducationFormProps {
  education: Education[];
  onChangeEducation: (education: Education[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onChangeEducation
}) => {
  const handleAddItem = () => {
    const newItem: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      hidden: false
    };
    onChangeEducation([...education, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChangeEducation(education.filter((item) => item.id !== id));
  };

  const handleToggleHide = (id: string) => {
    const updated = education.map((item) => {
      if (item.id === id) {
        return { ...item, hidden: !item.hidden };
      }
      return item;
    });
    onChangeEducation(updated);
  };

  const handleChangeItem = (id: string, field: keyof Education, value: any) => {
    const updated = education.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChangeEducation(updated);
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Formación Académica
        </h3>
        <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
          + Agregar
        </Button>
      </div>

      {education.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">
          No se ha agregado ninguna formación académica.
        </p>
      ) : (
        <div className="space-y-6">
          {education.map((item, index) => (
            <div key={item.id} className={`relative border-b border-slate-100 pb-6 last:border-b-0 last:pb-0 transition-opacity duration-200 ${item.hidden ? 'opacity-65' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  Estudio #{index + 1} {item.hidden && <span className="text-amber-600 font-bold ml-1.5">(Oculto en PDF)</span>}
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
                  label="Institución / Universidad"
                  id={`edu-inst-${item.id}`}
                  value={item.institution}
                  onChange={(e) => handleChangeItem(item.id, 'institution', e.target.value)}
                  placeholder="Ej. Universidad Complutense"
                />
                <Input
                  label="Título / Grado"
                  id={`edu-deg-${item.id}`}
                  value={item.degree}
                  onChange={(e) => handleChangeItem(item.id, 'degree', e.target.value)}
                  placeholder="Ej. Grado en Ingeniería Informática"
                />
                <Input
                  label="Fecha de Inicio"
                  id={`edu-start-${item.id}`}
                  value={item.startDate}
                  onChange={(e) => handleChangeItem(item.id, 'startDate', e.target.value)}
                  placeholder="Ej. AAAA-MM o Mes AAAA"
                />
                <Input
                  label="Fecha de Fin"
                  id={`edu-end-${item.id}`}
                  value={item.endDate}
                  onChange={(e) => handleChangeItem(item.id, 'endDate', e.target.value)}
                  placeholder="Ej. AAAA-MM o Presente"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Ubicación"
                    id={`edu-loc-${item.id}`}
                    value={item.location}
                    onChange={(e) => handleChangeItem(item.id, 'location', e.target.value)}
                    placeholder="Ej. Madrid, España"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Descripción adicional / Logros académicos (Opcional)"
                    id={`edu-desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                    placeholder="Ej. Promedio de calificaciones, especialidad, tesis o proyectos destacados..."
                    rows={2}
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
