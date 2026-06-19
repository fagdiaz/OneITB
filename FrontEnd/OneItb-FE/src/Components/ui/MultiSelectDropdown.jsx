import React, { useState, useRef, useEffect } from 'react';

export const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder = "Seleccionar..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (id) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter(val => val !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.id));
    }
  };

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === options.length && options.length > 0
      ? 'Todos seleccionados'
      : `${selectedValues.length} seleccionados`;

  return (
    <div className="relative w-full min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      >
        <span className="truncate mr-2">{displayText}</span>
        <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length > 0 && (
            <label className="flex items-center px-4 py-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer sticky top-0 bg-white z-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleAll}
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-slate-800">Seleccionar Todos</span>
            </label>
          )}

          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500 italic">No hay opciones disponibles</div>
            ) : (
              options.map(option => (
                <label key={option.id} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => handleToggleOption(option.id)}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700 truncate">{option.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
