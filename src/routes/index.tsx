import React from 'react';
import { Navigate, Routes, Route} from 'react-router-dom';
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar} from "../paginas/registrar";
import { TelaInicial} from "../paginas/inicial";
import { TelaProdutos } from "../paginas/produtos";
import { TelaConfiguracoesEquipe } from "../paginas/configuracaoEquipe";
import { TelaRecuperarSenha } from "../paginas/recuperarSenha";
import { TelaRotinaAparelhos } from "../paginas/rotinaAparelhos";

export function AppRoutes() {
    return (
        <Routes >
            <Route path="/login" element={<TelaDeLogin/>} />
            <Route path="/registrar" element={<TelaDeRegistrar/>} />
            <Route path="/" element={<TelaInicial/>} />
            <Route path="/produtos" element={<TelaProdutos/>}/>
            <Route path="/configuracoes-equipe" element={<TelaConfiguracoesEquipe/>}/>
            <Route path="/recuperar-senha" element={<TelaRecuperarSenha/>} />
            <Route path="/rotina-aparelhos" element={<Navigate to="/rotina-aparelhos/demo-equipe" replace />} />
            <Route path="/rotina-aparelhos/:equipeId" element={<TelaRotinaAparelhos />} />
            <Route path="/ambiente-3d/:equipeId" element={<TelaRotinaAparelhos />} />
        </Routes>
    );
};