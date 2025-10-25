import React, { useState } from 'react';
import { AlertTriangle, User, FileText, MessageCircle, Star, Clock, Eye, Flag, Hash, Users, Zap, Shield, Target, BookOpen, AlertCircle, AlertOctagon, Bug, Ban } from 'lucide-react';
import ReportReviewModal from '../ReportReviewModal';
import SuccessNotification from '../SuccessNotification';
import { deleteContent } from '../../api/admin-stats';

const AdminReports = ({ reportsData, handleOpenReportModal, handleResolveReport, handleRejectReport, onReportDeleted }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [deletingReportId, setDeletingReportId] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenModal = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReport(null);
    };

    const handleResolve = async (reportId) => {
        if (handleResolveReport) {
            await handleResolveReport(reportId);
        }
    };

    const handleReject = async (reportId) => {
        if (handleRejectReport) {
            await handleRejectReport(reportId);
        }
    };

    const handleDeleteContent = async (targetId, targetType) => {
        try {
            console.log('Deleting content:', { targetId, targetType });
            setDeletingReportId(selectedReport._id);
            await deleteContent(targetId, targetType);
            setSuccessMessage('Контент успішно видалено');
            setShowSuccessNotification(true);
            handleCloseModal();
            // Оновлюємо список скарг негайно
            if (onReportDeleted) {
                onReportDeleted();
            }
            // Додатково оновлюємо через невелику затримку для гарантії
            setTimeout(() => {
                if (onReportDeleted) {
                    onReportDeleted();
                }
            }, 1000);
        } catch (error) {
            console.error('Error deleting content:', error);
            if (error.response?.data?.reportUpdated) {
                setSuccessMessage('Скаргу оновлено - контент не існує');
                setShowSuccessNotification(true);
                handleCloseModal();
                // Негайно оновлюємо список скарг
                if (onReportDeleted) {
                    onReportDeleted();
                }
            } else if (error.response?.status === 404) {
                setSuccessMessage('Скаргу оновлено - контент вже не існує');
                setShowSuccessNotification(true);
                handleCloseModal();
                // Негайно оновлюємо список скарг
                if (onReportDeleted) {
                    onReportDeleted();
                }
            } else {
                alert('Помилка при видаленні контенту: ' + error.message);
            }
        }
    };

    const handleEditContent = async (targetId, targetType) => {
        console.log('Edit content:', targetId, targetType);
    };
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
        <div className="space-y-6 reports-slide-in">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-red-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 reports-icon-glow reports-icon-pulse reports-icon-rotate reports-icon-shimmer relative overflow-hidden">
                            <AlertTriangle className="w-5 h-5 text-white relative z-10" />
                        </div>
                        Скарги на розгляді
                    </h3>
                    
                    {(!reportsData || reportsData.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 content-icon-glow content-icon-pulse content-icon-rotate relative overflow-hidden">
                                <div className="absolute inset-0 content-icon-shimmer opacity-30"></div>
                                <Flag className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                            </div>
                            <div className="text-gray-500 text-lg font-medium">Немає скарг на розгляді</div>
                            <div className="text-gray-400 text-sm mt-1">Всі скарги розглянуті</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reportsData.map((report, index) => (
                                <div 
                                    key={report._id} 
                                    className={`bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 report-hover-glow transition-all duration-300 group report-card-animate ${
                                        deletingReportId === report._id ? 'comment-delete-slide' : ''
                                    }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
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
                                                onClick={() => handleOpenModal(report)}
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

            <ReportReviewModal
                isOpen={showModal}
                onClose={handleCloseModal}
                report={selectedReport}
                onResolve={handleResolve}
                onReject={handleReject}
                onDeleteContent={handleDeleteContent}
                onEditContent={handleEditContent}
            />

            <SuccessNotification
                message={successMessage}
                isVisible={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                type="success"
            />
        </div>
    );
};

export default AdminReports;