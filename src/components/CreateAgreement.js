import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function CreateAgreement() {
    const navigate = useNavigate();
    const [error, setError] = useState(null); // State for error message
    const [showErrorModal, setShowErrorModal] = useState(false); // State for showing error modal

    const [formData, setFormData] = useState({
        warehouse_id: '',
        warehouseName: '', // Added warehouseName field
        lesseeName: '',
        lessorName: '',
        lessee_id: '',
        start_date: '',
        end_date: '',
        rentAmount: '',
        rentFrequency: 'monthly',
        depositAmount: '',
        terms: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const { start_date, end_date, rentFrequency, rentAmount, depositAmount } = formData;
                const startDate = new Date(start_date);
                const endDate = new Date(end_date);
                const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate difference in days
    
                if (daysDiff < 30) { // If duration is less than 30 days
                    setError('Agreement duration must be at least 30 days.');
                    setShowErrorModal(true); // Show modal
                    return;
                }
    
                if (rentFrequency === 'yearly' && daysDiff < 365) { // If rent frequency is yearly and duration is less than 365 days (1 year)
                    setError('Yearly rent period requires a duration of at least 365 days (1 year).');
                    setShowErrorModal(true); // Show modal
                    return;
                }
    
          
    
                if (parseInt(depositAmount) > parseInt(rentAmount)) {
                    setError('Deposit amount cannot be greater than rent amount.');
                    setShowErrorModal(true); // Show modal
                    return;
                }
    
                const agreementData = { ...formData, userId: currentUser.uid };
                await db.collection('rentalAgreement').add(agreementData);
                navigate('/rental-agreements');
            } else {
                console.error('User is not authenticated.');
            }
        } catch (error) {
            console.error('Error creating rental agreement: ', error);
            setError('Error creating rental agreement. Please try again later.');
            setShowErrorModal(true); // Show modal
        }
    };
    
    
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-grow p-8">
                    <h2 className="text-4xl font-semibold mb-8 mt-4 text-center">Create New Rental Agreement</h2>
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Lessor Name</label>
                                <input
                                    type="text"
                                    name="lessorName"
                                    value={formData.lessorName}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Lessee Name</label>
                                <input
                                    type="text"
                                    name="lesseeName"
                                    value={formData.lesseeName}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2">Warehouse Name</label>
                            <input
                                type="text"
                                name="warehouseName"
                                value={formData.warehouseName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Rent Amount</label>
                                <input
                                    type="number"
                                    name="rentAmount"
                                    value={formData.rentAmount}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Rent Period</label>
                                <select
                                    name="rentFrequency"
                                    value={formData.rentFrequency}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Deposit Amount</label>
                                <input
                                    type="number"
                                    name="depositAmount"
                                    value={formData.depositAmount}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2">Terms</label>
                            <textarea
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-6 py-4 focus
                                focus
                                h-40"
                                required
                                ></textarea>
                                </div>
                                <div className="flex justify-center">
                                <button
                                                             type="submit"
                                                             className="bg-blue-500 text-white rounded-md px-8 py-4 mt-8 hover:bg-blue-600"
                                                         >
                                Submit
                                </button>
                                </div>
                                </form>
                               {/* Error Modal */}
                    {showErrorModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                            <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
                            <div className="relative w-auto max-w-md p-5 mx-auto my-6 bg-white rounded-lg shadow-lg">
                                {/* Content */}
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-2 text-red-600">Error</h3>
                                    <p className="text-gray-700 mb-4">{error}</p>
                                    <button
                                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600"
                                        onClick={() => setShowErrorModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                                </div>
                                </div>
                                </div>
                                );
                                }
                                
                                export default CreateAgreement;
