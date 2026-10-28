import React from 'react';
import { Navigate, Routes, Route} from 'react-router-dom';
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar} from "../paginas/registrar";
import { TelaInicial} from "../paginas/inicial";
import { TelaProdutos } from "../paginas/produtos";
import { TelaConfiguracoesEquipe } from "../paginas/configuracaoEquipe";
import { TelaRecuperarSenha } from "../paginas/recuperarSenha";
import { TelaRotinaAparelhos } from "../paginas/rotinaAparelhos";
import { TelaRotinas } from "../paginas/rotinas";
import { TelaAnaliseDados } from "../paginas/analiseDados";
import { TelaSolucao } from "../paginas/solucao";
import { TelaQuemSomos } from '../paginas/quemSomos';

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
            <Route path="/rotinas" element={<Navigate to="/rotinas/demo-equipe" replace />} />
            <Route path="/rotinas/:equipeId" element={<TelaRotinas />} />
            <Route path="/solucaoFhive" element={<TelaSolucao />} />
            {/* <Route path="/solucao" element={<Navigate to="/solucao/demo-equipe" replace />} /> */}
            <Route path="/solucao/:equipeId" element={<TelaAnaliseDados />} />
            <Route path="/quemSomos" element={<TelaQuemSomos/>} />
        </Routes>
    );
};