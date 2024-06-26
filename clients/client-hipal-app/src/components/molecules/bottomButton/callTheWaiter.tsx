import useBusinessDetails from '@/components/store/useBusinessDetails';
import useTableData from '@/components/store/useTableData';
import axios from '@/utils/axios';
import React, { memo, useCallback, useState } from 'react'
import { toast } from 'react-toastify';

const messages = [
    "Bring Water bottles",
    "Bring Menu",
    "Bring Tissue Paper",
    "Please settle my table",
];

const CallTheWaiterComponent = ({ onClose }: { onClose: () => void }) => {

    const [message, setMessage] = useState('');
    const { tableName } = useTableData()
	const businessId = useBusinessDetails((s)=>s.businessDetails?._id)
    const [loading, setLoading] = useState<boolean>(false);

    const handleSelectMessage = useCallback((message: string) => {
        setMessage(message);
    }, []);

    const callTheWaiter = useCallback(async () => {
        if (message === '') {
            return toast.error('Please select a message to call waiter');
        }
        if (loading) {
            return toast.error('Please wait for a moment');

        }
        setLoading(true);
        try {
            const config = {
                method: 'POST',
                url: '/v1/payments/createWaiterAlert',
                data: {
                    businessId: businessId,
                    tableName: tableName,
                    message: message,
                    alertType: 'WAITER',
                    status: 'WAITER'
                }
            };
            const response = await axios(config);
            if (response.status === 200) {
                toast.success('Waiter will be there soon. Thank you!!');
                onClose();
            }
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                errors.forEach((error) => {
                    console.log(error.message);
                    toast.error('Please Scan the table to call waiter');
                });
            }
        } finally {
            setLoading(false);
        }
    }, [businessId, tableName, message, onClose]);

    return (
        <>
            <ul className="h-full overflow-auto">
                {messages.map((message, index) => (
                    <li
                        className="p-2 m-4 transition-colors duration-200 ease-in-out transform rounded-md cursor-pointer hover:bg-primary hover:text-base-100 hover:scale-105"
                        key={message + index}
                        onClick={() => handleSelectMessage(message)}
                    >
                        {message}
                    </li>
                ))}
            </ul>
            <button
            disabled={loading}
            onClick={callTheWaiter}
            className="w-[92%] mb-4 px-8 py-3 mx-4 text-sm border rounded-full bg-primary text-base-100"
        >
            {loading ? (
                <span className="loader_spinner !border-t-base-100 "></span>
            ) : (
                'Call Captain'
            )}
        </button>
        </>
    )
}

export default memo(CallTheWaiterComponent)