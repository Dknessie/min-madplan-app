/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useMemo } from 'react';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- React-Bootstrap Imports ---
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Image from 'react-bootstrap/Image';
import ProgressBar from 'react-bootstrap/ProgressBar';
import InputGroup from 'react-bootstrap/InputGroup';

// --- Firebase Configuration & Initialization (UNIVERSAL) ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : (process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {});

const appId = typeof __app_id !== 'undefined'
  ? __app_id
  : (process.env.REACT_APP_ID || 'default-app-id');

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;
const provider = app ? new GoogleAuthProvider() : null;

// --- Ikoner (SVG-komponenter) ---
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PlusCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ListIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const SnowflakeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>;
const BookOpenIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ClockIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const InfoIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const PlusIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const StarIcon = ({ className, isFavorite }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "#ffc107" : "none"} stroke="#ffc107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const SearchIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const XIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ChevronRightIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const PackagePlusIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 16h6v-2h-6v-2h6V8h-6V6h6V4h-6"/><path d="M12 12H9v3H6v3h3v3h3v-3h3v-3h-3z"/><path d="M2.92 8.42A2 2 0 0 0 2 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-.92-1.58"/><path d="M12 12v10"/><path d="m14 2-8 6"/><path d="m2 10 10-7 10 7"/></svg>;
const LogOutIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const GoogleIcon = ({ className }) => <svg className={className} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>;
const CarrotIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.4 2.7c.3-.3.8-.3 1.1 0l5.2 5.2c.3.3.3.8 0 1.1l-2.1 2.1-6.2-6.2 2-2z" /><path d="M12.2 12.2 6 18.4l-3.3-3.3a1 1 0 0 1 0-1.4l7.5-7.5" /></svg>;
const AppleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></svg>;
const MilkIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 2v17.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V2" /><path d="M9 8h6" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>;
const FishIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6.5 12.5c.4-2.5 4-4.5 7.5-4.5s7.1 2 7.5 4.5c.4 2.5-2.5 4.5-7.5 4.5s-7.9-2-7.5-4.5z" /><path d="M18 12v.5" /><path d="M16 17.9a5.3 5.3 0 0 0-3-1.4c-1.3 0-2.5.6-3 1.4" /><path d="M21 12c0-2-1.5-3.5-4-3.5s-4 1.5-4 3.5" /><path d="M2.5 12.5c0-2.5 2-4.5 5-4.5s5 2 5 4.5" /></svg>;
const WheatIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" /><path d="M20 22v-4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4" /><path d="M12 16s-4-3-4-6 4-6 4-6 4 3 4 6-4 6-4 6z" /><path d="M12 2v4" /></svg>;
const JarIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 4v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4" /><path d="M9 8h6" /></svg>;
const BottleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2h8v2H8z" /><path d="M9 4v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V4" /><path d="M9 8h6" /></svg>;
const CandyIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v0z" /><path d="M17 8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4" /><path d="M17 16a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4" /></svg>;
const BoxIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;

// --- Kategori Data ---
const CATEGORIES = [
    { name: 'Grønt', icon: <CarrotIcon style={{ width: 24, height: 24, color: '#16a34a' }} /> },
    { name: 'Frugt', icon: <AppleIcon style={{ width: 24, height: 24, color: '#ef4444' }} /> },
    { name: 'Mejeri', icon: <MilkIcon style={{ width: 24, height: 24, color: '#93c5fd' }} /> },
    { name: 'Kød & Fisk', icon: <FishIcon style={{ width: 24, height: 24, color: '#f43f5e' }} /> },
    { name: 'Frysevarer', icon: <SnowflakeIcon style={{ width: 24, height: 24, color: '#06b6d4' }} /> },
    { name: 'Brød & Korn', icon: <WheatIcon style={{ width: 24, height: 24, color: '#ca8a04' }} /> },
    { name: 'Kolonial', icon: <JarIcon style={{ width: 24, height: 24, color: '#f97316' }} /> },
    { name: 'Drikkevarer', icon: <BottleIcon style={{ width: 24, height: 24, color: '#3b82f6' }} /> },
    { name: 'Snacks & Slik', icon: <CandyIcon style={{ width: 24, height: 24, color: '#ec4899' }} /> },
    { name: 'Andet', icon: <BoxIcon style={{ width: 24, height: 24, color: '#6b7280' }} /> },
];

// --- Enheds-konverterings-funktioner (Uændret) ---
const unitConversionMap = { g: { base: 'g', factor: 1 }, kg: { base: 'g', factor: 1000 }, ml: { base: 'ml', factor: 1 }, dl: { base: 'ml', factor: 100 }, l: { base: 'ml', factor: 1000 }, stk: { base: 'stk', factor: 1 }, pakke: { base: 'stk', factor: 1 }, dåse: { base: 'stk', factor: 1 }, tsk: { base: 'stk', factor: 1 }, spsk: { base: 'stk', factor: 1 }, fed: { base: 'stk', factor: 1 }, bundt: { base: 'stk', factor: 1 } };
function convertToUnit(quantity, unit, catalogItem) { if (catalogItem && catalogItem.customConversions) { const customRule = catalogItem.customConversions.find(c => c.fromUnit.toLowerCase() === unit.toLowerCase()); if (customRule) { return { quantityInBase: quantity * customRule.amount, baseUnit: catalogItem.baseUnit }; } } const globalRule = unitConversionMap[unit.toLowerCase()]; if (globalRule) { return { quantityInBase: quantity * globalRule.factor, baseUnit: globalRule.base }; } return { quantityInBase: quantity, baseUnit: unit }; }
function formatDisplayQuantity(quantityInBase, baseUnit) { const cleanValue = (val) => parseFloat(val.toFixed(2)).toString().replace(/\.00$/, ''); if (baseUnit === 'g') { if (quantityInBase >= 1000) { return { displayQuantity: cleanValue(quantityInBase / 1000), displayUnit: 'kg' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: 'g' }; } if (baseUnit === 'ml') { if (quantityInBase >= 1000) { return { displayQuantity: cleanValue(quantityInBase / 1000), displayUnit: 'L' }; } if (quantityInBase >= 100) { return { displayQuantity: cleanValue(quantityInBase / 100), displayUnit: 'dl' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: 'ml' }; } return { displayQuantity: cleanValue(quantityInBase), displayUnit: baseUnit }; }

// --- Login Skærm (Bootstrap Version) ---
function LoginScreen({ onLogin, isLoggingIn }) {
    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#FBF9F1' }}>
            <Card className="text-center p-4 shadow-lg" style={{ maxWidth: '500px', backgroundColor: '#FFFCF0', border: '2px solid #fed7aa' }}>
                <Card.Body>
                    <h1 className="fw-bold mb-4 font-heading" style={{ color: '#365314', fontSize: '2.8rem' }}>Velkommen til Madplanen!</h1>
                    <p className="mb-4 text-secondary">Log ind med din Google-konto for at fortsætte.</p>
                    <Button variant="success" size="lg" onClick={onLogin} disabled={isLoggingIn}>
                        {isLoggingIn ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Logger ind...</span>
                            </>
                        ) : (
                            <>
                                <GoogleIcon className="me-2" style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', padding: '2px' }} />
                                Log ind med Google
                            </>
                        )}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

// --- MODAL KOMPONENTER (Bootstrap Version) ---
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
    const handleConversionChange = (id, field, value) => { setCustomConversions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c)); };
    const addConversion = () => { setCustomConversions(prev => [...prev, { id: crypto.randomUUID(), fromUnit: '', amount: '' }]); };
    const removeConversion = (id) => { setCustomConversions(prev => prev.filter(c => c.id !== id)); };

    const handleSaveOrUpdateSubmit = (e) => {
        e.preventDefault();
        const data = { name, category, baseUnit, minStock: parseFloat(minStock) || 0, defaultLocation, imageUrl, customConversions: customConversions.filter(c => c.fromUnit && c.amount) };
        if (isNewItem) { onSave(data); } else { onUpdate(catalogItem.id, data); }
        onClose();
    };
    
    const handleAddStockSubmit = (e) => {
        e.preventDefault();
        const { quantityInBase } = convertToUnit(parseFloat(stockQuantity), stockUnit, catalogItem);
        onAddStock(catalogItem, { quantityInBase, price: parseFloat(stockPrice) || 0, expiryDate: stockExpiryDate, purchaseDate: stockPurchaseDate, location: stockLocation });
        setStockQuantity(''); setStockPrice(''); setStockExpiryDate('');
        onClose();
    };

    const editOrCreateForm = (
        <Form onSubmit={handleSaveOrUpdateSubmit}>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="font-heading">Navn</Form.Label>
                        <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="font-heading">Kategori</Form.Label>
                        <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col xs={12}>
                    <Form.Group>
                        <Form.Label className="font-heading">Billede URL</Form.Label>
                        <Form.Control type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="font-heading">Grund-enhed</Form.Label>
                        <Form.Select value={baseUnit} onChange={e => setBaseUnit(e.target.value)} disabled={!isNewItem}>
                            <option value="g">Gram (g)</option>
                            <option value="ml">Milliliter (ml)</option>
                            <option value="stk">Styk (stk)</option>
                        </Form.Select>
                        {!isNewItem && <Form.Text muted>Kan ikke ændres.</Form.Text>}
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="font-heading">Min. beholdning</Form.Label>
                        <Form.Control type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="F.eks. 100" />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="font-heading">Standard Placering</Form.Label>
                        <Form.Select value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)}>
                            <option>Køleskab</option>
                            <option>Fryser</option>
                            <option>Køkkenskab</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <div className="mt-4">
                <h4 className="font-heading text-lime-900 fs-5">Konverteringer</h4>
                <p className="text-muted small">Definer hvordan andre enheder skal omregnes til grund-enheden ({baseUnit}). F.eks. 1 pakke = 500g.</p>
                <div className="d-grid gap-2">
                    {customConversions.map((conv) => (
                        <InputGroup key={conv.id}>
                            <InputGroup.Text>1</InputGroup.Text>
                            <Form.Control type="text" placeholder="Enhed (f.eks. pakke)" value={conv.fromUnit} onChange={e => handleConversionChange(conv.id, 'fromUnit', e.target.value)} />
                            <InputGroup.Text>=</InputGroup.Text>
                            <Form.Control type="number" step="any" placeholder="Antal" value={conv.amount} onChange={e => handleConversionChange(conv.id, 'amount', e.target.value)} />
                            <InputGroup.Text>{baseUnit}</InputGroup.Text>
                            <Button variant="outline-danger" onClick={() => removeConversion(conv.id)}><TrashIcon /></Button>
                        </InputGroup>
                    ))}
                </div>
                <Button variant="link" size="sm" onClick={addConversion} className="p-0 mt-2 text-lime-700">+ Tilføj konvertering</Button>
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <Button variant="secondary" onClick={onClose}>Annuller</Button>
                <Button variant="success" type="submit">{isNewItem ? 'Opret Varekort' : 'Gem Ændringer'}</Button>
            </div>
        </Form>
    );

    const addStockForm = (
        <Form onSubmit={handleAddStockSubmit}>
            <Row className="g-3">
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Antal</Form.Label><Form.Control type="number" step="any" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Enhed</Form.Label><Form.Control type="text" value={stockUnit} onChange={e => setStockUnit(e.target.value)} required /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Pris (valgfri)</Form.Label><Form.Control type="number" step="any" value={stockPrice} onChange={e => setStockPrice(e.target.value)} /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Placering</Form.Label><Form.Select value={stockLocation} onChange={e => setStockLocation(e.target.value)}><option>Køleskab</option><option>Fryser</option><option>Køkkenskab</option></Form.Select></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Købsdato</Form.Label><Form.Control type="date" value={stockPurchaseDate} onChange={e => setStockPurchaseDate(e.target.value)} /></Form.Group></Col>
                <Col xs={6}><Form.Group><Form.Label className="font-heading">Udløbsdato (valgfri)</Form.Label><Form.Control type="date" value={stockExpiryDate} onChange={e => setStockExpiryDate(e.target.value)} /></Form.Group></Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={onClose}>Annuller</Button>
                <Button variant="success" type="submit">Tilføj Lager</Button>
            </div>
        </Form>
    );

    return (
        <Modal show={true} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton style={{backgroundColor: '#FFFCF0', borderBottom: '1px solid #fed7aa'}}>
                <Modal.Title className="font-heading text-lime-900">{isNewItem ? 'Opret Varekort' : `Administrer: ${catalogItem.name}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{backgroundColor: '#FFFCF0'}}>
                {!isNewItem && (
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                        <Nav.Item><Nav.Link eventKey="addStock">Tilføj til Lager</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="editItem">Rediger Varekort</Nav.Link></Nav.Item>
                    </Nav>
                )}
                 {isNewItem && editOrCreateForm}
                 {!isNewItem && activeTab === 'addStock' && addStockForm}
                 {!isNewItem && activeTab === 'editItem' && editOrCreateForm}
            </Modal.Body>
        </Modal>
    );
}


// --- Hoved App Komponent ---
export default function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [items, setItems] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [mealPlan, setMealPlan] = useState({});
    const [itemManagementModal, setItemManagementModal] = useState({ isOpen: false, catalogItem: null, itemToCreate: null });
    const [mealPlanModal, setMealPlanModal] = useState({ isOpen: false, recipe: null });
    const [addToShoppingListModal, setAddToShoppingListModal] = useState({ isOpen: false, recipe: null });
    const [editingRecipeModal, setEditingRecipeModal] = useState({ isOpen: false, recipe: null });
    const [recipeDetailsModal, setRecipeDetailsModal] = useState({ isOpen: false, recipe: null, recipeList: [] });
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false });
    const [notification, setNotification] = useState(null);
    const [error, setError] = useState('');

    // --- Firebase Auth & Data Håndtering (Uændret logik) ---
    useEffect(() => { if (!auth) { setError("Firebase kunne ikke initialiseres."); setIsLoading(false); return; } const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { setUser(currentUser); setIsLoading(false); }); const initialSignIn = async () => { try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } else if (!auth.currentUser) { await signInAnonymously(auth); } } catch (error) { console.error("Fejl ved automatisk login:", error); setError("Kunne ikke logge ind automatisk."); setIsLoading(false); } }; initialSignIn(); return () => unsubscribe(); }, []);
    useEffect(() => { if (!user || !db) { setItems([]); setCatalog([]); setRecipes([]); setMealPlan({}); return; }; setIsLoading(true); const collectionsToFetch = [{ name: 'catalog', setter: setCatalog }, { name: 'inventory', setter: setItems }, { name: 'recipes', setter: setRecipes },]; const unsubscribers = collectionsToFetch.map(({ name, setter }) => { const userScopedCollection = collection(db, `artifacts/${appId}/users/${user.uid}/${name}`); return onSnapshot(userScopedCollection, (querySnapshot) => { const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setter(data); }, (err) => { console.error(`Error fetching ${name}:`, err); setError(`Kunne ikke hente ${name}.`); }); }); const mealPlanRef = doc(db, `artifacts/${appId}/users/${user.uid}/state/mealPlan`); const unsubMealPlan = onSnapshot(mealPlanRef, (doc) => { setMealPlan(doc.exists() ? doc.data() : {}); }, (err) => { console.error(`Error fetching meal plan:`, err); setError(`Kunne ikke hente madplan.`); }); unsubscribers.push(unsubMealPlan); setIsLoading(false); return () => unsubscribers.forEach(unsub => unsub()); }, [user]);

    // --- App Funktioner (Uændret logik) ---
    const handleLogin = async () => { if (!auth || !provider) return; setIsLoggingIn(true); setError(''); try { await signInWithPopup(auth, provider); } catch (error) { console.error("Google login failed:", error); if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') { setError("Login-processen blev afbrudt."); } else { setError("Login med Google fejlede."); } } finally { setIsLoggingIn(false); } };
    const handleLogout = () => { if (!auth) return; signOut(auth).catch((error) => { console.error("Logout failed:", error); setError("Kunne ikke logge ud."); }); };
    const showNotification = (message, type = 'success') => { setNotification({message, type}); setTimeout(() => setNotification(null), 3000); };
    const addToCart = (inventoryItem, batch, quantityInBase) => { const cartId = `c-${crypto.randomUUID()}`; const catalogItem = catalog.find(c => c.id === inventoryItem.catalogId); if (!catalogItem) return; const newItem = { cartId, inventoryItemId: inventoryItem.id, batchId: batch.batchId, name: inventoryItem.name, quantityInBase, baseUnit: catalogItem.baseUnit, }; setCartItems(prev => [...prev, newItem]); };
    const removeFromCart = (cartId) => { setCartItems(prev => prev.filter(item => item.cartId !== cartId)); };
    const clearCart = () => { setCartItems([]); };
    const handleSaveCatalogItem = async (newItemData) => { if (!user || !db) return; try { const userCatalogCollection = collection(db, `artifacts/${appId}/users/${user.uid}/catalog`); await addDoc(userCatalogCollection, newItemData); showNotification(`${newItemData.name} er oprettet i kataloget.`); setItemManagementModal({ isOpen: false, catalogItem: null, itemToCreate: null }); } catch (e) { console.error("Error adding document: ", e); setError("Fejl ved oprettelse af vare."); } };
    const handleUpdateCatalogItem = async (id, updatedData) => { if (!user || !db) return; const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/catalog`, id); try { await updateDoc(docRef, updatedData); showNotification(`${updatedData.name} er opdateret.`); } catch (e) { console.error("Error updating document: ", e); setError("Fejl ved opdatering af vare."); } };
    const handleDeleteCatalogItem = async (id) => { if (!user || !db) return; try { await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/catalog`, id)); const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/inventory`), where("catalogId", "==", id)); const querySnapshot = await getDocs(q); querySnapshot.forEach(async (document) => { await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, document.id)); }); showNotification("Vare slettet fra kataloget."); setDeleteConfirmation({isOpen: false}); } catch(e) { console.error("Error deleting document: ", e); setError("Fejl ved sletning af vare."); } };
    const handleAddStock = async (catalogItem, newBatch) => { if (!user || !db) return; const inventoryCollection = collection(db, `artifacts/${appId}/users/${user.uid}/inventory`); const q = query(inventoryCollection, where("catalogId", "==", catalogItem.id)); try { const querySnapshot = await getDocs(q); const newBatchWithId = { ...newBatch, batchId: `b-${crypto.randomUUID()}` }; if (!querySnapshot.empty) { const inventoryDoc = querySnapshot.docs[0]; const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, inventoryDoc.id); await updateDoc(docRef, { batches: arrayUnion(newBatchWithId) }); } else { await addDoc(inventoryCollection, { catalogId: catalogItem.id, name: catalogItem.name, batches: [newBatchWithId] }); } showNotification(`Lager for ${catalogItem.name} er opdateret.`); } catch (e) { console.error("Error adding stock: ", e); setError("Fejl ved opdatering af lager."); } };
    const handleCheckout = async () => { if (!user || !db || cartItems.length === 0) return; const updates = new Map(); cartItems.forEach(cartItem => { if (!updates.has(cartItem.inventoryItemId)) { const originalItem = items.find(i => i.id === cartItem.inventoryItemId); updates.set(cartItem.inventoryItemId, JSON.parse(JSON.stringify(originalItem))); } const itemToUpdate = updates.get(cartItem.inventoryItemId); const batch = itemToUpdate.batches.find(b => b.batchId === cartItem.batchId); if (batch) { batch.quantityInBase -= cartItem.quantityInBase; } }); for (const [itemId, item] of updates.entries()) { const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/inventory`, itemId); const newBatches = item.batches.filter(b => b.quantityInBase > 0.001); if (newBatches.length > 0) { await updateDoc(docRef, { batches: newBatches }); } else { await deleteDoc(docRef); } } setCartItems([]); showNotification("Lageret er opdateret!"); };
    const availableItems = useMemo(() => { const cartReservations = cartItems.reduce((acc, cartItem) => { const key = `${cartItem.inventoryItemId}-${cartItem.batchId}`; acc[key] = (acc[key] || 0) + cartItem.quantityInBase; return acc; }, {}); return items.map(item => { const newBatches = item.batches.map(batch => { const key = `${item.id}-${batch.batchId}`; const reserved = cartReservations[key] || 0; return { ...batch, quantityInBase: batch.quantityInBase - reserved }; }).filter(batch => batch.quantityInBase > 0.001); if (newBatches.length === 0 && item.batches.length > 0) return null; const totalQuantityInBaseUnit = newBatches.reduce((sum, b) => sum + b.quantityInBase, 0); return { ...item, batches: newBatches, totalQuantityInBaseUnit }; }).filter(Boolean); }, [items, cartItems]);
    const handleSaveRecipe = async (recipe) => { if (!user || !db) return; try { const recipesCollection = collection(db, `artifacts/${appId}/users/${user.uid}/recipes`); await addDoc(recipesCollection, { ...recipe, isFavorite: false, createdAt: new Date().toISOString() }); setEditingRecipeModal({ isOpen: false, recipe: null }); } catch(e) { setError("Fejl ved oprettelse af opskrift."); } };
    const handleUpdateRecipe = async (id, recipe) => { if (!user || !db) return; try { const recipeDoc = doc(db, `artifacts/${appId}/users/${user.uid}/recipes`, id); await updateDoc(recipeDoc, recipe); setEditingRecipeModal({ isOpen: false, recipe: null }); } catch(e) { setError("Fejl ved opdatering af opskrift."); } };
    const handleToggleFavorite = async (recipeId) => { if (!user || !db) return; const recipe = recipes.find(r => r.id === recipeId); if (recipe) { const recipeDoc = doc(db, `artifacts/${appId}/users/${user.uid}/recipes`, recipeId); await updateDoc(recipeDoc, { isFavorite: !recipe.isFavorite }); } };
    const handleAddItemsToShoppingList = (ingredients) => { const newShoppingList = [...shoppingList]; ingredients.forEach(ing => { const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase()); const { quantityInBase, baseUnit } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem); const existingIndex = newShoppingList.findIndex(item => item.name === ing.name && (!item.baseUnit || item.baseUnit === baseUnit)); if (existingIndex > -1) { newShoppingList[existingIndex].quantityInBase += quantityInBase; const { displayQuantity, displayUnit } = formatDisplayQuantity(newShoppingList[existingIndex].quantityInBase, newShoppingList[existingIndex].baseUnit); newShoppingList[existingIndex].quantity = displayQuantity; newShoppingList[existingIndex].unit = displayUnit; } else { newShoppingList.push({ id: crypto.randomUUID(), name: ing.name, quantityInBase, baseUnit, quantity: ing.quantity, unit: ing.unit }); } }); setShoppingList(newShoppingList); showNotification(`${ingredients.length} ingrediens(er) tilføjet til indkøbslisten!`); };
    const handleAddRecipeToKitchenTable = (ingredients) => { let itemsAddedCount = 0; ingredients.forEach(ing => { const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase()); if (!catalogItem) return; const inventoryItem = availableItems.find(item => item.catalogId === catalogItem.id); if (!inventoryItem) return; const { quantityInBase: requiredQty } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem); let remainingRequiredQty = requiredQty; const sortedBatches = [...inventoryItem.batches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); for (const batch of sortedBatches) { if (remainingRequiredQty <= 0) break; const qtyToTake = Math.min(batch.quantityInBase, remainingRequiredQty); addToCart(inventoryItem, batch, qtyToTake); remainingRequiredQty -= qtyToTake; } if(requiredQty > 0 && requiredQty - remainingRequiredQty > 0) { itemsAddedCount++; } }); if (itemsAddedCount > 0) { showNotification(`${itemsAddedCount} ingrediens(er) tilføjet til køkkenbordet.`); } };
    const executeShoppingListConfirmation = () => { if (shoppingList.length === 0) return; const oneWeekFromNow = new Date(); oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7); const defaultExpiry = oneWeekFromNow.toISOString().slice(0, 10); shoppingList.forEach(item => { const catalogItem = catalog.find(c => c.name.toLowerCase() === item.name.toLowerCase()); if (catalogItem) { const { quantityInBase } = convertToUnit(parseFloat(item.quantity) || 0, item.unit, catalogItem); const newBatch = { quantityInBase, price: 0, expiryDate: defaultExpiry, purchaseDate: new Date().toISOString().slice(0, 10), location: catalogItem.defaultLocation || 'Køleskab' }; handleAddStock(catalogItem, newBatch); } }); setShoppingList([]); showNotification("Indkøb bekræftet og varer lagt på lager!"); };
    const handleConfirmShoppingListClick = () => { const itemsWithoutCatalogCard = shoppingList.filter(item => !catalog.some(c => c.name.toLowerCase() === item.name.toLowerCase())); if (itemsWithoutCatalogCard.length > 0) { setError(`Opret venligst varekort for: ${itemsWithoutCatalogCard.map(i => i.name).join(', ')}.`); setTimeout(() => setError(''), 5000); return; } if (shoppingList.length > 0) { setConfirmationModal({ isOpen: true, title: 'Bekræft Indkøb?', message: `Vil du tilføje ${shoppingList.length} vare(r) til lageret?`, onConfirm: executeShoppingListConfirmation }); } };
    const handleUpdateMealPlan = async (day, planItem) => { if (!user || !db) return; const mealPlanRef = doc(db, `artifacts/${appId}/users/${user.uid}/state/mealPlan`); try { await setDoc(mealPlanRef, { ...mealPlan, [day]: planItem }, { merge: true }); if (planItem && planItem.recipe.id !== 'leftovers') { showNotification(`${planItem.recipe.name} er tilføjet til madplanen for ${day}.`); } } catch (e) { console.error("Error updating meal plan:", e); setError("Kunne ikke opdatere madplan."); } setMealPlanModal({ isOpen: false, recipe: null }); };
    const handleAddMealPlanToShoppingList = () => { const allIngredients = Object.values(mealPlan).filter(planItem => planItem && planItem.recipe.id !== 'leftovers').flatMap(planItem => { const originalServings = planItem.recipe.servings || 1; const desiredServings = planItem.servings; const scalingFactor = desiredServings / originalServings; return planItem.recipe.ingredients.map(ing => ({ ...ing, quantity: (parseFloat(ing.quantity) * scalingFactor).toString() })); }); if (allIngredients.length === 0) { showNotification("Madplanen er tom eller indeholder kun rester."); return; } handleAddItemsToShoppingList(allIngredients); };
    const expiringItems = useMemo(() => { const today = new Date(); const sevenDaysFromNow = new Date(); sevenDaysFromNow.setDate(today.getDate() + 7); return items.flatMap(item => { const catalogItem = catalog.find(c => c.id === item.catalogId); return item.batches.filter(batch => { if (!batch.expiryDate) return false; const expiryDate = new Date(batch.expiryDate); return expiryDate >= today && expiryDate <= sevenDaysFromNow; }).map(batch => ({ ...item, catalogItem, batch: batch })) }).sort((a, b) => new Date(a.batch.expiryDate) - new Date(b.batch.expiryDate)); }, [items, catalog]);
    const lowStockItems = useMemo(() => { return catalog.map(catalogItem => { const inventoryItem = items.find(i => i.catalogId === catalogItem.id); const totalQuantity = inventoryItem ? inventoryItem.batches.reduce((sum, b) => sum + b.quantityInBase, 0) : 0; return { ...catalogItem, totalQuantity }; }).filter(item => item.minStock > 0 && item.totalQuantity < item.minStock); }, [items, catalog]);

    // --- UI Rendering ---
    if (isLoading) { return <div className="d-flex justify-content-center align-items-center vh-100 fs-4 font-heading" style={{color: '#365314'}}>Indlæser...</div>; }
    if (!user) { return <LoginScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />; }

    const renderContent = () => {
        switch (view) {
            case 'catalog': return <CatalogView setView={setView} catalog={catalog} items={items} onOpenManagementModal={(item) => setItemManagementModal({ isOpen: true, catalogItem: item, itemToCreate: null })} onDeleteRequest={(item) => setDeleteConfirmation({ isOpen: true, title: `Slet ${item.name}?`, message: 'Er du sikker på, du vil slette dette varekort og dets lagerbeholdning? Handlingen kan ikke fortrydes.', onConfirm: () => handleDeleteCatalogItem(item.id) })} />;
            case 'recipesHome': return <RecipesHomeView setView={setView} onOpenRecipeForm={() => setEditingRecipeModal({isOpen: true, recipe: null})}/>;
            case 'cookbook': return <CookbookView setView={setView} recipes={recipes} catalog={catalog} availableItems={availableItems} onEditRecipeRequest={(recipe) => setEditingRecipeModal({ isOpen: true, recipe: recipe })} onAddToKitchenTable={handleAddRecipeToKitchenTable} setConfirmationModal={setConfirmationModal} onAddToMealPlanRequest={(recipe) => setMealPlanModal({ isOpen: true, recipe })} onShowAddToShoppingListModal={(recipe) => setAddToShoppingListModal({ isOpen: true, recipe })} onToggleFavorite={handleToggleFavorite} onShowDetailsRequest={(recipe) => setRecipeDetailsModal({isOpen: true, recipe: recipe, recipeList: recipes})} />;
            case 'home': default: return <HomeView setView={setView} shoppingList={shoppingList} setShoppingList={setShoppingList} cartItems={cartItems} expiringItems={expiringItems} lowStockItems={lowStockItems} onRemoveFromCart={removeFromCart} onClearCart={clearCart} onCheckout={handleCheckout} onConfirmShoppingList={handleConfirmShoppingListClick} onSetExpiringItemDetails={(item) => setItemManagementModal({isOpen: true, catalogItem: item.catalogItem, itemToCreate: null})} mealPlan={mealPlan} onUpdateMealPlan={handleUpdateMealPlan} onAddMealPlanToShoppingList={handleAddMealPlanToShoppingList} catalog={catalog} onOpenCatalogCreation={(item) => setItemManagementModal({ isOpen: true, catalogItem: null, itemToCreate: item })} availableItems={availableItems}/>;
        }
    };

    return (
        <>
            <style type="text/css">{`
                @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Lato:wght@400;700&display=swap');
                
                body {
                    background-color: #FBF9F1 !important;
                    font-family: 'Lato', sans-serif;
                    color: #44403c;
                }
                .font-heading { font-family: 'Kalam', cursive; }
                .text-lime-900 { color: #365314; }
                .text-lime-800 { color: #4d7c0f; }
                .text-lime-700 { color: #65a30d; }
                .bg-lime-600 { background-color: #65a30d; }
                .bg-amber-50 { background-color: #fffbeb; }
                .border-amber-200 { border-color: #fde68a !important; }
                .card.interactive-card {
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .card.interactive-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                    border-color: #a3e635 !important;
                }
                .nav-tabs .nav-link.active {
                    color: #4d7c0f;
                    border-color: #a3e635 #a3e635 #FFFCF0;
                    background-color: #FFFCF0;
                }
                 .nav-tabs .nav-link {
                    color: #78716c;
                 }
                 .modal-content {
                    background-color: #FFFCF0;
                    border: 2px solid #fed7aa;
                 }
                 .modal-header {
                    border-bottom: 1px solid #fed7aa;
                 }
                 .recipe-card {
                    background-color: #FFFCF0;
                    border: 1px solid #fde68a;
                    transition: all 0.2s ease-in-out;
                 }
                 .recipe-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.10) !important;
                 }
            `}</style>
            <Container className="py-4">
                <header className="d-flex justify-content-between align-items-center mb-5">
                    <h1 className="font-heading text-lime-900" style={{fontSize: '2.8rem'}}>{user.isAnonymous ? 'Min Madplan' : `${user.displayName}s madplan`}</h1>
                    <Button variant="link" onClick={handleLogout} className="d-flex align-items-center gap-2 text-secondary text-decoration-none">
                        <LogOutIcon />
                        <span className="d-none d-md-inline">Log ud</span>
                    </Button>
                </header>
                
                {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
                {error && <Alert variant="danger" style={{position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1050}} onClose={() => setError('')} dismissible>{error}</Alert>}
                
                {renderContent()}

                {/* Modals */}
                {editingRecipeModal.isOpen && <RecipeFormModal recipeToEdit={editingRecipeModal.recipe} onSave={handleSaveRecipe} onUpdate={handleUpdateRecipe} onDone={() => setEditingRecipeModal({isOpen: false, recipe: null})} catalog={catalog} />}
                {itemManagementModal.isOpen && <ItemManagementModal catalogItem={itemManagementModal.catalogItem} itemToCreate={itemManagementModal.itemToCreate} onSave={handleSaveCatalogItem} onUpdate={handleUpdateCatalogItem} onAddStock={handleAddStock} onClose={() => setItemManagementModal({ isOpen: false, catalogItem: null, itemToCreate: null })} />}
                {confirmationModal.isOpen && <ConfirmationModal show={confirmationModal.isOpen} title={confirmationModal.title} message={confirmationModal.message} onCancel={() => setConfirmationModal({ isOpen: false })} onConfirm={() => { confirmationModal.onConfirm(); setConfirmationModal({ isOpen: false }); }} />}
                {deleteConfirmation.isOpen && <SimpleConfirmationModal show={deleteConfirmation.isOpen} title={deleteConfirmation.title} message={deleteConfirmation.message} onConfirm={() => { deleteConfirmation.onConfirm(); setDeleteConfirmation({ isOpen: false }); }} onCancel={() => setDeleteConfirmation({ isOpen: false })} />}
                {mealPlanModal.isOpen && <AddRecipeToMealPlanModal show={mealPlanModal.isOpen} recipe={mealPlanModal.recipe} onConfirm={handleUpdateMealPlan} onCancel={() => setMealPlanModal({ isOpen: false, recipe: null })} />}
                {addToShoppingListModal.isOpen && <AddToShoppingListModal show={addToShoppingListModal.isOpen} recipe={addToShoppingListModal.recipe} onConfirm={handleAddItemsToShoppingList} onCancel={() => setAddToShoppingListModal({ isOpen: false, recipe: null })} availableItems={availableItems} catalog={catalog} />}
                {recipeDetailsModal.isOpen && <RecipeDetailsModal show={recipeDetailsModal.isOpen} recipe={recipeDetailsModal.recipe} recipeList={recipes} onNavigate={(newRecipe) => setRecipeDetailsModal(prev => ({...prev, recipe: newRecipe}))} onClose={() => setRecipeDetailsModal({isOpen: false, recipe: null, recipeList: []})} />}
            </Container>
        </>
    );
}

// --- Side-komponenter (Bootstrap Version) ---
function HomeView({ setView, shoppingList, setShoppingList, cartItems, expiringItems, lowStockItems, onRemoveFromCart, onClearCart, onCheckout, onConfirmShoppingList, onSetExpiringItemDetails, mealPlan, onUpdateMealPlan, onAddMealPlanToShoppingList, catalog, onOpenCatalogCreation }) {
    const [activeTab, setActiveTab] = useState('mealPlan');
    
    const handleItemChange = (id, field, value) => { setShoppingList(prevList => { const newList = [...prevList]; const itemIndex = newList.findIndex(item => item.id === id); if (itemIndex === -1) return prevList; const updatedItem = { ...newList[itemIndex], [field]: value }; if (field === 'quantity' || field === 'unit') { const catalogItem = catalog.find(c => c.name.toLowerCase() === updatedItem.name.toLowerCase()); const { quantityInBase, baseUnit } = convertToUnit(parseFloat(updatedItem.quantity) || 0, updatedItem.unit, catalogItem); updatedItem.quantityInBase = quantityInBase; if(catalogItem) updatedItem.baseUnit = baseUnit; } newList[itemIndex] = updatedItem; return newList; }); };
    const handleItemRemove = (id) => { setShoppingList(prevList => prevList.filter(item => item.id !== id)); };
    const listWithDetails = useMemo(() => { return shoppingList.map(item => { const hasCatalogItem = catalog.some(catItem => catItem.name.toLowerCase() === item.name.toLowerCase()); return { ...item, hasCatalogItem, }; }); }, [shoppingList, catalog]);
    const groupedShoppingList = useMemo(() => { return listWithDetails.reduce((acc, item) => { const catalogItem = catalog.find(c => c.name.toLowerCase() === item.name.toLowerCase()); const category = catalogItem ? catalogItem.category : 'Andet'; if (!acc[category]) { acc[category] = []; } acc[category].push(item); return acc; }, {}); }, [listWithDetails, catalog]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'mealPlan': return <MealPlanView mealPlan={mealPlan} onUpdateMealPlan={onUpdateMealPlan} />;
            case 'shoppingList':
                return (
                    <>
                        {shoppingList.length > 0 ? (
                            <div style={{maxHeight: '400px', overflowY: 'auto'}} className="pr-2">
                                {Object.keys(groupedShoppingList).sort().map(category => (
                                    <div key={category} className="mb-3">
                                        <h4 className="font-heading text-secondary border-bottom pb-1 mb-2">{category}</h4>
                                        <ListGroup variant="flush">
                                            {groupedShoppingList[category].map(item => (
                                                <ListGroup.Item key={item.id} className={`d-flex flex-wrap justify-content-between align-items-center ${!item.hasCatalogItem ? 'bg-warning-light' : ''}`} style={{backgroundColor: !item.hasCatalogItem ? 'var(--bs-warning-bg-subtle)' : 'transparent'}}>
                                                    <span className="fw-bold">{item.name}</span>
                                                    <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                                                        <Form.Control size="sm" type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} style={{width: '80px'}} />
                                                        <Form.Control size="sm" type="text" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} style={{width: '80px'}} />
                                                        {!item.hasCatalogItem && <Button size="sm" variant="warning" onClick={() => onOpenCatalogCreation(item)}>Opret</Button>}
                                                        <Button variant="link" className="text-danger p-0" onClick={() => handleItemRemove(item.id)}><TrashIcon /></Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-muted fst-italic">Indkøbslisten er tom.</p>}
                        <div className="d-grid gap-2 d-sm-flex justify-content-sm-end mt-3">
                            <Button variant="info" onClick={onAddMealPlanToShoppingList}>Føj Madplan til Liste</Button>
                            <Button variant="secondary" onClick={() => setView('catalog')}>+ Tilføj vare manuelt</Button>
                            <Button variant="success" onClick={onConfirmShoppingList} disabled={shoppingList.length === 0}>Bekræft Indkøb</Button>
                        </div>
                    </>
                );
            case 'kitchenCounter':
                return (
                    <>
                        {cartItems.length === 0 ? <p className="text-muted fst-italic">Køkkenbordet er tomt.</p> : (
                            <>
                                <ListGroup>
                                    {cartItems.map(item => { const { displayQuantity, displayUnit } = formatDisplayQuantity(item.quantityInBase, item.baseUnit); return (
                                        <ListGroup.Item key={item.cartId} className="d-flex justify-content-between align-items-center">
                                            {item.name}
                                            <div>
                                                <Badge bg="light" text="dark" className="me-3">{displayQuantity} {displayUnit}</Badge>
                                                <Button variant="link" className="text-danger p-0" onClick={() => onRemoveFromCart(item.cartId)}><TrashIcon /></Button>
                                            </div>
                                        </ListGroup.Item>
                                    )})}
                                </ListGroup>
                                <div className="d-grid gap-2 d-sm-flex justify-content-sm-end mt-3">
                                    <Button variant="secondary" onClick={onClearCart}>Læg alt tilbage</Button>
                                    <Button variant="success" onClick={onCheckout}>Bekræft brug</Button>
                                </div>
                            </>
                        )}
                    </>
                );
            case 'expiringItems':
                return expiringItems.length > 0 ? (
                    <ListGroup>
                        {expiringItems.map(item => (
                            <ListGroup.Item action key={item.batch.batchId} onClick={() => onSetExpiringItemDetails(item)} className="d-flex justify-content-between align-items-center">
                                {item.name}
                                <Badge bg="warning" text="dark">Udløber: {new Date(item.batch.expiryDate).toLocaleDateString('da-DK')}</Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : <p className="text-muted fst-italic">Ingen varer er tæt på udløb.</p>;
            case 'lowStock':
                return lowStockItems.length > 0 ? (
                    <ListGroup>
                        {lowStockItems.map(item => { const { displayQuantity, displayUnit } = formatDisplayQuantity(item.totalQuantity, item.baseUnit); return (
                            <ListGroup.Item key={item.id} variant="danger" className="d-flex justify-content-between align-items-center">
                                {item.name}
                                <span>Kun {displayQuantity} {displayUnit} tilbage</span>
                            </ListGroup.Item>
                        )})}
                    </ListGroup>
                ) : <p className="text-muted fst-italic">Alt er fyldt godt op!</p>;
            default: return null;
        }
    };

    return (
        <div className="d-grid gap-4">
            <Row xs={1} md={2} className="g-4">
                <Col>
                    <Card body className="text-center p-4 interactive-card" role="button" onClick={() => setView('catalog')} style={{backgroundColor: '#FFFCF0'}}>
                        <ListIcon className="text-lime-700" />
                        <h2 className="mt-3 font-heading text-lime-800">Katalog</h2>
                    </Card>
                </Col>
                <Col>
                    <Card body className="text-center p-4 interactive-card" role="button" onClick={() => setView('recipesHome')} style={{backgroundColor: '#FFFCF0'}}>
                        <BookOpenIcon className="text-lime-700" />
                        <h2 className="mt-3 font-heading text-lime-800">Opskrifter</h2>
                    </Card>
                </Col>
            </Row>

            <Card style={{backgroundColor: '#FFFCF0'}}>
                <Card.Header style={{backgroundColor: '#FFFCF0', borderBottom: '1px solid #a3e635'}}>
                    <Nav variant="tabs" defaultActiveKey="mealPlan" onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="mealPlan">Madplan</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="shoppingList">Indkøbsliste <Badge pill bg="secondary">{shoppingList.length}</Badge></Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="kitchenCounter">Køkkenbordet <Badge pill bg="secondary">{cartItems.length}</Badge></Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="expiringItems">Tæt på udløb <Badge pill bg={expiringItems.length > 0 ? 'warning' : 'secondary'}>{expiringItems.length}</Badge></Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="lowStock">Lav beholdning <Badge pill bg={lowStockItems.length > 0 ? 'danger' : 'secondary'}>{lowStockItems.length}</Badge></Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {renderTabContent()}
                </Card.Body>
            </Card>
        </div>
    );
}

function RecipesHomeView({ setView, onOpenRecipeForm }) {
    return (
        <div>
            <Button variant="link" onClick={() => setView('home')} className="mb-4 p-0 text-lime-700 text-decoration-none"><ArrowLeftIcon /> Tilbage til Hovedmenu</Button>
            <Row xs={1} md={2} className="g-4 mt-2">
                <Col>
                    <Card body className="text-center p-4 interactive-card" role="button" onClick={onOpenRecipeForm} style={{backgroundColor: '#FFFCF0'}}>
                        <PlusCircleIcon className="text-lime-700" />
                        <h2 className="mt-3 font-heading text-lime-800">Opret Opskrift</h2>
                    </Card>
                </Col>
                <Col>
                    <Card body className="text-center p-4 interactive-card" role="button" onClick={() => setView('cookbook')} style={{backgroundColor: '#FFFCF0'}}>
                        <BookOpenIcon className="text-lime-700" />
                        <h2 className="mt-3 font-heading text-lime-800">Kogebogen</h2>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

function CatalogView({ setView, catalog, items, onOpenManagementModal, onDeleteRequest }) {
    const [searchTerm, setSearchTerm] = useState('');
    const catalogWithStock = useMemo(() => { return catalog.map(catalogItem => { const inventoryItem = items.find(i => i.catalogId === catalogItem.id); const totalQuantity = inventoryItem ? inventoryItem.batches.reduce((sum, b) => sum + b.quantityInBase, 0) : 0; return { ...catalogItem, totalQuantity }; }).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())); }, [catalog, items, searchTerm]);
    const itemsByCategory = useMemo(() => { return catalogWithStock.reduce((acc, item) => { const category = item.category || 'Andet'; if (!acc[category]) acc[category] = []; acc[category].push(item); return acc; }, {}); }, [catalogWithStock]);
    const sortedCategories = Object.keys(itemsByCategory).sort();

    return (
        <div>
            <Button variant="link" onClick={() => setView('home')} className="mb-4 p-0 text-lime-700 text-decoration-none"><ArrowLeftIcon /> Tilbage til Hovedmenu</Button>
            <Card style={{backgroundColor: '#FFFCF0'}}>
                <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <h2 className="font-heading text-lime-900 m-0">Katalog & Lager</h2>
                    <div className="d-flex align-items-center gap-2">
                        <InputGroup>
                            <InputGroup.Text><SearchIcon /></InputGroup.Text>
                            <Form.Control placeholder="Søg..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </InputGroup>
                        <Button variant="success" onClick={() => onOpenManagementModal(null)}><PlusIcon /> Opret</Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {catalog.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <ListIcon style={{width: 60, height: 60}} />
                            <h3 className="mt-3 font-heading">Dit katalog er tomt</h3>
                            <p>Opret dit første varekort for at komme i gang.</p>
                        </div>
                    ) : (
                        <div className="d-grid gap-4">
                            {sortedCategories.map(category => {
                                const categoryInfo = CATEGORIES.find(c => c.name === category) || { icon: <BoxIcon /> };
                                return (
                                    <div key={category}>
                                        <h3 className="d-flex align-items-center gap-2 font-heading text-lime-800 fs-4 border-bottom pb-2 mb-3">
                                            {React.cloneElement(categoryInfo.icon, { className: 'me-2' })} {category}
                                        </h3>
                                        <Row xs={1} md={2} lg={3} className="g-3">
                                            {itemsByCategory[category].map(item => (
                                                <Col key={item.id}>
                                                    <CatalogStockItem item={item} onOpenManagementModal={() => onOpenManagementModal(item)} onDelete={() => onDeleteRequest(item)} />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}

function CatalogStockItem({ item, onOpenManagementModal, onDelete }) {
    const { displayQuantity, displayUnit } = formatDisplayQuantity(item.totalQuantity, item.baseUnit);
    const stockPercentage = (item.minStock > 0) ? Math.min((item.totalQuantity / item.minStock) * 100, 100) : 0;
    const getBarVariant = (percentage) => { if (percentage < 25) return 'danger'; if (percentage < 75) return 'warning'; return 'success'; };

    return (
        <Card className="h-100 interactive-card" style={{backgroundColor: '#fffbeb'}} onClick={onOpenManagementModal}>
            <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start gap-3 mb-2">
                    <Image src={item.imageUrl || `https://placehold.co/64x64/eee/ccc?text=${item.name.charAt(0)}`} alt={item.name} rounded style={{width: 64, height: 64, objectFit: 'cover'}} />
                    <div className="flex-grow-1">
                        <Card.Title as="h4" className="mb-1 fs-6 fw-bold">{item.name}</Card.Title>
                        <Card.Text className={item.totalQuantity > 0 ? 'text-lime-700' : 'text-muted'}>
                            {item.totalQuantity > 0 ? `${displayQuantity} ${displayUnit}` : 'Ikke på lager'}
                        </Card.Text>
                    </div>
                </div>
                {item.minStock > 0 && <ProgressBar now={stockPercentage} variant={getBarVariant(stockPercentage)} style={{height: '6px'}} />}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end gap-1" style={{backgroundColor: 'transparent'}}>
                <Button variant="light" size="sm" onClick={(e) => {e.stopPropagation(); onOpenManagementModal()}} title="Administrer"><PackagePlusIcon /></Button>
                <Button variant="light" size="sm" onClick={(e) => {e.stopPropagation(); onDelete()}} title="Slet"><TrashIcon /></Button>
            </Card.Footer>
        </Card>
    );
}

function RecipeFormModal({ recipeToEdit, onSave, onUpdate, onDone, catalog }) {
    return (
        <Modal show={true} onHide={onDone} size="lg" centered backdrop="static">
            <Modal.Body className="p-0">
                 <RecipeForm
                    recipeToEdit={recipeToEdit}
                    onSave={onSave}
                    onUpdate={onUpdate}
                    onDone={onDone}
                    catalog={catalog}
                    isModal={true}
                />
            </Modal.Body>
        </Modal>
    );
}

function RecipeForm({ catalog, onSave, onUpdate, recipeToEdit, onDone }) {
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
        }
    }, [recipeToEdit]);

    const handleIngredientChange = (id, field, value) => { setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing)); };
    const addIngredient = () => { setIngredients(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: '', unit: '' }]); };
    const removeIngredient = (id) => { setIngredients(prev => prev.filter(ing => ing.id !== id)); };
    const handleImport = () => { const knownUnits = { 'g.': 'g', 'g': 'g', 'gram': 'g', 'kg.': 'kg', 'kg': 'kg', 'kilo': 'kg', 'ml': 'ml', 'dl': 'dl', 'l': 'l', 'liter': 'l', 'stk.': 'stk', 'stk': 'stk', 'ds.': 'dåse', 'ds': 'dåse', 'dåse': 'dåse', 'tsk.': 'tsk', 'tsk': 'tsk', 'spsk.': 'spsk', 'spsk': 'spsk', 'fed': 'fed', 'bundt': 'bundt' }; const unitKeys = Object.keys(knownUnits); const lines = importText.split('\n').filter(line => line.trim() !== ''); const importedIngredients = lines.map(line => { let originalLine = line.trim(); let quantity = ''; let unit = ''; let name = ''; const quantityMatch = originalLine.match(/^(\d+[./,]?\d*)/); if (quantityMatch) { quantity = quantityMatch[0].replace(',', '.'); originalLine = originalLine.substring(quantityMatch[0].length).trim(); } const words = originalLine.split(' '); const firstWord = words[0].toLowerCase(); if (unitKeys.includes(firstWord)) { unit = knownUnits[firstWord]; name = words.slice(1).join(' '); } else { name = originalLine; } name = name.trim(); if (name) { name = name.charAt(0).toUpperCase() + name.slice(1); } return { id: crypto.randomUUID(), name: name, quantity: quantity, unit: unit, }; }); if (importedIngredients.length > 0) { const currentIngredients = ingredients.filter(ing => ing.name || ing.quantity || ing.unit); setIngredients([...currentIngredients, ...importedIngredients]); } setImportText(''); };
    const handleSubmit = (e) => { e.preventDefault(); const recipeData = { name, imageUrl, category, prepTime: parseInt(prepTime) || 0, servings: parseInt(servings) || 0, ingredients: ingredients.filter(ing => ing.name), instructions, tags: tags.split(',').map(t => t.trim()).filter(t => t), notes, }; if (recipeToEdit) { onUpdate(recipeToEdit.id, recipeData); } else { onSave({...recipeData, isFavorite: false, createdAt: new Date()}); } onDone(); };
    
    return (
        <Card className="border-0">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h2" className="font-heading text-lime-900 m-0">{recipeToEdit ? 'Rediger Opskrift' : 'Opret ny opskrift'}</Card.Title>
                 <Button variant="close" onClick={onDone} />
            </Card.Header>
            <Card.Body style={{maxHeight: '80vh', overflowY: 'auto'}}>
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}><Form.Group><Form.Label>Opskriftnavn</Form.Label><Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Billede URL</Form.Label><Form.Control type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." /></Form.Group></Col>
                        <Col md={4}><Form.Group><Form.Label>Kategori</Form.Label><Form.Select value={category} onChange={e => setCategory(e.target.value)}>{['Aftensmad', 'Forret', 'Dessert', 'Bagværk', 'Salat', 'Andet'].map(c => <option key={c}>{c}</option>)}</Form.Select></Form.Group></Col>
                        <Col md={4}><Form.Group><Form.Label>Tilberedningstid (min)</Form.Label><Form.Control type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="f.eks. 45" /></Form.Group></Col>
                        <Col md={4}><Form.Group><Form.Label>Antal Portioner</Form.Label><Form.Control type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="4" /></Form.Group></Col>
                    </Row>

                    <h3 className="font-heading text-lime-800 mt-4">Ingredienser</h3>
                    <Card body className="bg-amber-50 border-amber-200 mb-3">
                        <Form.Label>Importer ingrediensliste</Form.Label>
                        <Form.Control as="textarea" rows={3} value={importText} onChange={e => setImportText(e.target.value)} placeholder="Indsæt liste her. F.eks. '400g hakket oksekød'" />
                        <Button variant="warning" size="sm" onClick={handleImport} className="mt-2">Importer</Button>
                    </Card>

                    <div className="d-grid gap-2 mb-2">
                        {ingredients.map((ing) => (
                            <InputGroup key={ing.id}>
                                <Form.Control type="text" list="catalog-items" placeholder="Ingrediensnavn" value={ing.name} onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)} />
                                <datalist id="catalog-items">{catalog.map(catItem => <option key={catItem.id} value={catItem.name} />)}</datalist>
                                <Form.Control type="number" step="any" placeholder="Antal" value={ing.quantity} onChange={e => handleIngredientChange(ing.id, 'quantity', e.target.value)} style={{maxWidth: '80px'}} />
                                <Form.Control type="text" placeholder="Enhed" value={ing.unit} onChange={e => handleIngredientChange(ing.id, 'unit', e.target.value)} style={{maxWidth: '80px'}} />
                                <Button variant="outline-danger" onClick={() => removeIngredient(ing.id)}><TrashIcon /></Button>
                            </InputGroup>
                        ))}
                    </div>
                    <Button variant="link" size="sm" onClick={addIngredient} className="p-0 text-lime-700">+ Tilføj ingrediens</Button>

                    <Form.Group className="mt-4"><Form.Label>Fremgangsmåde</Form.Label><Form.Control as="textarea" rows={8} value={instructions} onChange={e => setInstructions(e.target.value)} /></Form.Group>
                    <Form.Group className="mt-3"><Form.Label>Tags (separer med komma)</Form.Label><Form.Control type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="f.eks. Hurtig, Vegetarisk, Kylling" /></Form.Group>
                    <Form.Group className="mt-3"><Form.Label>Noter/Tips</Form.Label><Form.Control as="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></Form.Group>
                    
                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="secondary" onClick={onDone}>Annuller</Button>
                        <Button variant="success" type="submit">{recipeToEdit ? 'Gem Ændringer' : 'Gem Opskrift'}</Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

function CookbookView({ setView, recipes, catalog, availableItems, onEditRecipeRequest, onAddToKitchenTable, setConfirmationModal, onAddToMealPlanRequest, onShowAddToShoppingListModal, onToggleFavorite, onShowDetailsRequest }) {
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

    const recipesWithStock = useMemo(() => {
        return recipes.map(recipe => {
            if (!recipe.ingredients || recipe.ingredients.length === 0) { return { ...recipe, stockMatch: 100 }; }
            let haveCount = 0; let neededCount = recipe.ingredients.length;
            recipe.ingredients.forEach(ing => {
                const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
                if (!catalogItem) { neededCount--; return; };
                const { quantityInBase: requiredQtyInBase } = convertToUnit(parseFloat(ing.quantity) || 0, ing.unit, catalogItem);
                const inventoryItem = availableItems.find(item => item.catalogId === catalogItem.id);
                const totalAvailableInBase = inventoryItem ? inventoryItem.totalQuantityInBaseUnit : 0;
                if (totalAvailableInBase >= requiredQtyInBase) { haveCount++; }
            });
            const stockMatch = neededCount > 0 ? (haveCount / neededCount) * 100 : 100;
            return { ...recipe, stockMatch };
        });
    }, [recipes, availableItems, catalog]);

    const filteredAndSortedRecipes = useMemo(() => {
        let processedRecipes = [...recipesWithStock].filter(recipe => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filter === 'haveAll') { processedRecipes = processedRecipes.filter(r => r.stockMatch === 100); }
        processedRecipes.sort((a, b) => {
            switch (sortBy) {
                case 'stock': return b.stockMatch - a.stockMatch;
                case 'favorite': return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
                case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'name': default: return a.name.localeCompare(b.name);
            }
        });
        return processedRecipes;
    }, [recipesWithStock, filter, sortBy, searchTerm]);

    const handleKitchenTableRequest = (recipe) => { setConfirmationModal({ isOpen: true, title: 'Tilføj til Køkkenbord?', message: 'Er du sikker på du vil bruge ingredienserne fra denne opskrift?', onConfirm: () => onAddToKitchenTable(recipe.ingredients) }); };

    return (
        <div>
            <Button variant="link" onClick={() => setView('recipesHome')} className="mb-4 p-0 text-lime-700 text-decoration-none"><ArrowLeftIcon /> Tilbage til Opskrifter</Button>
            <Card style={{backgroundColor: '#FFFCF0'}}>
                <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <h2 className="font-heading text-lime-900 m-0">Kogebog</h2>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <InputGroup size="sm"><InputGroup.Text><SearchIcon /></InputGroup.Text><Form.Control placeholder="Søg..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></InputGroup>
                        <Form.Select size="sm" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Alle opskrifter</option><option value="haveAll">Har alle varer</option></Form.Select>
                        <Form.Select size="sm" value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="name">Navn (A-Å)</option><option value="stock">Har flest varer</option><option value="favorite">Favoritter først</option><option value="newest">Nyeste først</option></Form.Select>
                    </div>
                </Card.Header>
                <Card.Body>
                    {filteredAndSortedRecipes.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <SearchIcon style={{width: 60, height: 60}} />
                            <h3 className="mt-3 font-heading">Ingen opskrifter fundet</h3>
                            <p>Prøv at justere din søgning eller filter.</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {filteredAndSortedRecipes.map(recipe => (
                                <Col key={recipe.id}>
                                    <RecipeCard recipe={recipe} onEditRecipe={() => onEditRecipeRequest(recipe)} onKitchenTableRequest={() => handleKitchenTableRequest(recipe)} onShowAddToShoppingListModal={() => onShowAddToShoppingListModal(recipe)} onAddToMealPlanRequest={onAddToMealPlanRequest} onToggleFavorite={onToggleFavorite} onShowDetails={() => onShowDetailsRequest(recipe)} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}

function RecipeCard({ recipe, onEditRecipe, onKitchenTableRequest, onShowAddToShoppingListModal, onAddToMealPlanRequest, onToggleFavorite, onShowDetails }) {
    return (
        <Card className="h-100 recipe-card" role="button" onClick={onShowDetails}>
            <div className="position-relative">
                <Card.Img variant="top" src={recipe.imageUrl || `https://placehold.co/300x200/eee/ccc?text=${recipe.name.charAt(0)}`} style={{height: '180px', objectFit: 'cover'}} />
                <Button variant="link" onClick={(e) => {e.stopPropagation(); onToggleFavorite(recipe.id)}} className="position-absolute top-0 end-0 p-2 text-warning">
                    <StarIcon isFavorite={recipe.isFavorite} />
                </Button>
            </div>
            <Card.Body className="d-flex flex-column">
                <div className="flex-grow-1">
                    <Card.Title as="h3" className="font-heading text-lime-900 fs-5">{recipe.name}</Card.Title>
                    <div className="d-flex justify-content-between text-muted small mb-2">
                        <span>{recipe.category}</span>
                        {recipe.prepTime > 0 && <span className="d-flex align-items-center gap-1"><ClockIcon /> {recipe.prepTime} min.</span>}
                    </div>
                    <ProgressBar now={recipe.stockMatch} variant="success" style={{height: '8px'}} title={`${Math.round(recipe.stockMatch)}% af varer på lager`} />
                </div>
                <div className="d-grid gap-2 mt-3">
                     <Button variant="outline-success" size="sm" onClick={(e) => {e.stopPropagation(); onAddToMealPlanRequest(recipe)}}>Føj til Madplan</Button>
                     <Button variant="outline-info" size="sm" onClick={(e) => {e.stopPropagation(); onShowAddToShoppingListModal()}}>Tilføj til Indkøb</Button>
                     <Button variant="outline-secondary" size="sm" onClick={(e) => {e.stopPropagation(); onEditRecipe()}}>Rediger</Button>
                </div>
            </Card.Body>
        </Card>
    );
}

function ConfirmationModal({ show, title, message, onConfirm, onCancel }) { return ( <Modal show={show} onHide={onCancel} centered> <Modal.Header closeButton><Modal.Title className="font-heading">{title}</Modal.Title></Modal.Header> <Modal.Body>{message}</Modal.Body> <Modal.Footer> <Button variant="secondary" onClick={onCancel}>Annuller</Button> <Button variant="success" onClick={onConfirm}>Bekræft</Button> </Modal.Footer> </Modal> ); }
function SimpleConfirmationModal({ show, title, message, onConfirm, onCancel }) { return ( <Modal show={show} onHide={onCancel} centered> <Modal.Header closeButton><Modal.Title className="font-heading">{title}</Modal.Title></Modal.Header> <Modal.Body>{message}</Modal.Body> <Modal.Footer> <Button variant="secondary" onClick={onCancel}>Annuller</Button> <Button variant="danger" onClick={onConfirm}>Slet</Button> </Modal.Footer> </Modal> ); }
function Notification({ message, type, onClose }) { const variant = type === 'error' ? 'danger' : 'success'; return ( <Alert variant={variant} style={{position: 'fixed', top: 20, right: 20, zIndex: 1050}} onClose={onClose} dismissible> <InfoIcon className="me-2" /> {message} </Alert> ); }

function MealPlanView({ mealPlan, onUpdateMealPlan }) {
    const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    const handleRemoveRecipe = (day) => { onUpdateMealPlan(day, null); };
    const handleAddLeftovers = (day) => { onUpdateMealPlan(day, { recipe: {id: 'leftovers', name: 'Rester'}, servings: 0 }); }

    return (
        <Row xs={1} sm={2} lg={3} xl={7} className="g-3">
            {days.map(day => (
                <Col key={day}>
                    <Card className="text-center h-100" style={{backgroundColor: '#fffbeb'}}>
                        <Card.Header className="font-heading fw-bold">{day}</Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center" style={{minHeight: '80px'}}>
                            {mealPlan[day] ? (
                                <div>
                                    <p className={`fw-semibold ${mealPlan[day].recipe.id === 'leftovers' ? 'text-muted' : 'text-lime-800'}`}>{mealPlan[day].recipe.name}</p>
                                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleRemoveRecipe(day)}>Fjern</Button>
                                </div>
                            ) : (
                                <Button variant="light" size="sm" onClick={() => handleAddLeftovers(day)}><PlusIcon /> Rester</Button>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

function AddRecipeToMealPlanModal({ show, recipe, onConfirm, onCancel }) {
    const [selectedDay, setSelectedDay] = useState('Mandag');
    const [servings, setServings] = useState(recipe.servings || 4);
    const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    const handleSubmit = () => { onConfirm(selectedDay, { recipe, servings: parseInt(servings) || recipe.servings }); };

    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton><Modal.Title className="font-heading">Føj til Madplan</Modal.Title></Modal.Header>
            <Modal.Body>
                <p>Vælg en dag og antal personer for <span className="fw-bold">{recipe.name}</span>.</p>
                <Form.Group className="mb-3"><Form.Label>Ugedag</Form.Label><Form.Select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>{days.map(day => <option key={day} value={day}>{day}</option>)}</Form.Select></Form.Group>
                <Form.Group><Form.Label>Antal personer</Form.Label><Form.Control type="number" value={servings} onChange={e => setServings(e.target.value)} /></Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>Annuller</Button>
                <Button variant="success" onClick={handleSubmit}>Tilføj</Button>
            </Modal.Footer>
        </Modal>
    );
}

function AddToShoppingListModal({ show, recipe, onConfirm, onCancel, availableItems, catalog }) {
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);
    useEffect(() => { const ingredientsWithStock = recipe.ingredients.map(ing => { const catalogItem = catalog.find(c => c.name.toLowerCase() === ing.name.toLowerCase()); const inventoryItem = availableItems.find(item => item.catalogId === catalogItem?.id); const totalAvailableInBase = inventoryItem ? inventoryItem.totalQuantityInBaseUnit : 0; const { displayQuantity, displayUnit } = formatDisplayQuantity(totalAvailableInBase, catalogItem?.baseUnit || 'stk'); return { ...ing, stock: totalAvailableInBase > 0 ? `${displayQuantity} ${displayUnit}` : 'Ingen på lager', }; }); setIngredientsToAdd(ingredientsWithStock); }, [recipe, availableItems, catalog]);
    const handleRemoveIngredient = (id) => { setIngredientsToAdd(prev => prev.filter(ing => ing.id !== id)); };
    const handleConfirmClick = () => { onConfirm(ingredientsToAdd); onCancel(); };

    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton><Modal.Title className="font-heading">Tilføj til Indkøbsliste</Modal.Title></Modal.Header>
            <Modal.Body>
                <p>Fjern de varer du allerede har. Resterende tilføjes til din indkøbsliste.</p>
                <ListGroup style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {ingredientsToAdd.map(ing => (
                        <ListGroup.Item key={ing.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="fw-bold mb-0">{ing.name}</p>
                                <small className="text-muted">{ing.quantity} {ing.unit} <span className="text-success">({ing.stock})</span></small>
                            </div>
                            <Button variant="link" className="text-danger" onClick={() => handleRemoveIngredient(ing.id)}><TrashIcon /></Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>Annuller</Button>
                <Button variant="warning" onClick={handleConfirmClick}>Tilføj Valgte</Button>
            </Modal.Footer>
        </Modal>
    );
}

function RecipeDetailsModal({ show, recipe, recipeList, onNavigate, onClose }) {
    if (!recipe) return null;
    const currentIndex = recipeList.findIndex(r => r.id === recipe.id);
    const hasNext = currentIndex < recipeList.length - 1;
    const hasPrev = currentIndex > 0;
    const handlePrev = (e) => { e.stopPropagation(); if (hasPrev) { onNavigate(recipeList[currentIndex - 1]); } };
    const handleNext = (e) => { e.stopPropagation(); if (hasNext) { onNavigate(recipeList[currentIndex + 1]); } };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="font-heading text-lime-900">{recipe.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '80vh', overflowY: 'auto'}}>
                <Row>
                    <Col md={6}>
                        <Image src={recipe.imageUrl || `https://placehold.co/400x300/eee/ccc?text=${recipe.name}`} alt={recipe.name} fluid rounded className="mb-3" />
                        <div className="d-flex justify-content-between text-muted small mb-3">
                            <span><strong>Kategori:</strong> {recipe.category}</span>
                            {recipe.prepTime > 0 && <span className="d-flex align-items-center gap-1"><ClockIcon /> {recipe.prepTime} min.</span>}
                            {recipe.servings > 0 && <span><strong>Portioner:</strong> {recipe.servings}</span>}
                        </div>
                        {recipe.tags && recipe.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {recipe.tags.map(tag => <Badge key={tag} pill bg="success-subtle" text="success-emphasis">{tag}</Badge>)}
                            </div>
                        )}
                        {recipe.notes && (
                            <div>
                                <h4 className="font-heading">Noter</h4>
                                <p className="text-muted fst-italic bg-light p-3 rounded">{recipe.notes}</p>
                            </div>
                        )}
                    </Col>
                    <Col md={6}>
                        <h3 className="font-heading text-lime-800">Ingredienser</h3>
                        <ListGroup variant="flush" className="mb-4">
                            {recipe.ingredients.map((ing, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between ps-0">
                                    <span>{ing.name}</span>
                                    <span className="text-muted">{ing.quantity} {ing.unit}</span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <h3 className="font-heading text-lime-800">Fremgangsmåde</h3>
                        <div style={{whiteSpace: 'pre-wrap'}}>{recipe.instructions}</div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                <Button variant="secondary" onClick={handlePrev} disabled={!hasPrev}><ChevronLeftIcon /> Forrige</Button>
                <Button variant="secondary" onClick={handleNext} disabled={!hasNext}>Næste <ChevronRightIcon /></Button>
            </Modal.Footer>
        </Modal>
    );
}
