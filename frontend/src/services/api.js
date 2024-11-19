// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/solarbodies';

export const getSolarBodyByName = async (name) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${name}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${name}:`, error);
        throw error;
    }
};