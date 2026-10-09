import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar} from "../paginas/registrar";
import { TelaInicial} from "../paginas/inicial";
import { TelaProdutos } from "../paginas/produtos";
import { TelaConfiguracoesEquipe } from "../paginas/configuracaoEquipe";

export function AppRoutes() {
    return (
        <Routes >
            <Route path="/login" element={<TelaDeLogin/>} />
            <Route path="/registrar" element={<TelaDeRegistrar/>} />
            <Route path="/" element={<TelaInicial/>} />
            <Route path="/produtos" element={<TelaProdutos/>}/>
            <Route path="/configuracoes-equipe" element={<TelaConfiguracoesEquipe/>}/>
        </Routes>
    );
};