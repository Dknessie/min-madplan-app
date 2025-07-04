import React, { useState, useEffect, useMemo } from 'react';

// --- Firebase Imports ---
// Importerer de nødvendige funktioner fra Firebase SDK'erne.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- Firebase Configuration & Initialization (RETTET) ---
// Her læser vi konfigurationen fra de globale variabler, som Canvas-miljøet stiller til rådighed.
// Dette fjerner fejlen "process is not defined", da vi ikke længere bruger process.env i browseren.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Vi initialiserer kun Firebase, hvis konfigurationen er tilgængelig, for at undgå fejl.
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;
const provider = app ? new GoogleAuthProvider() : null;


// --- Ikoner (SVG-komponenter) ---
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const PlusCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ListIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const SnowflakeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>;
const BookOpenIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ClockIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const InfoIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const PlusIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const StarIcon = ({ className, isFavorite }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const SearchIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const XIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ChevronLeftIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const PackagePlusIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 16h6v-2h-6v-2h6V8h-6V6h6V4h-6"/><path d="M12 12H9v3H6v3h3v3h3v-3h3v-3h-3z"/><path d="M2.92 8.42A2 2 0 0 0 2 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-.92-1.58"/><path d="M12 12v10"/><path d="m14 2-8 6"/><path d="m2 10 10-7 10 7"/></svg>;
const LogOutIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const GoogleIcon = ({ className }) => <svg className={className} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>;


// Ikoner for varekatalog kategorier
const CarrotIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.4 2.7c.3-.3.8-.3 1.1 0l5.2 5.2c.3.3.3.8 0 1.1l-2.1 2.1-6.2-6.2 2-2z" /><path d="M12.2 12.2 6 18.4l-3.3-3.3a1 1 0 0 1 0-1.4l7.5-7.5" /></svg>;
const AppleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></svg>;
const MilkIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 2v17.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V2" /><path d="M9 8h6" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>;
const FishIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6.5 12.5c.4-2.5 4-4.5 7.5-4.5s7.1 2 7.5 4.5c.4 2.5-2.5 4.5-7.5 4.5s-7.9-2-7.5-4.5z" /><path d="M18 12v.5" /><path d="M16 17.9a5.3 5.3 0 0 0-3-1.4c-1.3 0-2.5.6-3 1.4" /><path d="M21 12c0-2-1.5-3.5-4-3.5s-4 1.5-4 3.5" /><path d="M2.5 12.5c0-2.5 2-4.5 5-4.5s5 2 5 4.5" /></svg>;
const WheatIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" /><path d="M20 22v-4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4" /><path d="M12 16s-4-3-4-6 4-6 4-6 4 3 4 6-4 6-4 6z" /><path d="M12 2v4" /></svg>;
const JarIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 4v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4" /><path d="M9 8h6" /></svg>;
const BottleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 4v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V4" /><path d="M9 8h6" /></svg>;
const CandyIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v0z" /><path d="M17 8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4" /><path d="M17 16a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4" /></svg>;
const BoxIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;

const CATEGORIES = [
    { name: 'Grønt', icon: <CarrotIcon className="w-6 h-6 mr-2 text-green-600" /> },
    { name: 'Frugt', icon: <AppleIcon className="w-6 h-6 mr-2 text-red-500" /> },
    { name: 'Mejeri', icon: <MilkIcon className="w-6 h-6 mr-2 text-blue-300" /> },
    { name: 'Kød & Fisk', icon: <FishIcon className="w-6 h-6 mr-2 text-rose-500" /> },
    { name: 'Frysevarer', icon: <SnowflakeIcon className="w-6 h-6 mr-2 text-cyan-500" /> },
    { name: 'Brød & Korn', icon: <WheatIcon className="w-6 h-6 mr-2 text-yellow-600" /> },
    { name: 'Kolonial', icon: <JarIcon className="w-6 h-6 mr-2 text-orange-500" /> },
    { name: 'Drikkevarer', icon: <BottleIcon className="w-6 h-6 mr-2 text-blue-500" /> },
    { name: 'Snacks & Slik', icon: <CandyIcon className="w-6 h-6 mr-2 text-pink-500" /> },
    { name: 'Andet', icon: <BoxIcon className="w-6 h-6 mr-2 text-gray-500" /> },
];

// --- Enheds-konverterings-funktioner ---
const unitConversionMap = { g: { base: 'g', factor: 1 }, kg: { base: 'g', factor: 1000 }, ml: { base: 'ml', factor: 1 }, dl: { base: 'ml', factor: 100 }, l: { base: 'ml', factor: 1000 }, stk: { base: 'stk', factor: 1 }, pakke: { base: 'stk', factor: 1 }, dåse: { base: 'stk', factor: 1 }, tsk: { base: 'stk', factor: 1 }, spsk: { base: 'stk', factor: 1 }, fed: { base: 'stk', factor: 1 }, bundt: { base: 'stk', factor: 1 } };

function convertToUnit(quantity, unit, catalogItem) {
    if (catalogItem && catalogItem.customConversions) {
        const customRule = catalogItem.customConversions.find(c => c.fromUnit.toLowerCase() === unit.toLowerCase());
        if (customRule) {
            return {
                quantityInBase: quantity * customRule.amount,
                baseUnit: catalogItem.baseUnit
            };
        }
    }
    const globalRule = unitConversionMap[unit.toLowerCase()];
    if (globalRule) {
        return {
            quantityInBase: quantity * globalRule.factor,
            baseUnit: globalRule.base
        };
    }
    return { quantityInBase: quantity, baseUnit: unit };
}

function formatDisplayQuantity(quantityInBase, baseUnit) { const cleanValue = (val) => parseFloat(val.toFixed(2)).toString().replace(/\.00$/, ''); if (baseUnit === 'g') { if (quantityInBase >= 1000) { return { displayQuantity: cleanValue(quantityInBase / 1000), displayUnit: 'kg' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: 'g' }; } if (baseUnit === 'ml') { if (quantityInBase >= 1000) { return { displayQuantity: cleanValue(quantityInBase / 1000), displayUnit: 'L' }; } if (quantityInBase >= 100) { return { displayQuantity: cleanValue(quantityInBase / 100), displayUnit: 'dl' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: 'ml' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: baseUnit }; }

// --- Login Skærm ---
function LoginScreen({ onLogin, isLoggingIn }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#FBF9F1]">
            <div className="text-center p-8 bg-[#FFFCF0] rounded-2xl shadow-lg border-2 border-amber-200">
                <h1 className="text-5xl font-bold text-lime-900 font-heading mb-4">Velkommen til Madplanen!</h1>
                <p className="text-stone-600 mb-8">Log ind med din Google-konto for at fortsætte.</p>
                <button 
                    onClick={onLogin}
                    disabled={isLoggingIn}
                    className="bg-lime-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-lime-700 shadow-md hover:shadow-lg transition-all text-lg button-press flex items-center justify-center mx-auto gap-3 disabled:bg-lime-400 disabled:cursor-wait"
                >
                    {isLoggingIn ? (
                        'Logger ind...'
                    ) : (
                        <>
                            <GoogleIcon className="w-6 h-6 bg-white rounded-full p-0.5" />
                            Log ind med Google
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// --- MODAL KOMPONENTER ---
function ItemManagementModal({ catalogItem, itemToCreate, onSave, onUpdate, onAddStock, onClose }) {
    const isNewItem = !catalogItem;
    const [activeTab, setActiveTab] = useState(isNewItem ? 'editItem' : 'addStock');

    // Form state for creating/editing catalog item
    const [name, setName] = useState(catalogItem?.name || itemToCreate?.name || '');
    const [category, setCategory] = useState(catalogItem?.category || 'Andet');
    const [baseUnit, setBaseUnit] = useState(catalogItem?.baseUnit || 'stk');
    const [minStock, setMinStock] = useState(catalogItem?.minStock ?? '');
    const [defaultLocation, setDefaultLocation] = useState(catalogItem?.defaultLocation || 'Køleskab');
    const [imageUrl, setImageUrl] = useState(catalogItem?.imageUrl || '');
    const [customConversions, setCustomConversions] = useState(catalogItem?.customConversions || [{ id: crypto.randomUUID(), fromUnit: '', amount: '' }]);
    
    // Form state for adding stock
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockUnit, setStockUnit] = useState(catalogItem?.baseUnit || 'stk');
    const [stockPrice, setStockPrice] = useState('');
    const [stockExpiryDate, setStockExpiryDate] = useState('');
    const [stockPurchaseDate, setStockPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
    const [stockLocation, setStockLocation] = useState(catalogItem?.defaultLocation || 'Køleskab');

    // Handlers for Custom Conversions
    const handleConversionChange = (id, field, value) => {
        setCustomConversions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const addConversion = () => {
        setCustomConversions(prev => [...prev, { id: crypto.randomUUID(), fromUnit: '', amount: '' }]);
    };
    const removeConversion = (id) => {
        setCustomConversions(prev => prev.filter(c => c.id !== id));
    };

    const handleSaveOrUpdateSubmit = (e) => {
        e.preventDefault();
        const data = {
            name,
            category,
            baseUnit,
            minStock: parseFloat(minStock) || 0,
            defaultLocation,
            imageUrl,
            customConversions: customConversions.filter(c => c.fromUnit && c.amount)
        };
        if (isNewItem) {
            onSave(data);
        } else {
            onUpdate(catalogItem.id, data);
        }
        onClose();
    };
    
    const handleAddStockSubmit = (e) => {
        e.preventDefault();
        const { quantityInBase } = convertToUnit(parseFloat(stockQuantity), stockUnit, catalogItem);
        onAddStock(catalogItem, {
            quantityInBase,
            price: parseFloat(stockPrice) || 0,
            expiryDate: stockExpiryDate,
            purchaseDate: stockPurchaseDate,
            location: stockLocation
        });
        setStockQuantity('');
        setStockPrice('');
        setStockExpiryDate('');
        onClose();
    };

    const editOrCreateForm = (
        <form onSubmit={handleSaveOrUpdateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Navn</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Kategori</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner">
                        {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Billede URL</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Grund-enhed</label>
                    <select value={baseUnit} onChange={e => setBaseUnit(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" disabled={!isNewItem}>
                        <option value="g">Gram (g)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="stk">Styk (stk)</option>
                    </select>
                    {!isNewItem && <p className="text-xs text-stone-400 mt-1">Kan ikke ændres.</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Min. beholdning</label>
                    <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" placeholder="F.eks. 100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Standard Placering</label>
                    <select value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner">
                        <option>Køleskab</option>
                        <option>Fryser</option>
                        <option>Køkkenskab</option>
                    </select>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-heading text-lime-900 mb-2">Konverteringer</h4>
                <p className="text-sm text-stone-500 mb-3">Definer hvordan andre enheder skal omregnes til grund-enheden ({baseUnit}). F.eks. 1 pakke = 500g.</p>
                <div className="space-y-2">
                    {customConversions.map((conv) => (
                        <div key={conv.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-200">
                            <span className="font-medium">1</span>
                            <input type="text" placeholder="Enhed (f.eks. pakke)" value={conv.fromUnit} onChange={e => handleConversionChange(conv.id, 'fromUnit', e.target.value)} className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg" />
                            <span className="font-medium">=</span>
                            <input type="number" step="any" placeholder="Antal" value={conv.amount} onChange={e => handleConversionChange(conv.id, 'amount', e.target.value)} className="w-24 px-3 py-2 bg-white border border-amber-300 rounded-lg" />
                            <span className="font-medium text-stone-500">{baseUnit}</span>
                            <button type="button" onClick={() => removeConversion(conv.id)} className="text-red-500 p-2 rounded-full hover:bg-red-100"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addConversion} className="mt-2 text-sm text-lime-700 font-semibold hover:underline">+ Tilføj konvertering</button>
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-amber-200 mt-6">
                <button type="button" onClick={onClose} className="bg-stone-200 text-stone-800 font-bold py-2 px-6 rounded-lg hover:bg-stone-300 shadow-sm hover:shadow-md transition-all">Annuller</button>
                <button type="submit" className="bg-lime-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-lime-700 shadow-sm hover:shadow-md transition-all">{isNewItem ? 'Opret Varekort' : 'Gem Ændringer'}</button>
            </div>
        </form>
    );

    const addStockForm = (
        <form onSubmit={handleAddStockSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Antal</label>
                    <input type="number" step="any" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Enhed</label>
                    <input type="text" value={stockUnit} onChange={e => setStockUnit(e.target.value)} required className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Pris (valgfri)</label>
                    <input type="number" step="any" value={stockPrice} onChange={e => setStockPrice(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Placering</label>
                    <select value={stockLocation} onChange={e => setStockLocation(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner">
                        <option>Køleskab</option>
                        <option>Fryser</option>
                        <option>Køkkenskab</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Købsdato</label>
                    <input type="date" value={stockPurchaseDate} onChange={e => setStockPurchaseDate(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1 font-heading">Udløbsdato (valgfri)</label>
                    <input type="date" value={stockExpiryDate} onChange={e => setStockExpiryDate(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-inner" />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="bg-stone-200 text-stone-800 font-bold py-2 px-6 rounded-lg hover:bg-stone-300 shadow-sm hover:shadow-md transition-all">Annuller</button>
                <button type="submit" className="bg-lime-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-lime-700 shadow-sm hover:shadow-md transition-all">Tilføj Lager</button>
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-amber-200">
                <div className="p-6 border-b border-amber-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-lime-900 font-heading">{isNewItem ? 'Opret Varekort' : `Administrer: ${catalogItem.name}`}</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800"><XIcon className="w-6 h-6" /></button>
                </div>
                
                {!isNewItem && (
                    <div className="border-b border-amber-200">
                        <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('addStock')} className={`${activeTab === 'addStock' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm font-heading`}>
                                Tilføj til Lager
                            </button>
                            <button onClick={() => setActiveTab('editItem')} className={`${activeTab === 'editItem' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm font-heading`}>
                                Rediger Varekort
                            </button>
                        </nav>
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    {isNewItem && editOrCreateForm}
                    {!isNewItem && activeTab === 'addStock' && addStockForm}
                    {!isNewItem && activeTab === 'editItem' && editOrCreateForm}
                </div>
            </div>
        </div>
    );
}

// --- Hoved App Komponent ---
export default function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Data states
    const [items, setItems] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [recipes, setRecipes] = useState([]);
    
    // UI states
    const [cartItems, setCartItems] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [mealPlan, setMealPlan] = useState({});
    
    // Modals
    const [itemManagementModal, setItemManagementModal] = useState({ isOpen: false, catalogItem: null, itemToCreate: null });
    const [mealPlanModal, setMealPlanModal] = useState({ isOpen: false, recipe: null });
    const [addToShoppingListModal, setAddToShoppingListModal] = useState({ isOpen: false, recipe: null });
    const [editingRecipeModal, setEditingRecipeModal] = useState({ isOpen: false, recipe: null });
    const [recipeDetailsModal, setRecipeDetailsModal] = useState({ isOpen: false, recipe: null, recipeList: [] });
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false });
    
    const [notification, setNotification] = useState(null);
    const [error, setError] = useState('');

    // --- Firebase Auth Håndtering (RETTET) ---
    // Denne useEffect håndterer nu den indledende godkendelse.
    useEffect(() => {
        // Hvis Firebase ikke blev initialiseret korrekt, viser vi en fejl.
        if (!auth) {
            setError("Firebase kunne ikke initialiseres. Konfiguration mangler.");
            setIsLoading(false);
            return;
        }

        // Lytter til ændringer i brugerens login-status.
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        // Forsøger at logge ind automatisk, når appen starter.
        const initialSignIn = async () => {
            try {
                // Hvis der er et token fra Canvas, bruges det til at logge ind.
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } 
                // Hvis der ikke er et token og ingen er logget ind, logger vi ind anonymt.
                else if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Fejl ved automatisk login:", error);
                setError("Kunne ikke logge ind automatisk.");
                setIsLoading(false);
            }
        };

        initialSignIn();

        return () => unsubscribe();
    }, []);

    // --- Firebase Data Håndtering ---
    useEffect(() => {
        if (!user || !db) {
            // Nulstil data, hvis brugeren logger ud eller db ikke er klar
            setItems([]);
            setCatalog([]);
            setRecipes([]);
            setMealPlan({});
            return;
        };

        setIsLoading(true);
        const collectionsToFetch = [
            { name: 'catalog', setter: setCatalog },
            { name: 'inventory', setter: setItems },
            { name: 'recipes', setter: setRecipes },
        ];
        
        const unsubscribers = collectionsToFetch.map(({ name, setter }) => {
            const userScopedCollection = collection(db, `artifacts/${appId}/users/${user.uid}/${name}`);
            return onSnapshot(userScopedCollection, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setter(data);
            }, (err) => {
                console.error(`Error fetching ${name}:`, err);
                setError(`Kunne ikke hente ${name}. Tjek dine Firebase regler.`);
            });
        });
        
        const mealPlanRef = doc(db, `artifacts/${appId}/users/${user.uid}/state/mealPlan`);
        const unsubMealPlan = onSnapshot(mealPlanRef, (doc) => {
            setMealPlan(doc.exists() ? doc.data() : {});
        }, (err) => {
             console.error(`Error fetching meal plan:`, err);
             setError(`Kunne ikke hente madplan.`);
        });
        unsubscribers.push(unsubMealPlan);

        setIsLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    const handleLogin = async () => {
        if (!auth || !provider) return;
        setIsLoggingIn(true);
        setError('');
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google login failed:", error);
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                setError("Login-processen blev afbrudt. Prøv igen.");
            } else {
                setError("Login med Google fejlede. Tjek konsollen for detaljer.");
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        if (!auth) return;
        signOut(auth).catch((error) => {
            console.error("Logout failed:", error);
            setError("Kunne ikke logge ud.");
        });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({message, type});
        setTimeout(() => setNotification(null), 3000);
    };

    const addToCart = (inventoryItem, batch, quantityInBase) => {
        const cartId = `c-${crypto.randomUUID()}`;
        const catalogItem = catalog.find(c => c.id === inventoryItem.catalogId);
        if (!catalogItem) return;

        const newItem = {
            cartId,
            inventoryItemId: inventoryItem.id,
            batchId: batch.batchId,
            name: inventoryItem.name,
            quantityInBase,
            baseUnit: catalogItem.baseUnit,
        };
        setCartItems(prev => [...prev, newItem]);
    };

    const removeFromCart = (cartId) => {
        setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // --- Lager & Katalog Funktioner ---
    const handleSaveCatalogItem = async (newItemData) => {
        if (!user || !db) return;
        try {
            const userCatalogCollection = collection(db, `artifacts/${appId}/users/${user.uid}/catalog`);
            await addDoc(userCatalogCollection, newItemData);
            showNotification(`${newItemData.name} er oprettet i kataloget.`);
            setItemManagementModal({ isOpen: false, catalogItem: null, itemToCreate: null });
        } catch (e) {
            console.error("Error adding document: ", e);
            setError("Fejl ved oprettelse af vare.");
        }
    };

    const handleUpdateCatalogItem = async (id, updatedData) => {
        if (!user || !db) return;
        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/catalog`, id);
        try {
            await updateDoc(docRef, updatedData);
            showNotification(`${updatedData.name} er opdateret.`);
        } catch (e) {
            console.error("Error updating document: ", e);
            setError("Fejl ved opdatering af vare.");
        }
    };

    const handleDeleteCatalogItem = async (id) => {
        if (!user || !db) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/catalog`, id));
            const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/inventory`), where("catalogId", "==", id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, document.id));
            });
            showNotification("Vare slettet fra kataloget.");
            setDeleteConfirmation({isOpen: false});
        } catch(e) {
            console.error("Error deleting document: ", e);
            setError("Fejl ved sletning af vare.");
        }
    };

    const handleAddStock = async (catalogItem, newBatch) => {
        if (!user || !db) return;
        const inventoryCollection = collection(db, `artifacts/${appId}/users/${user.uid}/inventory`);
        const q = query(inventoryCollection, where("catalogId", "==", catalogItem.id));
        
        try {
            const querySnapshot = await getDocs(q);
            const newBatchWithId = { ...newBatch, batchId: `b-${crypto.randomUUID()}` };

            if (!querySnapshot.empty) {
                const inventoryDoc = querySnapshot.docs[0];
                const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, inventoryDoc.id);
                await updateDoc(docRef, { batches: arrayUnion(newBatchWithId) });
            } else {
                await addDoc(inventoryCollection, {
                    catalogId: catalogItem.id,
                    name: catalogItem.name,
                    batches: [newBatchWithId]
                });
            }
            showNotification(`Lager for ${catalogItem.name} er opdateret.`);
        } catch (e) {
            console.error("Error adding stock: ", e);
            setError("Fejl ved opdatering af lager.");
        }
    };
    
    const handleCheckout = async () => { 
        if (!user || !db || cartItems.length === 0) return; 
        
        const updates = new Map();

        cartItems.forEach(cartItem => {
            if (!updates.has(cartItem.inventoryItemId)) {
                const originalItem = items.find(i => i.id === cartItem.inventoryItemId);
                updates.set(cartItem.inventoryItemId, JSON.parse(JSON.stringify(originalItem)));
            }

            const itemToUpdate = updates.get(cartItem.inventoryItemId);
            const batch = itemToUpdate.batches.find(b => b.batchId === cartItem.batchId);
            if (batch) {
                batch.quantityInBase -= cartItem.quantityInBase;
            }
        });

        for (const [itemId, item] of updates.entries()) {
            const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, itemId);
            const newBatches = item.batches.filter(b => b.quantityInBase > 0.001);
            if (newBatches.length > 0) {
                await updateDoc(docRef, { batches: newBatches });
            } else {
                await deleteDoc(docRef);
            }
        }
        
        setCartItems([]); 
        showNotification("Lageret er opdateret!"); 
    };

    const availableItems = useMemo(() => {
        const cartReservations = cartItems.reduce((acc, cartItem) => {
            const key = `${cartItem.inventoryItemId}-${cartItem.batchId}`;
            acc[key] = (acc[key] || 0) + cartItem.quantityInBase;
            return acc;
        }, {});

        return items.map(item => {
            const newBatches = item.batches.map(batch => {
                const key = `${item.id}-${batch.batchId}`;
                const reserved = cartReservations[key] || 0;
                return { ...batch, quantityInBase: batch.quantityInBase - reserved };
            }).filter(batch => batch.quantityInBase > 0.001);

            if (newBatches.length === 0 && item.batches.length > 0) return null;
            
            const totalQuantityInBaseUnit = newBatches.reduce((sum, b) => sum + b.quantityInBase, 0);
            return { ...item, batches: newBatches, totalQuantityInBaseUnit };
        }).filter(Boolean);
    }, [items, cartItems]);

    const handleSaveRecipe = async (recipe) => { 
        if (!user || !db) return;
        try {
            const recipesCollection = collection(db, `artifacts/${appId}/users/${user.uid}/recipes`);
            await addDoc(recipesCollection, { ...recipe, isFavorite: false, createdAt: new Date().toISOString() });
            setEditingRecipeModal({ isOpen: false, recipe: null });
        } catch(e) {
            setError("Fejl ved oprettelse af opskrift.");
        }
    };
    const handleUpdateRecipe = async (id, recipe) => {
        if (!user || !db) return;
        try {
            const recipeDoc = doc(db, `artifacts/${appId}/users/${user.uid}/recipes`, id);
            await updateDoc(recipeDoc, recipe);
            setEditingRecipeModal({ isOpen: false, recipe: null });
        } catch(e) {
            setError("Fejl ved opdatering af opskrift.");
        }
    };
    const handleToggleFavorite = async (recipeId) => {
        if (!user || !db) return;
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            const recipeDoc = doc(db, `artifacts/${appId}/users/${user.uid}/recipes`, recipeId);
            await updateDoc(recipeDoc, { isFavorite: !recipe.isFavorite });
        }
    };
    
    const handleAddItemsToShoppingList = (ingredients) => {
        const newShoppingList = [...shoppingList];
        ingredients.forEach(ing => {
            const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
            const { quantityInBase, baseUnit } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem);

            const existingIndex = newShoppingList.findIndex(item => item.name === ing.name && (!item.baseUnit || item.baseUnit === baseUnit));
            if (existingIndex > -1) {
                newShoppingList[existingIndex].quantityInBase += quantityInBase;
                 const { displayQuantity, displayUnit } = formatDisplayQuantity(newShoppingList[existingIndex].quantityInBase, newShoppingList[existingIndex].baseUnit);
                 newShoppingList[existingIndex].quantity = displayQuantity;
                 newShoppingList[existingIndex].unit = displayUnit;
            } else {
                newShoppingList.push({ id: crypto.randomUUID(), name: ing.name, quantityInBase, baseUnit, quantity: ing.quantity, unit: ing.unit });
            }
        });
        setShoppingList(newShoppingList);
        showNotification(`${ingredients.length} ingrediens(er) tilføjet til indkøbslisten!`);
    };

    const handleAddRecipeToKitchenTable = (ingredients) => {
        let itemsAddedCount = 0;
        ingredients.forEach(ing => {
            const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
            if (!catalogItem) return;

            const inventoryItem = availableItems.find(item => item.catalogId === catalogItem.id);
            if (!inventoryItem) return;

            const { quantityInBase: requiredQty } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem);

            let remainingRequiredQty = requiredQty;
            const sortedBatches = [...inventoryItem.batches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

            for (const batch of sortedBatches) {
                if (remainingRequiredQty <= 0) break;
                const qtyToTake = Math.min(batch.quantityInBase, remainingRequiredQty);
                addToCart(inventoryItem, batch, qtyToTake);
                remainingRequiredQty -= qtyToTake;
            }
            if(requiredQty > 0 && requiredQty - remainingRequiredQty > 0) {
                 itemsAddedCount++;
            }
        });

        if (itemsAddedCount > 0) {
            showNotification(`${itemsAddedCount} ingrediens(er) tilføjet til køkkenbordet.`);
        }
    };
    
    const executeShoppingListConfirmation = () => {
        if (shoppingList.length === 0) return;

        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        const defaultExpiry = oneWeekFromNow.toISOString().slice(0, 10);

        shoppingList.forEach(item => {
            const catalogItem = catalog.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            if (catalogItem) {
                const { quantityInBase } = convertToUnit(parseFloat(item.quantity) || 0, item.unit, catalogItem);
                const newBatch = {
                    quantityInBase,
                    price: 0,
                    expiryDate: defaultExpiry,
                    purchaseDate: new Date().toISOString().slice(0, 10),
                    location: catalogItem.defaultLocation || 'Køleskab'
                };
                handleAddStock(catalogItem, newBatch);
            }
        });

        setShoppingList([]);
        showNotification("Indkøb bekræftet og varer lagt på lager!");
    };
    
    const handleConfirmShoppingListClick = () => {
        const itemsWithoutCatalogCard = shoppingList.filter(item => !catalog.some(c => c.name.toLowerCase() === item.name.toLowerCase()));

        if (itemsWithoutCatalogCard.length > 0) {
            setError(`Opret venligst varekort for: ${itemsWithoutCatalogCard.map(i => i.name).join(', ')}.`);
            setTimeout(() => setError(''), 5000);
            return;
        }
        
        if (shoppingList.length > 0) {
             setConfirmationModal({
                 isOpen: true,
                 title: 'Bekræft Indkøb?',
                 message: `Vil du tilføje ${shoppingList.length} vare(r) til lageret?`,
                 onConfirm: executeShoppingListConfirmation
             });
        }
    };

    const handleUpdateMealPlan = async (day, planItem) => {
        if (!user || !db) return;
        const mealPlanRef = doc(db, `artifacts/${appId}/users/${user.uid}/state/mealPlan`);
        try {
            await setDoc(mealPlanRef, {
                ...mealPlan,
                [day]: planItem
            }, { merge: true });
            if (planItem && planItem.recipe.id !== 'leftovers') {
                showNotification(`${planItem.recipe.name} er tilføjet til madplanen for ${day}.`);
            }
        } catch (e) {
            console.error("Error updating meal plan:", e);
            setError("Kunne ikke opdatere madplan.");
        }
        setMealPlanModal({ isOpen: false, recipe: null });
    };

    const handleAddMealPlanToShoppingList = () => {
        const allIngredients = Object.values(mealPlan)
            .filter(planItem => planItem && planItem.recipe.id !== 'leftovers')
            .flatMap(planItem => {
                const originalServings = planItem.recipe.servings || 1;
                const desiredServings = planItem.servings;
                const scalingFactor = desiredServings / originalServings;
                
                return planItem.recipe.ingredients.map(ing => ({
                    ...ing,
                    quantity: (parseFloat(ing.quantity) * scalingFactor).toString()
                }));
            });

        if (allIngredients.length === 0) {
            showNotification("Madplanen er tom eller indeholder kun rester.");
            return;
        }

        handleAddItemsToShoppingList(allIngredients);
    };

    const expiringItems = useMemo(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        return items.flatMap(item => {
            const catalogItem = catalog.find(c => c.id === item.catalogId);
            return item.batches
                .filter(batch => {
                    if (!batch.expiryDate) return false;
                    const expiryDate = new Date(batch.expiryDate);
                    return expiryDate >= today && expiryDate <= sevenDaysFromNow;
                })
                .map(batch => ({ ...item, catalogItem, batch: batch }))
        }).sort((a, b) => new Date(a.batch.expiryDate) - new Date(b.batch.expiryDate));
    }, [items, catalog]);

    const lowStockItems = useMemo(() => {
        return catalog.map(catalogItem => {
            const inventoryItem = items.find(i => i.catalogId === catalogItem.id);
            const totalQuantity = inventoryItem ? inventoryItem.batches.reduce((sum, b) => sum + b.quantityInBase, 0) : 0;
            return { ...catalogItem, totalQuantity };
        }).filter(item => item.minStock > 0 && item.totalQuantity < item.minStock);
    }, [items, catalog]);


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-xl font-heading text-lime-800">Indlæser...</div>;
    }

    if (!user) {
        // Viser Google Login skærmen, hvis automatisk login fejler, og brugeren kan prøve manuelt.
        return <LoginScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
    }

    const renderContent = () => {
        switch (view) {
            case 'catalog': return <CatalogView setView={setView} catalog={catalog} items={items} onOpenManagementModal={(item) => setItemManagementModal({ isOpen: true, catalogItem: item, itemToCreate: null })} onDeleteRequest={(item) => setDeleteConfirmation({ isOpen: true, title: `Slet ${item.name}?`, message: 'Er du sikker på, du vil slette dette varekort og dets lagerbeholdning? Handlingen kan ikke fortrydes.', onConfirm: () => handleDeleteCatalogItem(item.id) })} />;
            case 'recipesHome': return <RecipesHomeView setView={setView} onOpenRecipeForm={() => setEditingRecipeModal({isOpen: true, recipe: null})}/>;
            case 'cookbook': return <CookbookView setView={setView} recipes={recipes} catalog={catalog} availableItems={availableItems} onEditRecipeRequest={(recipe) => setEditingRecipeModal({ isOpen: true, recipe: recipe })} onAddToKitchenTable={handleAddRecipeToKitchenTable} setConfirmationModal={setConfirmationModal} onAddToMealPlanRequest={(recipe) => setMealPlanModal({ isOpen: true, recipe })} onShowAddToShoppingListModal={(recipe) => setAddToShoppingListModal({ isOpen: true, recipe })} onToggleFavorite={handleToggleFavorite} onShowDetailsRequest={(recipe) => setRecipeDetailsModal({isOpen: true, recipe: recipe, recipeList: recipes})} />;
            case 'home': default: return <HomeView setView={setView} shoppingList={shoppingList} setShoppingList={setShoppingList} cartItems={cartItems} expiringItems={expiringItems} lowStockItems={lowStockItems} onRemoveFromCart={removeFromCart} onClearCart={clearCart} onCheckout={handleCheckout} onConfirmShoppingList={handleConfirmShoppingListClick} onSetExpiringItemDetails={(item) => setItemManagementModal({isOpen: true, catalogItem: item.catalogItem, itemToCreate: null})} mealPlan={mealPlan} onUpdateMealPlan={handleUpdateMealPlan} onAddMealPlanToShoppingList={handleAddMealPlanToShoppingList} catalog={catalog} onOpenCatalogCreation={(item) => setItemManagementModal({ isOpen: true, catalogItem: null, itemToCreate: item })} availableItems={availableItems}/>;
        }
    };

    return (
        <div className="bg-[#FBF9F1] min-h-screen font-body text-stone-700">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-lime-900 tracking-tight font-heading">{user.isAnonymous ? 'Min Madplan' : `${user.displayName}s madplan`}</h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-stone-500 hover:text-lime-700 transition-colors" title="Log ud">
                        <LogOutIcon className="w-6 h-6" />
                        <span className="hidden md:inline">Log ud</span>
                    </button>
                </header>
                {notification && <Notification {...notification} />}
                {error && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50" role="alert">{error}</div>}
                
                {renderContent()}

                {/* Modals */}
                {editingRecipeModal.isOpen && <RecipeFormModal recipeToEdit={editingRecipeModal.recipe} onSave={handleSaveRecipe} onUpdate={handleUpdateRecipe} onDone={() => setEditingRecipeModal({isOpen: false, recipe: null})} catalog={catalog} />}
                {itemManagementModal.isOpen && 
                    <ItemManagementModal 
                        catalogItem={itemManagementModal.catalogItem}
                        itemToCreate={itemManagementModal.itemToCreate}
                        inventoryItem={items.find(i => i.catalogId === itemManagementModal.catalogItem?.id)} 
                        onSave={handleSaveCatalogItem} 
                        onUpdate={handleUpdateCatalogItem} 
                        onAddStock={handleAddStock} 
                        onClose={() => setItemManagementModal({ isOpen: false, catalogItem: null, itemToCreate: null })} 
                    />
                }
                
                {confirmationModal.isOpen && <ConfirmationModal {...confirmationModal} onCancel={() => setConfirmationModal({ isOpen: false })} onConfirm={() => { confirmationModal.onConfirm(); setConfirmationModal({ isOpen: false }); }} />}
                {deleteConfirmation.isOpen && <SimpleConfirmationModal title={deleteConfirmation.title} message={deleteConfirmation.message} onConfirm={() => { deleteConfirmation.onConfirm(); setDeleteConfirmation({ isOpen: false }); }} onCancel={() => setDeleteConfirmation({ isOpen: false })} />}
                {mealPlanModal.isOpen && <AddRecipeToMealPlanModal recipe={mealPlanModal.recipe} onConfirm={handleUpdateMealPlan} onCancel={() => setMealPlanModal({ isOpen: false, recipe: null })} />}
                {addToShoppingListModal.isOpen && <AddToShoppingListModal recipe={addToShoppingListModal.recipe} onConfirm={handleAddItemsToShoppingList} onCancel={() => setAddToShoppingListModal({ isOpen: false, recipe: null })} availableItems={availableItems} catalog={catalog} />}
                {recipeDetailsModal.isOpen && <RecipeDetailsModal recipe={recipeDetailsModal.recipe} recipeList={recipes} onNavigate={(newRecipe) => setRecipeDetailsModal(prev => ({...prev, recipe: newRecipe}))} onClose={() => setRecipeDetailsModal({isOpen: false, recipe: null, recipeList: []})} />}
            </div>
        </div>
    );
}

// --- Side-komponenter ---
function HomeView({ setView, shoppingList, setShoppingList, cartItems, expiringItems, lowStockItems, onRemoveFromCart, onClearCart, onCheckout, onConfirmShoppingList, onSetExpiringItemDetails, mealPlan, onUpdateMealPlan, onAddMealPlanToShoppingList, catalog, onOpenCatalogCreation, availableItems }) {
    const [activeTab, setActiveTab] = useState('mealPlan');
    
    const handleItemChange = (id, field, value) => {
        setShoppingList(prevList => {
            const newList = [...prevList];
            const itemIndex = newList.findIndex(item => item.id === id);
            if (itemIndex === -1) return prevList;

            const updatedItem = { ...newList[itemIndex], [field]: value };

            if (field === 'quantity' || field === 'unit') {
                const catalogItem = catalog.find(c => c.name.toLowerCase() === updatedItem.name.toLowerCase());
                const { quantityInBase, baseUnit } = convertToUnit(parseFloat(updatedItem.quantity) || 0, updatedItem.unit, catalogItem);
                
                updatedItem.quantityInBase = quantityInBase;
                if(catalogItem) updatedItem.baseUnit = baseUnit;
            }

            newList[itemIndex] = updatedItem;
            return newList;
        });
    };

    const handleItemRemove = (id) => {
        setShoppingList(prevList => prevList.filter(item => item.id !== id));
    };

    const listWithDetails = useMemo(() => {
        return shoppingList.map(item => {
            const hasCatalogItem = catalog.some(catItem => catItem.name.toLowerCase() === item.name.toLowerCase());
            return {
                ...item,
                hasCatalogItem,
            };
        });
    }, [shoppingList, catalog]);

    const groupedShoppingList = useMemo(() => {
        return listWithDetails.reduce((acc, item) => {
            const catalogItem = catalog.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            const category = catalogItem ? catalogItem.category : 'Andet';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }, [listWithDetails, catalog]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'mealPlan':
                return <MealPlanView mealPlan={mealPlan} onUpdateMealPlan={onUpdateMealPlan} />;
            case 'shoppingList':
                return (
                    <div>
                        {shoppingList.length > 0 ? (
                            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-2">
                                {Object.keys(groupedShoppingList).sort().map(category => (
                                    <div key={category}>
                                        <h4 className="font-semibold text-stone-600 mb-2 pb-1 border-b font-heading">{category}</h4>
                                        <ul className="space-y-2">
                                            {groupedShoppingList[category].map(item => (
                                                <li key={item.id} className={`p-2 rounded-lg border grid grid-cols-12 gap-2 items-center transition-colors ${!item.hasCatalogItem ? 'bg-amber-100 border-amber-200' : 'bg-amber-50'}`}>
                                                    <div className="col-span-12 sm:col-span-5 font-semibold ">{item.name}</div>
                                                    <div className="col-span-6 sm:col-span-3 flex gap-2">
                                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full px-2 py-1 border rounded-md text-sm bg-white border-amber-200" placeholder="Antal" />
                                                        <input type="text" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="w-full px-2 py-1 border rounded-md text-sm bg-white border-amber-200" placeholder="Enhed"/>
                                                    </div>
                                                    <div className="col-span-6 sm:col-span-4 flex justify-end items-center gap-2">
                                                        {!item.hasCatalogItem && (
                                                            <button onClick={() => onOpenCatalogCreation(item)} className="bg-amber-500 text-white font-semibold py-1 px-2 rounded-lg hover:bg-amber-600 text-xs button-press">Opret</button>
                                                        )}
                                                        <button onClick={() => handleItemRemove(item.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-stone-500 italic text-sm mb-4">Indkøbslisten er tom.</p>}

                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <button onClick={onAddMealPlanToShoppingList} className="flex-1 bg-amber-400 text-stone-800 font-semibold py-2 px-3 rounded-lg hover:bg-amber-500 text-sm button-press">Føj Madplan til Liste</button>
                             <button onClick={() => setView('catalog')} className="flex-1 bg-stone-200 text-stone-800 font-semibold py-2 px-3 rounded-lg hover:bg-stone-300 text-sm button-press">+ Tilføj vare manuelt</button>
                            <button onClick={onConfirmShoppingList} disabled={shoppingList.length === 0} className="flex-1 bg-lime-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-lime-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed button-press">Bekræft Indkøb</button>
                        </div>
                    </div>
                );
            case 'kitchenCounter':
                return (
                    <div>
                        {cartItems.length === 0 ? <p className="text-stone-500 italic">Køkkenbordet er tomt.</p> : (
                            <>
                                <ul className="space-y-2 mb-4">
                                    {cartItems.map(item => {
                                        const { displayQuantity, displayUnit } = formatDisplayQuantity(item.quantityInBase, item.baseUnit); return (
                                            <li key={item.cartId} className="flex justify-between items-center p-2 bg-amber-50 rounded-md text-sm">
                                                <span>{item.name}</span>
                                                <div className="flex items-center gap-4"><span>{displayQuantity} {displayUnit}</span><button onClick={() => onRemoveFromCart(item.cartId)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button></div>
                                            </li>
                                        )
                                    })}
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={onClearCart} className="w-full bg-stone-200 text-stone-800 font-bold py-2 px-4 rounded-lg hover:bg-stone-300 text-sm button-press">Læg alt tilbage</button>
                                    <button onClick={onCheckout} className="w-full bg-lime-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-700 text-sm button-press">Bekræft brug</button>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'expiringItems':
                return expiringItems.length > 0 ? (
                    <ul className="space-y-2">
                        {expiringItems.map(item => (
                            <li key={item.batch.batchId} >
                                <button onClick={() => onSetExpiringItemDetails(item)} className="w-full text-left flex justify-between text-sm p-2 rounded-md hover:bg-amber-50">
                                    <span>{item.name}</span>
                                    <span className="text-amber-600 font-medium">Udløber: {new Date(item.batch.expiryDate).toLocaleDateString('da-DK')}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-stone-500 italic text-sm">Ingen varer er tæt på udløb.</p>;
            case 'lowStock':
                return lowStockItems.length > 0 ? (
                    <ul className="space-y-2">
                        {lowStockItems.map(item => {
                            const { displayQuantity, displayUnit } = formatDisplayQuantity(item.totalQuantity, item.baseUnit);
                            return (
                                <li key={item.id} className="flex justify-between text-sm p-2 rounded-md bg-rose-50 border border-rose-100">
                                    <span>{item.name}</span>
                                    <span className="text-rose-600 font-medium">Kun {displayQuantity} {displayUnit} tilbage</span>
                                </li>
                            )
                        })}
                    </ul>
                ) : <p className="text-stone-500 italic text-sm">Alt er fyldt godt op!</p>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Lato:wght@400;700&display=swap');
                .font-heading { font-family: 'Kalam', cursive; }
                .font-body { font-family: 'Lato', sans-serif; }
                .button-press:active { transform: scale(0.95); transition: transform 0.1s; }
                .animate-slide-down { animation: slide-down 0.3s ease-out forwards; overflow: hidden; }
                @keyframes slide-down { from { max-height: 0; opacity: 0; } to { max-height: 1000px; opacity: 1; } }
            `}</style>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setView('catalog')} className="bg-[#FFFCF0] p-8 rounded-2xl shadow-lg border border-amber-200 text-center hover:shadow-xl hover:border-lime-400 transition-all duration-300 group button-press transform hover:-translate-y-1">
                    <ListIcon className="mx-auto text-lime-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-semibold text-lime-800 mt-4 font-heading">Katalog</h2>
                </button>
                <button onClick={() => setView('recipesHome')} className="bg-[#FFFCF0] p-8 rounded-2xl shadow-lg border border-amber-200 text-center hover:shadow-xl hover:border-lime-400 transition-all duration-300 group button-press transform hover:-translate-y-1">
                    <BookOpenIcon className="mx-auto text-lime-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-semibold text-lime-800 mt-4 font-heading">Opskrifter</h2>
                </button>
            </div>

            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-lg border border-amber-200">
                <h2 className="text-3xl font-semibold text-lime-900 mb-4 font-heading">Oversigt</h2>
                <div className="border border-amber-200 rounded-lg">
                    <div className="border-b border-amber-200">
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('mealPlan')} className={`${activeTab === 'mealPlan' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Madplan
                            </button>
                            <button onClick={() => setActiveTab('shoppingList')} className={`${activeTab === 'shoppingList' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Indkøbsliste <span className="bg-amber-200 text-amber-800 ml-2 py-0.5 px-2 rounded-full text-xs">{shoppingList.length}</span>
                            </button>
                            <button onClick={() => setActiveTab('kitchenCounter')} className={`${activeTab === 'kitchenCounter' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Køkkenbordet <span className="bg-amber-200 text-amber-800 ml-2 py-0.5 px-2 rounded-full text-xs">{cartItems.length}</span>
                            </button>
                            <button onClick={() => setActiveTab('expiringItems')} className={`${activeTab === 'expiringItems' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Tæt på udløb <span className={`${expiringItems.length > 0 ? 'bg-amber-300 text-amber-900' : 'bg-stone-200 text-stone-600'} ml-2 py-0.5 px-2 rounded-full text-xs`}>{expiringItems.length}</span>
                            </button>
                            <button onClick={() => setActiveTab('lowStock')} className={`${activeTab === 'lowStock' ? 'border-lime-500 text-lime-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Lav beholdning <span className={`${lowStockItems.length > 0 ? 'bg-rose-200 text-rose-800' : 'bg-stone-200 text-stone-600'} ml-2 py-0.5 px-2 rounded-full text-xs`}>{lowStockItems.length}</span>
                            </button>
                        </nav>
                    </div>
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RecipesHomeView({ setView, onOpenRecipeForm }) {
    return (
        <div>
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-lime-700 font-semibold mb-6 hover:underline"> <ArrowLeftIcon /> Tilbage til Hovedmenu </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <button onClick={onOpenRecipeForm} className="bg-[#FFFCF0] p-8 rounded-2xl shadow-lg border border-amber-200 text-center hover:shadow-xl hover:border-lime-400 transition-all duration-300 group button-press">
                    <PlusCircleIcon className="mx-auto text-lime-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-semibold text-lime-800 mt-4 font-heading">Opret Opskrift</h2>
                </button>
                <button onClick={() => setView('cookbook')} className="bg-[#FFFCF0] p-8 rounded-2xl shadow-lg border border-amber-200 text-center hover:shadow-xl hover:border-lime-400 transition-all duration-300 group button-press">
                    <BookOpenIcon className="mx-auto text-lime-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-semibold text-lime-800 mt-4 font-heading">Kogebogen</h2>
                </button>
            </div>
        </div>
    );
}

// --- NY SAMLET KATALOG/LAGER-VISNING ---
function CatalogView({ setView, catalog, items, onOpenManagementModal, onDeleteRequest }) {
    const [searchTerm, setSearchTerm] = useState('');

    const catalogWithStock = useMemo(() => {
        return catalog.map(catalogItem => {
            const inventoryItem = items.find(i => i.catalogId === catalogItem.id);
            const totalQuantity = inventoryItem ? inventoryItem.batches.reduce((sum, b) => sum + b.quantityInBase, 0) : 0;
            return { ...catalogItem, totalQuantity };
        }).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [catalog, items, searchTerm]);

    const itemsByCategory = useMemo(() => {
        return catalogWithStock.reduce((acc, item) => {
            const category = item.category || 'Andet';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});
    }, [catalogWithStock]);

    const sortedCategories = Object.keys(itemsByCategory).sort();

    return (
        <div>
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-lime-700 font-semibold mb-6 hover:underline"> <ArrowLeftIcon /> Tilbage til Hovedmenu </button>
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-lg border border-amber-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-4xl font-bold text-lime-900 font-heading">Katalog & Lager</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="Søg i katalog..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-auto bg-amber-50 border-amber-200"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        </div>
                        <button onClick={() => onOpenManagementModal(null)} className="bg-lime-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-lime-700 button-press flex items-center gap-2 shadow-md">
                            <PlusIcon className="w-5 h-5" /> Opret Varekort
                        </button>
                    </div>
                </div>

                {catalog.length === 0 ? (
                    <div className="text-center py-12">
                        <ListIcon className="mx-auto h-12 w-12 text-stone-400" />
                        <h3 className="mt-2 text-lg font-medium text-stone-900 font-heading">Dit katalog er tomt</h3>
                        <p className="mt-1 text-sm text-stone-500">Opret dit første varekort for at komme i gang.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedCategories.map(category => {
                            const categoryInfo = CATEGORIES.find(c => c.name === category) || { icon: <BoxIcon className="w-6 h-6 mr-2 text-gray-500" /> };
                            return (
                                <div key={category}>
                                    <h3 className="flex items-center text-2xl font-semibold text-lime-800 mb-3 pb-2 border-b border-amber-200 font-heading">
                                        {categoryInfo.icon} {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {itemsByCategory[category].map(item => (
                                            <CatalogStockItem
                                                key={item.id}
                                                item={item}
                                                onOpenManagementModal={() => onOpenManagementModal(item)}
                                                onDelete={() => onDeleteRequest(item)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function CatalogStockItem({ item, onOpenManagementModal, onDelete }) {
    const { displayQuantity, displayUnit } = formatDisplayQuantity(item.totalQuantity, item.baseUnit);
    
    const stockPercentage = (item.minStock > 0) ? Math.min((item.totalQuantity / item.minStock) * 100, 100) : 0;
    
    const getBarColor = (percentage) => {
        if (percentage < 25) return 'bg-red-500';
        if (percentage < 75) return 'bg-amber-400';
        return 'bg-lime-500';
    };

    return (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onOpenManagementModal}>
            <div>
                <div className="flex items-start gap-4">
                    <img src={item.imageUrl || `https://placehold.co/64x64/eee/ccc?text=${item.name.charAt(0)}`} alt={`Billede af ${item.name}`} className="w-16 h-16 rounded-md object-cover bg-white flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/eee/ccc?text=${item.name.charAt(0)}`; }} />
                    <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-stone-800 truncate">{item.name}</h4>
                        <p className={`text-lg font-light ${item.totalQuantity > 0 ? 'text-lime-700' : 'text-stone-400'}`}>
                            {item.totalQuantity > 0 ? `${displayQuantity} ${displayUnit}` : 'Ikke på lager'}
                        </p>
                    </div>
                </div>
                {item.minStock > 0 && (
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${getBarColor(stockPercentage)}`} style={{ width: `${stockPercentage}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-amber-200">
                <button onClick={(e) => {e.stopPropagation(); onOpenManagementModal()}} className="p-2 text-lime-600 hover:bg-lime-100 rounded-md" title="Tilføj til lager"><PackagePlusIcon className="w-5 h-5" /></button>
                <button onClick={(e) => {e.stopPropagation(); onOpenManagementModal()}} className="p-2 text-stone-500 hover:bg-stone-200 rounded-md" title="Rediger varekort"><EditIcon className="w-4 h-4" /></button>
                <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Slet varekort"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </div>
    );
}

function RecipeFormModal({ recipeToEdit, onSave, onUpdate, onDone, catalog }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] rounded-2xl shadow-xl max-w-2xl w-full border-2 border-amber-200">
                <RecipeForm 
                    recipeToEdit={recipeToEdit}
                    onSave={onSave}
                    onUpdate={onUpdate}
                    onDone={onDone}
                    catalog={catalog}
                    isModal={true}
                />
            </div>
        </div>
    );
}

function RecipeForm({ setView, catalog, onSave, onUpdate, recipeToEdit, onDone, isModal = false }) {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('Aftensmad');
    const [prepTime, setPrepTime] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{ id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
    const [instructions, setInstructions] = useState('');
    const [tags, setTags] = useState('');
    const [notes, setNotes] = useState('');
    const [importText, setImportText] = useState('');

    useEffect(() => {
        if (recipeToEdit) {
            setName(recipeToEdit.name || '');
            setImageUrl(recipeToEdit.imageUrl || '');
            setCategory(recipeToEdit.category || 'Aftensmad');
            setPrepTime(recipeToEdit.prepTime || '');
            setServings(recipeToEdit.servings || '');
            setIngredients(recipeToEdit.ingredients.map(ing => ({ ...ing, id: ing.id || crypto.randomUUID() })) || [{ id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
            setInstructions(recipeToEdit.instructions || '');
            setTags((recipeToEdit.tags || []).join(', '));
            setNotes(recipeToEdit.notes || '');
        } else {
            // Reset for new item
            setName(''); setImageUrl(''); setCategory('Aftensmad'); setPrepTime(''); setServings('');
            setIngredients([{ id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
            setInstructions(''); setTags(''); setNotes('');
        }
    }, [recipeToEdit]);

    const handleIngredientChange = (id, field, value) => {
        setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
    };

    const addIngredient = () => {
        setIngredients(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]);
    };

    const removeIngredient = (id) => {
        setIngredients(prev => prev.filter(ing => ing.id !== id));
    };

    const handleImport = () => {
        const knownUnits = { 'g.': 'g', 'g': 'g', 'gram': 'g', 'kg.': 'kg', 'kg': 'kg', 'kilo': 'kg', 'ml': 'ml', 'dl': 'dl', 'l': 'l', 'liter': 'l', 'stk.': 'stk', 'stk': 'stk', 'ds.': 'dåse', 'ds': 'dåse', 'dåse': 'dåse', 'tsk.': 'tsk', 'tsk': 'tsk', 'spsk.': 'spsk', 'spsk': 'spsk', 'fed': 'fed', 'bundt': 'bundt' };
        const unitKeys = Object.keys(knownUnits);

        const lines = importText.split('\n').filter(line => line.trim() !== '');

        const importedIngredients = lines.map(line => {
            let originalLine = line.trim();
            let quantity = '';
            let unit = '';
            let name = '';

            const quantityMatch = originalLine.match(/^(\d+[./,]?\d*)/);

            if (quantityMatch) {
                quantity = quantityMatch[0].replace(',', '.');
                originalLine = originalLine.substring(quantityMatch[0].length).trim();
            }

            const words = originalLine.split(' ');
            const firstWord = words[0].toLowerCase();

            if (unitKeys.includes(firstWord)) {
                unit = knownUnits[firstWord];
                name = words.slice(1).join(' ');
            } else {
                name = originalLine;
            }

            name = name.trim();
            if (name) {
                name = name.charAt(0).toUpperCase() + name.slice(1);
            }

            return { id: crypto.randomUUID(), name: name, quantity: quantity, unit: unit, };
        });

        if (importedIngredients.length > 0) {
            const currentIngredients = ingredients.filter(ing => ing.name || ing.quantity || ing.unit);
            setIngredients([...currentIngredients, ...importedIngredients]);
        }
        setImportText('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const recipeData = {
            name,
            imageUrl,
            category,
            prepTime: parseInt(prepTime) || 0,
            servings: parseInt(servings) || 0,
            ingredients: ingredients.filter(ing => ing.name), // Gem kun ingredienser med et navn
            instructions,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            notes,
        };
        if (recipeToEdit) {
            onUpdate(recipeToEdit.id, recipeData);
        } else {
            onSave({...recipeData, isFavorite: false, createdAt: new Date()});
        }
        onDone();
    };
    
    const formContent = (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-lime-900 font-heading">{recipeToEdit ? 'Rediger Opskrift' : 'Opret ny opskrift'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-stone-600 mb-1">1. Opskriftnavn</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-stone-600 mb-1">2. Billede URL</label><input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-stone-600 mb-1">3. Kategori</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg h-[42px]">{['Aftensmad', 'Forret', 'Dessert', 'Bagværk', 'Salat', 'Andet'].map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-stone-600 mb-1">4. Tilberedningstid (minutter)</label><input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="f.eks. 45" className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-stone-600 mb-1">5. Antal Portioner</label><input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="4" className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/></div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-lime-800 mb-2 font-heading">6. Ingredienser</h3>
                <div className="p-4 bg-amber-100 bg-opacity-50 rounded-lg border border-amber-200 space-y-2 mb-4">
                    <label className="block text-sm font-medium text-stone-600">Importer ingrediensliste</label>
                    <textarea value={importText} onChange={e => setImportText(e.target.value)} rows="3" placeholder="Indsæt liste her. F.eks. '400g hakket oksekød'" className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg"></textarea>
                    <button type="button" onClick={handleImport} className="bg-amber-400 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-amber-500 text-sm button-press">Importer</button>
                </div>

                <div className="space-y-2">
                    {ingredients.map((ing) => (
                        <div key={ing.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-200">
                            <input type="text" list="catalog-items" placeholder="Ingrediensnavn" value={ing.name} onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg" />
                            <datalist id="catalog-items">
                                {catalog.map(catItem => <option key={catItem.id} value={catItem.name} />)}
                            </datalist>
                            <input type="number" step="any" placeholder="Antal" value={ing.quantity} onChange={e => handleIngredientChange(ing.id, 'quantity', e.target.value)} className="w-24 px-3 py-2 bg-white border border-amber-300 rounded-lg" />
                            <input type="text" placeholder="Enhed" value={ing.unit} onChange={e => handleIngredientChange(ing.id, 'unit', e.target.value)} className="w-24 px-3 py-2 bg-white border border-amber-300 rounded-lg" />
                            <button type="button" onClick={() => removeIngredient(ing.id)} className="text-red-500 p-2 rounded-full hover:bg-red-100"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addIngredient} className="mt-2 text-sm text-lime-700 font-semibold hover:underline">+ Tilføj ingrediens</button>
            </div>

            <div><label className="block text-sm font-medium text-stone-600 mb-1">7. Fremgangsmåde</label><textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows="8" className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"></textarea></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1">8. Tags (separer med komma)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="f.eks. Hurtig, Vegetarisk, Kylling" className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1">9. Noter/Tips</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"></textarea></div>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onDone} className="bg-stone-200 text-stone-800 font-bold py-2 px-6 rounded-lg hover:bg-stone-300 button-press">Annuller</button>
                <button type="submit" className="bg-lime-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-lime-700 button-press">{recipeToEdit ? 'Gem Ændringer' : 'Gem Opskrift'}</button>
            </div>
        </form>
    );

    if (isModal) {
        return formContent;
    }

    return (
        <div>
            <button onClick={() => onDone()} className="flex items-center gap-2 text-lime-700 font-semibold mb-6 hover:underline"> <ArrowLeftIcon /> Tilbage til Opskrifter </button>
            {formContent}
        </div>
    );
}

function CookbookView({ setView, recipes, catalog, availableItems, onEditRecipeRequest, onAddToKitchenTable, setConfirmationModal, onAddToMealPlanRequest, onShowAddToShoppingListModal, onToggleFavorite, onShowDetailsRequest }) {
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

    const recipesWithStock = useMemo(() => {
        return recipes.map(recipe => {
            if (!recipe.ingredients || recipe.ingredients.length === 0) {
                return { ...recipe, stockMatch: 100 };
            }
            let haveCount = 0;
            let neededCount = recipe.ingredients.length;
            recipe.ingredients.forEach(ing => {
                const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
                if (!catalogItem) {
                    neededCount--; // Don't count ingredients not in catalog
                    return;
                };

                const { quantityInBase: requiredQtyInBase } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem);
                const inventoryItem = availableItems.find(item => item.catalogId === catalogItem.id);
                const totalAvailableInBase = inventoryItem ? inventoryItem.totalQuantityInBaseUnit : 0;
                
                if (totalAvailableInBase >= requiredQtyInBase) {
                    haveCount++;
                }
            });
            const stockMatch = neededCount > 0 ? (haveCount / neededCount) * 100 : 100;
            return { ...recipe, stockMatch };
        });
    }, [recipes, availableItems, catalog]);

    const filteredAndSortedRecipes = useMemo(() => {
        let processedRecipes = [...recipesWithStock]
            .filter(recipe => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filter === 'haveAll') {
            processedRecipes = processedRecipes.filter(r => r.stockMatch === 100);
        }

        processedRecipes.sort((a, b) => {
            switch (sortBy) {
                case 'stock':
                    return b.stockMatch - a.stockMatch;
                case 'favorite':
                    return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return processedRecipes;
    }, [recipesWithStock, filter, sortBy, searchTerm]);


    const handleKitchenTableRequest = (recipe) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Tilføj til Køkkenbord?',
            message: 'Er du sikker på du vil bruge ingredienserne fra denne opskrift?',
            onConfirm: () => onAddToKitchenTable(recipe.ingredients)
        });
    };

    return (
        <div>
            <button onClick={() => setView('recipesHome')} className="flex items-center gap-2 text-lime-700 font-semibold mb-6 hover:underline"> <ArrowLeftIcon /> Tilbage til Opskrifter </button>
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-lg border border-amber-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-4xl font-bold text-lime-900 font-heading">Kogebog</h2>
                    <div className="flex flex-wrap items-center gap-4">
                         <div className="relative">
                            <input 
                                type="search" 
                                placeholder="Søg i opskrifter..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg bg-amber-50 border-amber-200"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        </div>
                        <div>
                            <label htmlFor="filter" className="text-sm font-medium text-stone-600 mr-2">Filter:</label>
                            <select id="filter" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border-amber-300 bg-amber-50">
                                <option value="all">Alle opskrifter</option>
                                <option value="haveAll">Har alle varer</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="sort" className="text-sm font-medium text-stone-600 mr-2">Sorter:</label>
                            <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border-amber-300 bg-amber-50">
                                <option value="name">Navn (A-Å)</option>
                                <option value="stock">Har flest varer</option>
                                <option value="favorite">Favoritter først</option>
                                <option value="newest">Nyeste først</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredAndSortedRecipes.length === 0 ? (
                        <div className="text-center py-12">
                            <SearchIcon className="mx-auto h-12 w-12 text-stone-400" />
                            <h3 className="mt-2 text-lg font-medium text-stone-900 font-heading">Ingen opskrifter fundet</h3>
                            <p className="mt-1 text-sm text-stone-500">Prøv at justere din søgning eller filter.</p>
                        </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onEditRecipe={() => onEditRecipeRequest(recipe)}
                                onKitchenTableRequest={() => handleKitchenTableRequest(recipe)}
                                onShowAddToShoppingListModal={() => onShowAddToShoppingListModal(recipe)}
                                onAddToMealPlanRequest={onAddToMealPlanRequest}
                                onToggleFavorite={onToggleFavorite}
                                onShowDetails={() => onShowDetailsRequest(recipe)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RecipeCard({ recipe, onEditRecipe, onKitchenTableRequest, onShowAddToShoppingListModal, onAddToMealPlanRequest, onToggleFavorite, onShowDetails }) {

    return (
        <div className="border rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col bg-[#FFFCF0] group cursor-pointer transform hover:-translate-y-1 border-amber-200" onClick={onShowDetails}>
            <div className="relative">
                 <button onClick={(e) => {e.stopPropagation(); onToggleFavorite(recipe.id)}} className="absolute top-2 right-2 text-amber-400 hover:text-amber-500 z-10 p-1 bg-white/70 rounded-full">
                    <StarIcon className="w-6 h-6" isFavorite={recipe.isFavorite} />
                </button>
                <img src={recipe.imageUrl || `https://placehold.co/300x200/eee/ccc?text=${recipe.name.charAt(0)}`} alt={recipe.name} className="w-full h-40 object-cover rounded-t-xl" />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    <p className="font-bold text-lg font-heading text-lime-900">{recipe.name}</p>
                    <div className="flex justify-between text-sm text-stone-500 mt-1">
                        <span>{recipe.category}</span>
                        {recipe.prepTime > 0 &&
                            <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" /> {recipe.prepTime} min.
                            </span>
                        }
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                        <div className="bg-lime-600 h-2.5 rounded-full" style={{width: `${recipe.stockMatch}%`}}></div>
                    </div>
                    <h4 className="font-semibold mt-2 mb-1">Ingredienser</h4>
                    <ul className="text-sm space-y-1 max-h-24 overflow-y-auto">
                        {recipe.ingredients.map((ing, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <span>{ing.quantity} {ing.unit} {ing.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-amber-200">
                    <button onClick={(e) => {e.stopPropagation(); onAddToMealPlanRequest(recipe)}} className="w-full bg-lime-100 text-lime-800 font-semibold py-2 px-3 rounded-lg hover:bg-lime-200 text-sm button-press">Føj til Madplan</button>
                    <button onClick={(e) => {e.stopPropagation(); onKitchenTableRequest()}} className="w-full bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-lg hover:bg-green-200 text-sm button-press">Tilføj til Køkkenbord</button>
                    <button
                        onClick={(e) => {e.stopPropagation(); onShowAddToShoppingListModal()}}
                        className="w-full bg-amber-100 text-amber-800 font-semibold py-2 px-3 rounded-lg hover:bg-amber-200 text-sm button-press"
                    >
                        Tilføj til indkøbsliste
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); onEditRecipe()}} className="w-full bg-stone-200 text-stone-800 font-semibold py-2 px-3 rounded-lg hover:bg-stone-300 text-sm button-press">Rediger Opskrift</button>
                </div>
            </div>
        </div>
    )
}

function ConfirmationModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-xl max-w-md w-full border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-4 font-heading text-lime-900">{title}</h2>
                <p className="mb-6 text-stone-600">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 button-press">Annuller</button>
                    <button onClick={onConfirm} className="bg-lime-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-lime-700 button-press">Bekræft</button>
                </div>
            </div>
        </div>
    );
}

function SimpleConfirmationModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-xl max-w-md w-full border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-4 font-heading text-lime-900">{title}</h2>
                <p className="mb-6 text-stone-600">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 button-press">Annuller</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 button-press">Slet</button>
                </div>
            </div>
        </div>
    );
}

function Notification({ message, type }) {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-lime-600';
    return (
        <div className={`fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in-down ${bgColor}`}>
            <InfoIcon className="w-5 h-5" />
            <span>{message}</span>
        </div>
    );
}

function MealPlanView({ mealPlan, onUpdateMealPlan }) {
    const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

    const handleRemoveRecipe = (day) => {
        onUpdateMealPlan(day, null);
    };

    const handleAddLeftovers = (day) => {
        onUpdateMealPlan(day, { recipe: {id: 'leftovers', name: 'Rester'}, servings: 0 });
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {days.map(day => (
                    <div key={day} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col">
                        <h3 className="font-bold text-stone-800 text-center mb-3 font-heading">{day}</h3>
                        <div className="flex-grow min-h-[60px] flex items-center justify-center">
                            {mealPlan[day] ? (
                                <div className="text-center w-full">
                                    <p className={`font-semibold ${mealPlan[day].recipe.id === 'leftovers' ? 'text-stone-500' : 'text-lime-800'}`}>{mealPlan[day].recipe.name}</p>
                                    <button onClick={() => handleRemoveRecipe(day)} className="text-xs text-red-500 hover:underline mt-1">Fjern</button>
                                </div>
                            ) : (
                                <button onClick={() => handleAddLeftovers(day)} className="text-xs text-stone-500 hover:text-stone-800 bg-stone-200 rounded-full px-2 py-1 flex items-center gap-1">
                                    <PlusIcon className="w-3 h-3"/> Rester
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AddRecipeToMealPlanModal({ recipe, onConfirm, onCancel }) {
    const [selectedDay, setSelectedDay] = useState('Mandag');
    const [servings, setServings] = useState(recipe.servings || 4);
    const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

    const handleSubmit = () => {
        onConfirm(selectedDay, { recipe, servings: parseInt(servings) || recipe.servings });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-xl max-w-sm w-full border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-2 font-heading text-lime-900">Føj til Madplan</h2>
                <p className="mb-4 text-stone-600">Vælg en dag og antal personer for <span className="font-semibold">{recipe.name}</span>.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Ugedag</label>
                        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            {days.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Antal personer</label>
                        <input type="number" value={servings} onChange={e => setServings(e.target.value)} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"/>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 button-press">Annuller</button>
                    <button onClick={handleSubmit} className="bg-lime-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-lime-700 button-press">Tilføj</button>
                </div>
            </div>
        </div>
    );
}

function AddToShoppingListModal({ recipe, onConfirm, onCancel, availableItems, catalog }) {
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);

    useEffect(() => {
        const ingredientsWithStock = recipe.ingredients.map(ing => {
            const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
            const inventoryItem = availableItems.find(item => item.catalogId === catalogItem?.id);
            const totalAvailableInBase = inventoryItem ? inventoryItem.totalQuantityInBaseUnit : 0;
            const { displayQuantity, displayUnit } = formatDisplayQuantity(totalAvailableInBase, catalogItem?.baseUnit || 'stk');
            
            return {
                ...ing,
                stock: totalAvailableInBase > 0 ? `${displayQuantity} ${displayUnit}` : 'Ingen på lager',
            };
        });
        setIngredientsToAdd(ingredientsWithStock);
    }, [recipe, availableItems, catalog]);

    const handleRemoveIngredient = (id) => {
        setIngredientsToAdd(prev => prev.filter(ing => ing.id !== id));
    };

    const handleConfirmClick = () => {
        onConfirm(ingredientsToAdd);
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFCF0] p-6 rounded-2xl shadow-xl max-w-md w-full border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-2 font-heading text-lime-900">Tilføj til Indkøbsliste</h2>
                <p className="mb-4 text-stone-600">Fjern de varer du allerede har. Resterende tilføjes til din indkøbsliste.</p>
                
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {ingredientsToAdd.map(ing => (
                        <li key={ing.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div>
                                <p className="font-semibold">{ing.name}</p>
                                <p className="text-sm text-stone-500">{ing.quantity} {ing.unit} <span className="text-lime-700 ml-2">({ing.stock})</span></p>
                            </div>
                            <button onClick={() => handleRemoveIngredient(ing.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4" /></button>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onCancel} className="bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 button-press">Annuller</button>
                    <button onClick={handleConfirmClick} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 button-press">Tilføj Valgte</button>
                </div>
            </div>
        </div>
    );
}

function RecipeDetailsModal({ recipe, recipeList, onNavigate, onClose }) {
    if (!recipe) return null;

    const currentIndex = recipeList.findIndex(r => r.id === recipe.id);
    const hasNext = currentIndex < recipeList.length - 1;
    const hasPrev = currentIndex > 0;

    const handlePrev = () => {
        if (hasPrev) {
            onNavigate(recipeList[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            onNavigate(recipeList[currentIndex + 1]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFFCF0] rounded-2xl shadow-xl max-w-3xl w-full relative max-h-[90vh] flex flex-col border-2 border-amber-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-amber-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-lime-900 font-heading">{recipe.name}</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <img 
                                src={recipe.imageUrl || `https://placehold.co/400x300/eee/ccc?text=${recipe.name}`} 
                                alt={recipe.name} 
                                className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/eee/ccc?text=Billede mangler`; }}
                            />
                            <div className="flex justify-between text-stone-600 text-sm mb-4">
                                <span><strong>Kategori:</strong> {recipe.category}</span>
                                {recipe.prepTime > 0 && <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {recipe.prepTime} min.</span>}
                                {recipe.servings > 0 && <span><strong>Portioner:</strong> {recipe.servings}</span>}
                            </div>
                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {recipe.tags.map(tag => <span key={tag} className="bg-lime-100 text-lime-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>)}
                                </div>
                            )}
                            {recipe.notes && (
                                <div>
                                    <h4 className="font-bold text-stone-700 mb-1 font-heading">Noter</h4>
                                    <p className="text-sm text-stone-600 bg-amber-50 p-3 rounded-lg border border-amber-200">{recipe.notes}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-lime-800 mb-2 font-heading">Ingredienser</h3>
                            <ul className="space-y-2 bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                                {recipe.ingredients.map((ing, index) => (
                                    <li key={index} className="flex justify-between text-sm border-b border-amber-100 pb-1">
                                        <span>{ing.name}</span>
                                        <span className="text-stone-500">{ing.quantity} {ing.unit}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-xl font-bold text-lime-800 mb-2 font-heading">Fremgangsmåde</h3>
                            <div className="prose prose-sm text-stone-600 whitespace-pre-wrap">
                                {recipe.instructions}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-amber-200 flex justify-between items-center">
                    <button onClick={handlePrev} disabled={!hasPrev} className="flex items-center gap-2 bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed button-press">
                        <ChevronLeftIcon className="w-5 h-5"/> Forrige
                    </button>
                    <button onClick={handleNext} disabled={!hasNext} className="flex items-center gap-2 bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed button-press">
                        Næste <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
}
