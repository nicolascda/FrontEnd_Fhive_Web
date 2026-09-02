import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar} from "../paginas/registrar";

export function AppRoutes() {
    return (
        <Routes >
            <Route path="/" element={<TelaDeLogin/>} />
            <Route path="/registrar" element={<TelaDeRegistrar/>} />
        </Routes>
    );
};