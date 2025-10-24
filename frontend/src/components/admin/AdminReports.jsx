import React from 'react';
import { AlertTriangle, User, FileText, MessageCircle, Star, Clock, Eye, Flag, Hash, Users, Zap, Shield, Target, BookOpen, AlertCircle, AlertOctagon, Bug, Ban } from 'lucide-react';

const AdminReports = ({ reportsData, handleOpenReportModal }) => {
    const getTargetIcon = (targetType) => {
        switch (targetType) {
            case 'announcement':
                return <AlertCircle className="w-4 h-4 text-white" />;
            case 'comment':
                return <AlertOctagon className="w-4 h-4 text-white" />;
            case 'review':
                return <Bug className="w-4 h-4 text-white" />;
            case 'user':
                return <Ban className="w-4 h-4 text-white" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-white" />;
        }
    };

    const getTargetLabel = (targetType) => {
        switch (targetType) {
            case 'announcement':
                return 'обговорення';
            case 'comment':
                return 'коментар';
            case 'review':
                return 'відгук';
            default:
                return 'користувача';
        }
    };

    const getTargetColor = (targetType) => {
        switch (targetType) {
            case 'announcement':
                return 'from-orange-500 to-orange-600';
            case 'comment':
                return 'from-orange-600 to-orange-700';
            case 'review':
                return 'from-orange-700 to-orange-800';
            case 'user':
                return 'from-orange-800 to-orange-900';
            default:
                return 'from-orange-400 to-orange-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-red-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        Скарги на розгляді
                    </h3>
                    
                    {(!reportsData || reportsData.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Flag className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-gray-500 text-lg font-medium">Немає скарг на розгляді</div>
                            <div className="text-gray-400 text-sm mt-1">Всі скарги розглянуті</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reportsData.map((report, index) => (
                                <div 
                                    key={report._id} 
                                    className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 report-hover-glow transition-all duration-300 cursor-pointer group"
                                    style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`w-10 h-10 bg-gradient-to-r ${getTargetColor(report.targetType)} rounded-lg flex items-center justify-center flex-shrink-0 report-neon-glow`}>
                                                {getTargetIcon(report.targetType)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-orange-900">
                                                        Скарга на {getTargetLabel(report.targetType)}
                                                    </span>
                                                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <User className="w-4 h-4" />
                                                    <span>Від: {report.reporterId?.displayName || report.reporterId?.email || 'Невідомий'}</span>
                                                </div>
                                                
                                                {report.reason && (
                                                    <div className="text-sm text-orange-800 bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200">
                                                        <div className="font-medium text-orange-700 mb-1">Причина скарги:</div>
                                                        <div className="text-orange-900">{report.reason}</div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(report.createdAt).toLocaleString('uk-UA')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleOpenReportModal(report)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
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
        </div>
    );
};

export default AdminReports;