import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REPORT_CONTENT } from '../../data/graphql/mutations/moderation';

export const ReportModal = ({ isOpen, onClose, contentId, contentType }) => {
    const [reason, setReason] = useState('');
    const [success, setSuccess] = useState(false);

    // Hardcoded dummy reporter for demo purposes (usually would come from Auth Context)
    const reporterId = "11111111-1111-1111-1111-111111111111";

    const [reportContent, { loading, error }] = useMutation(REPORT_CONTENT, {
        onCompleted: () => {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason('');
            }, 2000);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        reportContent({ variables: { reporterId, contentId, contentType, reason } });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto font-inter" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Reportar Contenido
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ¿Por qué quieres reportar esta publicación? El equipo de moderación lo revisará.
                                    </p>
                                    
                                    {success ? (
                                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm">
                                            ¡Reporte enviado exitosamente! Gracias por mantener la comunidad segura.
                                        </div>
                                    ) : (
                                        <form className="mt-4" onSubmit={handleSubmit}>
                                            <textarea
                                                className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                                                rows="4"
                                                placeholder="Describe el problema (Spam, lenguaje inapropiado, etc)..."
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                required
                                            ></textarea>
                                            
                                            {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}

                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button type="submit" disabled={loading}
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                                                    {loading ? 'Enviando...' : 'Enviar Reporte'}
                                                </button>
                                                <button type="button" onClick={onClose}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
