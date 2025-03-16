import React, {useState} from 'react';
import axios from "axios";
import './Contact.css'

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Wysyłanie...');
        try {
            const response = await axios.post('http://localhost:5000/api/contact', formData);
            if (response.data.success) {
                setStatus('Wiadomość wysłana pomyślnie!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('Błąd podczas wysyłania wiadomości.');
            }
        } catch (error) {
            setStatus('Błąd serwera. Spróbuj ponownie później.');
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-info">
                <h2>Skontaktuj się z nami</h2>
                <p>Odpowiemy na wszystkie Twoje pytania!</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Twoje imię / nazwa firmy"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Twoja wiadomość"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="contact-button">Wyślij</button>
                </form>
                {status && <p>{status}</p>}
            </div>
        </div>
    );
}

export default Contact;