import axios from 'axios';
import {saveToken} from "./token.js";
const BASE_URL = "http://127.0.0.1:8000/api"

export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token_lifetime");
    localStorage.removeItem("refresh_token_lifetime");
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/login/`, {email, password});

        saveToken(response.data.access, response.data.refresh);

        return response.data;
    } catch {
        throw new Error;
    }
};

export const register = async (firstName, lastName, email, password, passwordConfirm) => {
    try {
        const response = await axios.post(`${BASE_URL}/register/`, {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            password_confirm: passwordConfirm
        });

        return response.data;
        } catch {
            throw new Error;
        }
};