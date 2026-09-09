import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar} from "../paginas/registrar";
import { TelaInicial} from "../paginas/inicial";

export function AppRoutes() {
    return (
        <Routes >
            <Route path="/login" element={<TelaDeLogin/>} />
            <Route path="/registrar" element={<TelaDeRegistrar/>} />
            <Route path="/" element={<TelaInicial/>} />
        </Routes>
    );
};