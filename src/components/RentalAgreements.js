import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { saveAs } from 'file-saver'; // Import saveAs function from file-saver library

function RentalAgreements() {
    const [rentalAgreements, setRentalAgreements] = useState([]);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [DeletesuccessMessage, setDeletesetSuccessMessage] = useState(false);
    const [agreementsCount, setAgreementsCount] = useState(0); // State to store the count of rental agreements
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [agreementToDelete, setAgreementToDelete] = useState(null);
    
    const showConfirmDeleteModal = (agreementId) => {
        setAgreementToDelete(agreementId);
        setConfirmDeleteVisible(true);
    };

 
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            db.collection('rentalAgreement')
                .where('userId', '==', currentUser.uid)
                .get()
                .then((querySnapshot) => {
                    const agreements = [];
                    querySnapshot.forEach((doc) => {
                        agreements.push({ id: doc.id, ...doc.data() });
                    });
                    setRentalAgreements(agreements);
                    setAgreementsCount(agreements.length); // Update the count of rental agreements
                })
                .catch((error) => {
                    console.error('Error fetching rental agreements: ', error);
                });
        }
    }, []);
    const handleDelete = (agreementId) => {
    // Get a reference to the document
    const agreementRef = db.collection('rentalAgreement').doc(agreementId);

    // Delete the document
    agreementRef.delete()
        .then(() => {
            // Update the state with the updated rental agreements after deletion
            db.collection('rentalAgreement')
                .where('userId', '==', auth.currentUser.uid)
                .get()
                .then((querySnapshot) => {
                    const agreements = [];
                    querySnapshot.forEach((doc) => {
                        agreements.push({ id: doc.id, ...doc.data() });
                    });
                    setRentalAgreements(agreements);
                    setDeletesetSuccessMessage(true); // Show success message
                    setTimeout(() => setDeletesetSuccessMessage(false), 2000); // Hide message after 3 seconds
                })
                .catch((error) => {
                    console.error('Error fetching rental agreements: ', error);
                });
        })
        .catch((error) => {
            console.error('Error deleting document: ', error);
        });

    setConfirmDeleteVisible(false); // Hide the confirmation modal
};

    const handleViewClick = (agreement) => {
        setSelectedAgreement(agreement);
        setModalVisible(true);
    };
      // Function to generate Word file
      const handleConvertToWord = () => {
        if (!selectedAgreement) {
            alert('Please click the View button first.');
            return;
        }

        // Extract selected agreement data
        const {
            warehouseName,
            lessorName,
            lesseeName,
            start_date,
            end_date,
            rentAmount,
            rentFrequency,
            depositAmount,
            terms
        } = selectedAgreement;

        // Create a string representing the content of the Word document
        const wordContent = `
        Rental Agreement
        Warehouse Name: ${warehouseName}
        Lessor Name: ${lessorName}
        Lessee Name: ${lesseeName}
        Start Date: ${new Date(start_date).toLocaleDateString()}
        End Date: ${new Date(end_date).toLocaleDateString()}
        Rent Amount: ₱${rentAmount} (${rentFrequency})
        Deposit Amount: ₱${depositAmount}
        Terms: ${terms}
        `;

        // Save the Blob as a Word file
        const blob = new Blob([wordContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'rental_agreement.doc');

        // Show success message
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000); // Hide message after 3 seconds
    };
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
               <div className="flex-grow p-4">
    <h2 className="text-3xl font-semibold mb-8 text-center">Rental Agreements</h2>

    <p className="text-lg mb-4 text-left ml-10 mt-4">Total Agreements: {agreementsCount}</p>
 
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-10">
    {rentalAgreements.map(agreement => (
        <div key={agreement.id} className="rounded-lg overflow-hidden shadow-md bg-white">
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Lessor Name:</p>
                        <p className="text-gray-700">{agreement.lessorName}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Lessee Name:</p>
                        <p className="text-gray-700">{agreement.lesseeName}</p>
                    </div>
                    <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Warehouse Name:</p>
                        <p className="text-gray-700">{agreement.warehouseName}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Start Date:</p>
                        <p className="text-gray-700">{new Date(agreement.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">End Date:</p>
                        <p className="text-gray-700">{new Date(agreement.end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Rent Amount:</p>
                        <p className="text-gray-700">₱{agreement.rentAmount} ({agreement.rentFrequency})</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Deposit Amount:</p>
                        <p className="text-gray-700">₱{agreement.depositAmount}</p>
                    </div>
                    <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Terms:</p>
                        <p className="text-gray-700">{agreement.terms.length > 55 ? `${agreement.terms.slice(0, 55)}...` : agreement.terms}</p>
                    </div>
                </div>
                <div className="flex justify-center">
                    <button 
                        onClick={() => handleViewClick(agreement)} 
                        className="bg-blue-500 text-white rounded-md px-6 py-2 mr-2 hover:bg-blue-600 transition duration-300"
                    >
                        View
                    </button>
                    <button 
                        onClick={handleConvertToWord} 
                        className="bg-green-500 text-white rounded-md px-6 py-2 mr-2 hover:bg-green-600 transition duration-300"
                    >
                        Convert to Word
                    </button>
                    <button
                                            onClick={() => showConfirmDeleteModal(agreement.id)}
                                            className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600 transition duration-300"
                                        >
                                            Delete
                                        </button>
                </div>
            </div>
        </div>
    ))}
</div>
{confirmDeleteVisible && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="absolute bg-white rounded-lg shadow-md p-4 max-w-md">
                                <p>Are you sure you want to delete this agreement?</p>
                                <div className="flex justify-end mt-4">
                                    <button onClick={() => setConfirmDeleteVisible(false)} className="mr-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                    <button onClick={() => handleDelete(agreementToDelete)} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white">Delete</button>
                                </div>
                            </div>
                        </div>
                    )}

{DeletesuccessMessage && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md">
                            Delete successful!
                        </div>
                    )}
                     
                    {modalVisible && (
    <div>
        {/* Semi-transparent overlay */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
        
 
        {/* Modal content */}
        <div className="fixed inset-0 flex items-center justify-center z-60 ">
        <div className="relative bg-white rounded-lg shadow-md p-4 max-w-3xl max-h-full overflow-y-auto">
                <button 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
                    onClick={() => setModalVisible(false)}
                >
                    &times;
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center">Rental Agreement</h2>
                <div className="border-b border-gray-400 mb-4"></div>
                <div className="flex justify-center mb-4">
                    <div className="border border-gray-400 rounded-full px-2 py-1 text-lg font-semibold">
                        {selectedAgreement?.warehouseName}
                    </div>
                </div>
                <div className="flex mb-4 justify-end">
                    <p className="font-semibold mr-4">Lessor Name:</p>
                    <p>{selectedAgreement?.lessorName}</p>
                </div>
                <div className="flex justify-end mb-4">
                    <p className="font-semibold mr-4">Lessee Name:</p>
                    <p>{selectedAgreement?.lesseeName}</p>
                </div>
                <div className="border-b border-gray-400 mb-4"></div>
                <div className="flex justify-between mb-4">
                    <p className="font-semibold">Start Date:</p>
                    <p>{new Date(selectedAgreement?.start_date).toLocaleDateString()}</p>
                    <p className="font-semibold">End Date:</p>
                    <p>{new Date(selectedAgreement?.end_date).toLocaleDateString()}</p>
                    <p className="font-semibold">Amount:</p>
                    <p>₱{selectedAgreement?.rentAmount} ({selectedAgreement?.rentFrequency})</p>
                    <p className="font-semibold">Deposit:</p>
                    <p>₱{selectedAgreement?.depositAmount}</p>
                </div>
                <div className="border-b border-gray-400 mb-4"></div>
                <div className="mb-4">
                    <p className="font-semibold mb-2">Terms:</p>
                    <div className="pl-4 text-justify">
                        <p style={{ textIndent: '3em' }}>{selectedAgreement?.terms}</p>
                    </div>
                </div>
                <div className="flex mt-20">
                    <div className="text-right">
                        <hr className="mt-1 mb-1 border-gray-400" />
                        <p>Lessee Signature</p>
                    </div>
                </div>
                <div className="flex mt-10">
                    <div className="text-right">
                        <hr className="mt-1 mb-1 border-gray-400" />
                        <p>Lessor Signature</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
)}
 {successMessage && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md">
                            Download successful!
                        </div>
                    )}

</div>
</div>
</div>
);
}

export default RentalAgreements;
