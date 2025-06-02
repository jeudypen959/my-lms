import { useState } from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card, Nav, Alert, Button } from 'react-bootstrap';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Eye, EyeOff } from 'lucide-react';

// Add TypeScript interfaces for props
interface FloatingInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    required?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
}

interface SelectOption {
    value: string;
    label: string;
}

interface FloatingSelectProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    required?: boolean;
}

interface FormData {
    language: string;
    dateFormat: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notificationFrequency: string;
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    address1: string;
    address2: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactor: boolean;
    dataCollection: boolean;
    marketingEmails: boolean;
}

const FloatingInput = ({ label, type, value, onChange, name, required, showPassword, onTogglePassword }: FloatingInputProps) => {
    const isPassword = type === "password";
    return (
        <div className="form-floating mb-3 position-relative">
            <input
                type={showPassword ? "text" : type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="form-control"
                placeholder={label}
                style={{ borderRadius: 15 }}
            />
            <label>{label}</label>
            {isPassword && onTogglePassword && (
                <button
                    type="button"
                    className="position-absolute top-50 end-0 translate-middle-y me-2 bg-transparent border-0"
                    onClick={onTogglePassword}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    );
};

const FloatingSelect = ({ label, name, value, onChange, options, required }: FloatingSelectProps) => (
    <div className="form-floating mb-3">
        <select
            className="form-select"
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            style={{ borderRadius: 15 }}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        <label>{label}</label>
    </div>
);

export default function Settings() {
    const [activeTab, setActiveTab] = useState<string>('language');
    const [saved, setSaved] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    
    const [formData, setFormData] = useState<FormData>({
        language: 'en',
        dateFormat: 'mdy',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationFrequency: 'immediately',
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        address1: '',
        address2: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactor: false,
        dataCollection: true,
        marketingEmails: false
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setFormData({ ...formData, [target.name]: value });
    };

    const togglePassword = (field: string) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field as keyof typeof showPassword] });
    };

    return (
        <>
            <div className="d-flex flex-column min-vh-100">
                <Head>
                    <title>DG Next - Setting</title>
                    <link rel="icon" href="/dglogo.ico" />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
                </Head>

                <Header />

                <main className="flex-grow-1 pt-3 mt-5" >
                    <Container className="py-4">
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ borderLeft: "5px solid #2c3e50", height: "45px", marginRight: "20px", borderRadius: 15 }}></div>
                            <h1 className="mb-1" style={{ fontSize: 35, letterSpacing: "1px", color: "#2c3e50", marginTop: 15 }}>
                                Settings
                            </h1>
                        </div>

                        {saved && <Alert variant="success" dismissible onClose={() => setSaved(false)}>
                            Your settings have been saved successfully!
                        </Alert>}

                        <Row>
                            <Col md={3} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Nav className="flex-column" variant="pills" style={{fontFamily: "'Acme', sans-serif"}}>
                                            {['language', 'notifications', 'creditcard', 'security', 'privacy'].map(tab => (
                                                <Nav.Link
                                                    key={tab}
                                                    active={activeTab === tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    style={{fontFamily: "'Acme', sans-serif", color: "#2c3e50"}}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('creditcard', 'Credit Card')}
                                                </Nav.Link>
                                            ))}
                                        </Nav>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={9}>
                                <Card>
                                    <Card.Body>
                                        {activeTab === 'language' && (
                                            <>
                                                <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Language Settings</h4>
                                                <form onSubmit={handleSave}>
                                                    <FloatingSelect
                                                        label="Display Language"
                                                        name="language"
                                                        value={formData.language}
                                                        onChange={handleInputChange}
                                                        options={[
                                                            { value: 'en', label: 'English' },
                                                            { value: 'es', label: 'Spanish' },
                                                            { value: 'fr', label: 'French' },
                                                            { value: 'de', label: 'German' },
                                                            { value: 'zh', label: 'Chinese' }
                                                        ]}
                                                    />
                                                    <FloatingSelect
                                                        label="Date Format"
                                                        name="dateFormat"
                                                        value={formData.dateFormat}
                                                        onChange={handleInputChange}
                                                        options={[
                                                            { value: 'mdy', label: 'MM/DD/YYYY' },
                                                            { value: 'dmy', label: 'DD/MM/YYYY' },
                                                            { value: 'ymd', label: 'YYYY/MM/DD' }
                                                        ]}
                                                    />
                                                    <Button variant="primary" type="submit">Save Changes</Button>
                                                </form>
                                            </>
                                        )}

                                        {activeTab === 'notifications' && (
                                            <>
                                                <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Notification Preferences</h4>
                                                <form onSubmit={handleSave}>
                                                    <div className="mb-3">
                                                        <input
                                                            type="checkbox"
                                                            id="email-notifications"
                                                            name="emailNotifications"
                                                            checked={formData.emailNotifications}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label htmlFor="email-notifications" className="ms-2">Email Notifications</label>
                                                    </div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="checkbox"
                                                            id="push-notifications"
                                                            name="pushNotifications"
                                                            checked={formData.pushNotifications}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label htmlFor="push-notifications" className="ms-2">Push Notifications</label>
                                                    </div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="checkbox"
                                                            id="sms-notifications"
                                                            name="smsNotifications"
                                                            checked={formData.smsNotifications}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label htmlFor="sms-notifications" className="ms-2">SMS Notifications</label>
                                                    </div>
                                                    <FloatingSelect
                                                        label="Notification Frequency"
                                                        name="notificationFrequency"
                                                        value={formData.notificationFrequency}
                                                        onChange={handleInputChange}
                                                        options={[
                                                            { value: 'immediately', label: 'Immediately' },
                                                            { value: 'hourly', label: 'Hourly Digest' },
                                                            { value: 'daily', label: 'Daily Digest' },
                                                            { value: 'weekly', label: 'Weekly Digest' }
                                                        ]}
                                                    />
                                                    <Button variant="primary" type="submit">Save Changes</Button>
                                                </form>
                                            </>
                                        )}

                                        {activeTab === 'creditcard' && (
                                            <>
                                                <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Credit Card Information</h4>
                                                <form onSubmit={handleSave}>
                                                    <FloatingInput label="Card Holder Name" type="text" name="cardName" value={formData.cardName} onChange={handleInputChange} />
                                                    <FloatingInput label="Card Number" type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} />
                                                    <Row>
                                                        <Col md={6}>
                                                            <FloatingInput label="Expiration Date" type="text" name="expiry" value={formData.expiry} onChange={handleInputChange} />
                                                        </Col>
                                                        <Col md={6}>
                                                            <FloatingInput label="CVV" type="text" name="cvv" value={formData.cvv} onChange={handleInputChange} />
                                                        </Col>
                                                    </Row>
                                                    <FloatingInput label="Street Address" type="text" name="address1" value={formData.address1} onChange={handleInputChange} />
                                                    <FloatingInput label="City, State, Zip Code" type="text" name="address2" value={formData.address2} onChange={handleInputChange} />
                                                    <Button variant="primary" type="submit">Save Changes</Button>
                                                </form>
                                            </>
                                        )}

                                        {activeTab === 'security' && (
                                            <>
                                                <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Security & Password</h4>
                                                <form onSubmit={handleSave}>
                                                    <FloatingInput
                                                        label="Current Password"
                                                        type="password"
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleInputChange}
                                                        showPassword={showPassword.current}
                                                        onTogglePassword={() => togglePassword('current')}
                                                    />
                                                    <FloatingInput
                                                        label="New Password"
                                                        type="password"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleInputChange}
                                                        showPassword={showPassword.new}
                                                        onTogglePassword={() => togglePassword('new')}
                                                    />
                                                    <FloatingInput
                                                        label="Confirm New Password"
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        showPassword={showPassword.confirm}
                                                        onTogglePassword={() => togglePassword('confirm')}
                                                    />
                                                    <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Two-Factor Authentication</h4>
                                                    <div className="mb-3">
                                                        <input
                                                            type="checkbox"
                                                            id="enable-2fa"
                                                            name="twoFactor"
                                                            checked={formData.twoFactor}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label htmlFor="enable-2fa" className="ms-2">Enable Two-Factor Authentication</label>
                                                    </div>
                                                    <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Session Management</h4>
                                                    <p>You are currently logged in on 2 devices.</p>
                                                    <div className="d-flex flex-column gap-2">
                                                        <Button
                                                            variant="primary"
                                                            type="submit"
                                                            style={{ width: 200, height: 50, borderRadius: 15 }}
                                                        >
                                                            Save Changes
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            className="mb-4"
                                                            style={{ width: 200, height: 50, borderRadius: 15 }}
                                                        >
                                                            Log Out From All Devices
                                                        </Button>
                                                    </div>
                                                </form>
                                            </>
                                        )}

                                        {activeTab === 'privacy' && (
                                            <>
                                                <h4 className="mb-4" style={{ fontSize: 20, letterSpacing: "1px", color: "#2c3e50" }}>Privacy and Policy</h4>
                                                <form onSubmit={handleSave}>
                                                    <div className="mb-4">
                                                        <h4>Privacy Settings</h4>
                                                        <div className="mb-3">
                                                            <input
                                                                type="checkbox"
                                                                id="data-collection"
                                                                name="dataCollection"
                                                                checked={formData.dataCollection}
                                                                onChange={handleInputChange}
                                                            />
                                                            <label htmlFor="data-collection" className="ms-2">Allow Data Collection</label>
                                                        </div>
                                                        <div className="mb-3">
                                                            <input
                                                                type="checkbox"
                                                                id="marketing-emails"
                                                                name="marketingEmails"
                                                                checked={formData.marketingEmails}
                                                                onChange={handleInputChange}
                                                            />
                                                            <label htmlFor="marketing-emails" className="ms-2">Receive Marketing Emails</label>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <h4>Privacy Documents</h4>
                                                        <div className="d-grid gap-2">
                                                            <Button variant="outline-secondary" className="text-start">
                                                                Privacy Policy <small className="float-end">Updated: Jan 15, 2025</small>
                                                            </Button>
                                                            <Button variant="outline-secondary" className="text-start">
                                                                Terms of Service <small className="float-end">Updated: Feb 28, 2025</small>
                                                            </Button>
                                                            <Button variant="outline-secondary" className="text-start">
                                                                Cookie Policy <small className="float-end">Updated: Mar 1, 2025</small>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <h4>Account Data</h4>
                                                        <p>You can download all your data or request account deletion.</p>
                                                        <div className="d-grid gap-2 d-md-flex">
                                                            <Button variant="outline-primary">Download My Data</Button>
                                                            <Button variant="outline-danger">Delete My Account</Button>
                                                        </div>
                                                    </div>

                                                    <Button variant="primary" type="submit">Save Changes</Button>
                                                </form>
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </main>

                <Footer />
            </div>
        </>
    );
}