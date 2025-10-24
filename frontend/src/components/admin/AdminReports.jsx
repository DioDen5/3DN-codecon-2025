import React from 'react';

const AdminReports = ({ reportsData, handleOpenReportModal }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Скарги на розгляді</h3>
                {(!reportsData || reportsData.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                        Немає скарг на розгляді
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reportsData.map((report) => (
                            <div key={report._id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">
                                            Скарга на {report.targetType === 'announcement' ? 'обговорення' : report.targetType === 'comment' ? 'коментар' : report.targetType === 'review' ? 'відгук' : 'користувача'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Від: {report.reporterId?.displayName || report.reporterId?.email || 'Невідомий'}
                                        </div>
                                        {report.reason && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Причина: {report.reason}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(report.createdAt).toLocaleString('uk-UA')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenReportModal(report)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 cursor-pointer transition-colors"
                                        >
                                            Розглянути
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;