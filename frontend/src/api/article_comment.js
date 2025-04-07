import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api";

export const articleCreate = async (title, content, image) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/article/`,
            {
                title: title,
                content: content,
                image: image,
            }
        );
        return response.data;
    } catch {
        throw new Error("Не вдалося створити статтю");
    }
};

export const articleList = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/article/`);
        return response.data;
    } catch {
        throw new Error("Не вдалося отримати статті");
    }
};