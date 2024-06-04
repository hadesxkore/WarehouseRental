import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import axios from 'axios';

import { Carousel } from 'react-responsive-carousel';
import Footer from './Footer';
import 'leaflet/dist/leaflet.css';
import { auth } from '../firebase'; // Make sure to import auth from firebase
import 'react-datepicker/dist/react-datepicker.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import Navbar from './Navbar';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';
import './DetailedView.css';
import { firestore } from '../firebase'; // Assuming you have Firebase initialized properly
import * as THREE from 'three';
import  Panorama  from 'panolens';
import * as PANOLENS from 'panolens';
import 'panolens';

const DetailView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [mapCenter, setMapCenter] = useState([0, 0]); // Initial map center

    const { warehouse, uploaderInfo } = location.state || {};

    const [show360Modal, setShow360Modal] = useState(false);
    const [image360Url, setImage360Url] = useState('');
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [position, setPosition] = useState([0, 0]); // Initial position
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    const [error, setError] = useState(null);

    const handleRentButtonClick = () => {
        setShowConfirmationModal(true);
    };
   
// Define a custom icon for the marker
const locationIcon = new L.Icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
    shadowSize: [50, 64],
    shadowAnchor: [4, 62]
});
useEffect(() => {
    const geocodeAddress = async () => {
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(warehouse.address)}&key=87f39a31f9164bd281efd37f917e402b`);
            const { lat, lng } = response.data.results[0].geometry;
            setPosition([lat, lng]); // Set marker position
            setMapLoaded(true);
        } catch (error) {
            console.error('Error fetching coordinates:', error);
        }
    };

    if (warehouse.address) {
        geocodeAddress(); // Call the function to fetch coordinates
    }
}, [warehouse.address]);

const handleShow360Tour = (image360Url) => {
    setModalImageUrl(image360Url);
    setShow360Modal (true);
};

useEffect(() => {
    if (show360Modal && modalImageUrl) {
        initPanoramaViewer(modalImageUrl);
    }
}, [show360Modal, modalImageUrl]);


const handleFullscreen = () => {
    const viewerContainer = document.getElementById('panolens-container');
    if (viewerContainer) {
        if (viewerContainer.requestFullscreen) {
            viewerContainer.requestFullscreen();
        } else if (viewerContainer.mozRequestFullScreen) { // Firefox
            viewerContainer.mozRequestFullScreen();
        } else if (viewerContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
            viewerContainer.webkitRequestFullscreen();
        } else if (viewerContainer.msRequestFullscreen) { // IE/Edge
            viewerContainer.msRequestFullscreen();
        }
    }
};


const initPanoramaViewer = (imageUrl) => {
    const viewerContainer = document.getElementById('panolens-container');

    if (!viewerContainer) {
        console.error("Panolens container not found");
        return;
    }

    viewerContainer.innerHTML = ''; // Clear existing content

    const viewer = new PANOLENS.Viewer({ container: viewerContainer });
    const panorama = new PANOLENS.ImagePanorama(imageUrl);
    viewer.add(panorama);

    // Enable controls directly
    viewer.enableControl(PANOLENS.CONTROLS.ORBIT);
    viewer.enableControl(PANOLENS.CONTROLS.ZOOM);

    // Dispose the viewer when closing
    viewer.addEventListener('panolens-viewer-handler', () => {
        viewer.dispose();
    });
};


const handleCloseModal = () => {
    setShow360Modal(false);
    setShowModal(false);
    setModalImageUrl('');
    setImage360Url('');

};


    const handleMarkerMove = (e) => {
        const latLng = e.target.getLatLng();
        setMapCenter([latLng.lat, latLng.lng]); // Update map center when marker is moved
    };
    const handleRentConfirmation = async (confirmed) => {
        if (confirmed) {
            try {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    if (user && warehouse) {
                        try {
                            const userDoc = await firestore.collection('users').doc(user.uid).get();
                            const userData = userDoc.data();
                            console.log('User data:', userData); // Log user data here
                            if (userData) {
                                const { first_name, last_name } = userData; // Adjust field names here
                                console.log('First Name:', first_name); // Log first name here
                                console.log('Last Name:', last_name); // Log last name here
                                
                                // Retrieve the ownerUid from the warehouse data
                                const ownerUid = warehouse.userUid || warehouse.id;
                                
                                if (!ownerUid) {
                                    throw new Error('Owner UID is undefined');
                                }
                                
                                const rentedWarehouseRef = await firestore.collection('rentedWarehouses').doc();
                                await rentedWarehouseRef.set({
                                    warehouseId: rentedWarehouseRef.id,
                                    userUid: user.uid,
                                    ownerUid: ownerUid, // Set ownerUid to the uploader's UID or warehouse ID
                                    rentedAt: new Date(),
                                    status: 'Processing', // Retain the status processing
                                    rentedBy: {
                                        userId: user.uid,
                                        firstName: first_name || '',
                                        lastName: last_name || '',
                                    },
                                    amenities: warehouse.amenities,
                                    name: warehouse.name,
                                    address: warehouse.address,
                                    description: warehouse.description,
                                    price: warehouse.price,
                                    images: warehouse.images,
                                    ownerFirstName: uploaderInfo ? uploaderInfo.first_name : '',
                                    ownerLastName: uploaderInfo ? uploaderInfo.last_name : '',
                                });
                                navigate('/dashboard');
                            } else {
                                console.error('Error storing rented warehouse: User data is missing or incomplete');
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    } else {
                        console.error('Error storing rented warehouse: User ID or Warehouse data is undefined');
                    }
                    unsubscribe();
                });
            } catch (error) {
                console.error('Error storing rented warehouse:', error);
                // Handle error appropriately
            }
        }
        setShowConfirmationModal(false);
    };

    

    const ConfirmationModal = ({ show, onClose }) => {
        if (!show) return null;

        return (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg">
                    <p className="text-xl mb-4">Are you sure you want to rent this warehouse?</p>
                    <div className="flex justify-end">
                        <button className="bg-red-500 text-white px-4 py-2 rounded mr-4" onClick={() => onClose(false)}>Cancel</button>
                        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => onClose(true)}>Confirm</button>
                    </div>
                </div>
            </div>
        );
    };
    
    const createOrGetConversation = async (user, ownerUid, uploaderInfo) => {
        try {
            const participants = [user.uid, ownerUid].sort();
            const conversationRef = firestore.collection('conversations');
            const conversationSnapshot = await conversationRef
                .where('participants', 'array-contains', user.uid)
                .get();

            let conversationId = null;
            conversationSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.participants.includes(ownerUid)) {
                    conversationId = doc.id;
                }
            });

            if (!conversationId) {
                const newConversationRef = conversationRef.doc();
                await newConversationRef.set({
                    participants,
                    ownerFirstName: uploaderInfo.first_name,
                    ownerLastName: uploaderInfo.last_name,
                });
                conversationId = newConversationRef.id;
            }

            navigate(`/conversation/${conversationId}`);
        } catch (error) {
            console.error('Error creating or fetching conversation:', error);
        }
    };
    const handleMessageButtonClick = async () => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user && warehouse) {
                try {
                    const ownerUid = warehouse.userUid || warehouse.id;
                    if (!ownerUid) {
                        throw new Error('Owner UID is undefined');
                    }
                    await createOrGetConversation(user, ownerUid, uploaderInfo);
                } catch (error) {
                    console.error('Error handling message button click:', error);
                }
            }
            unsubscribe();
        });
    };


  
 

  

    const uploadDate = warehouse.uploadDate && warehouse.uploadDate.toDate ? warehouse.uploadDate.toDate() : new Date(warehouse.uploadDate.seconds * 1000);

    return (
        <div>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center">
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-lg p-8 md:flex">
                        <div className="md:w-1/2 mb-8 md:mb-0 mt-24">
                        <Carousel showThumbs={false} showArrows={true} infiniteLoop={true} autoPlay={true} interval={5000} transitionTime={500}>
                                {warehouse.images.map((imageUrl, index) => (
                                    <div key={index}>
                                        <img src={imageUrl} alt={`Warehouse Image ${index + 1}`} className="rounded-lg" />
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                        <div className="md:w-1/2 md:pl-8 text-base card">
                            <h1 className="text-3xl font-semibold mb-4">{warehouse.name}</h1>
                            <div className="text-lg mb-4"><strong>Uploader:</strong> {uploaderInfo ? `${uploaderInfo.first_name} ${uploaderInfo.last_name}` : 'Unknown'}</div>
                            <div className="text-lg mb-4"><strong>Status:</strong> <span className="text-green-500">{warehouse.status}</span></div>
                            <div className="text-lg mb-4"><strong>Address:</strong> {warehouse.address}</div>
                            <div className="text-lg mb-4"><strong>Description:</strong> {warehouse.description}</div>
                            <div className="text-lg mb-4"><strong>Price:</strong> ₱{warehouse.price}</div>
                            <div className="text-lg mb-4"><strong>Created Date:</strong> {uploadDate ? new Date(uploadDate).toLocaleString() : 'Unknown'}</div>

                            <div className="text-lg mb-4"><strong>Amenities:</strong></div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {warehouse.amenities.map((amenity, index) => (
                                    <div key={index} className="amenities-card">
                                        <img src={amenity.icon} alt={amenity.name} className="w-6 h-6 mr-2" />
                                        {amenity.name}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
    <button className="bg-blue-500 text-white font-semibold py-2 px-12 rounded hover:bg-blue-600 transition duration-300" style={{ flex: 1 }} onClick={handleRentButtonClick}>
        Rent
    </button>
    <button
                                type="button"
                                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                                onClick={() => handleShow360Tour(warehouse.image360Url)}
                            >
                                Show 360 Tour
                            </button>


    <button 
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-12 rounded shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
        onClick={handleMessageButtonClick}
    >
        Message
    </button>

</div>



                        </div>
                    </div>
                   <div className="md:flex justify-between mt-8">
    <div className="w-full md:w-3/4 lg:w-4/2 md:flex justify-center flex-col items-left">
        <div className="text-lg mb-2"><strong>LOCATION:</strong> {warehouse.address}</div>
        <div className="bg-gray-200 rounded-lg shadow-lg pr-4 pt-2 pb-2 pl-2" style={{ height: '500px' }}>
            {mapLoaded && (
                <MapContainer center={position} zoom={15} style={{ height: '100%', minHeight: '400px' }}>
                    <TileLayer
                        url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=aer2dxkMUVJORhqFpZiS"
                    />
                    <Marker position={position} draggable={true} icon={locationIcon} eventHandlers={{ dragend: handleMarkerMove }}>
                        <Popup>{warehouse.address}</Popup>
                    </Marker>
                    <Circle center={position} radius={500} /> {/* Add a Circle with a radius of 500 meters */}
                </MapContainer>
            )}
        </div>
    </div>
            
                    <div className="w-full md:w-1/4 lg:w-1/4 md:ml-4 mt-8 md:mt-0">
                        <div className="bg-gray-300 rounded-lg shadow-lg p-4">
                            <div className="flex items-center mb-4">
                                {uploaderInfo && uploaderInfo.profileImage && (
                                    <img src={uploaderInfo.profileImage} alt="Profile" className="h-12 w-12 rounded-full mr-4" />
                                )}
                                <div>
                                    <div className="text-lg font-semibold">{uploaderInfo && `${uploaderInfo.first_name} ${uploaderInfo.last_name}`}</div>
                                    <div className="text-gray-600">{uploaderInfo && uploaderInfo.status}</div>
                                </div>
                            </div>
                            <form>
                                <div className="mb-4">
                                    <label htmlFor="firstName" className="block text-sm font-semibold mb-2">First Name</label>
                                    <input type="text" id="firstName" name="firstName" className="w-full border-gray-300 rounded-md py-2 px-3" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="lastName" className="block text-sm font-semibold mb-2">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" className="w-full border-gray-300 rounded-md py-2 px-3" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                                    <input type="email" id="email" name="email" className="w-full border-gray-300 rounded-md py-2 px-3" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="message" className="block text-sm font-semibold mb-2">Message</label>
                                    <textarea id="message" name="message" rows="4" className="w-full border-gray-300 rounded-md py-2 px-3"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Contact Owner</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
           {/* Confirmation modal */}
           <ConfirmationModal show={showConfirmationModal} onClose={handleRentConfirmation} />
           {show360Modal && (
    <div className="modal" style={{ zIndex: 9999 }}> {/* Set a high z-index value */}
        <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>×</span>
            <div id="panolens-container" style={{ width: '100%', height: '800px' }}></div>
            <button onClick={handleFullscreen}>Enter Fullscreen</button>
        </div>
    </div>
)}
        </div>
    </div>
);
};

export default DetailView;
