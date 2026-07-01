import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VnpayReturnPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [orderId, setOrderId] = useState('');
    const [orderCode, setOrderCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        document.title = 'Kết quả thanh toán - TechMarket';
        
        const payStatus = searchParams.get('status');
        const id = searchParams.get('orderId') || '';
        const code = searchParams.get('code') || '';
        const msg = searchParams.get('message') || '';

        setOrderId(id);
        setOrderCode(code);
        setErrorMessage(msg);

        if (payStatus === 'success') {
            setStatus('success');
        } else if (payStatus === 'fail') {
            setStatus('fail');
        } else if (payStatus === 'invalid_signature') {
            setStatus('invalid_signature');
        } else if (payStatus === 'order_not_found') {
            setStatus('order_not_found');
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    if (status === 'processing') {
        return (
            <div className="flex justify-center items-center py-32">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto text-center py-12 px-4">
            <div className="flex flex-col items-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                
                {status === 'success' ? (
                    <>
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl shadow-sm border border-green-100 animate-bounce">
                            ✓
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800">Thanh toán thành công!</h1>
                            <p className="text-gray-400 text-sm mt-1">TechMarket đã nhận được thanh toán của bạn.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl shadow-sm border border-red-100">
                            ✕
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800">Thanh toán thất bại!</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {status === 'invalid_signature' ? 'Chữ ký giao dịch không hợp lệ.' : 
                                 status === 'order_not_found' ? 'Không tìm thấy đơn hàng tương ứng.' : 
                                 errorMessage || 'Giao dịch thanh toán bị hủy hoặc không thành công.'}
                            </p>
                        </div>
                    </>
                )}

                {/* Details Card */}
                {orderCode && (
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm space-y-3 font-semibold text-gray-500 text-left">
                        <div className="flex justify-between">
                            <span>Mã đơn hàng:</span>
                            <span className="text-gray-800 font-bold font-mono">{orderCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cổng thanh toán:</span>
                            <span className="text-gray-800 uppercase font-bold">VNPay</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Trạng thái:</span>
                            <span className={`font-bold uppercase ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {status === 'success' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="w-full space-y-2.5">
                    {orderId ? (
                        <Link
                            to={`/orders/${orderId}`}
                            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center shadow-md shadow-indigo-100 transition-all cursor-pointer"
                        >
                            Xem chi tiết đơn hàng
                        </Link>
                    ) : (
                        <Link
                            to="/orders"
                            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center shadow-md shadow-indigo-100 transition-all cursor-pointer"
                        >
                            Quản lý đơn hàng
                        </Link>
                    )}
                    <Link
                        to="/"
                        className="block w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-center transition-all cursor-pointer"
                    >
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
