import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { BarraNavegacaoOficial } from "../componentes/BarraNavegacaoOficial";
import estilosNavbar from "../componentes/BarraNavegacaoOficial/styles.module.css";
import { TelaDeLogin } from "../paginas/login";
import { TelaDeRegistrar } from "../paginas/registrar";
import { TelaInicial } from "../paginas/inicial";
import { TelaProdutos } from "../paginas/produtos";
import { TelaConfiguracoesEquipe } from "../paginas/configuracaoEquipe";
import { TelaRecuperarSenha } from "../paginas/recuperarSenha";
import { TelaRotinaAparelhos } from "../paginas/ambienteAparelhos";
import { TelaRotinas } from "../paginas/rotinas";
import { TelaAnaliseDados } from "../paginas/analiseDados";
import { TelaSolucao } from "../paginas/solucao";
import { TelaQuemSomos } from '../paginas/quemSomos';

export function AppRoutes() {
    const location = useLocation();
    const rotasSemNavbar = ['/login', '/registrar', '/recuperar-senha'];
    const mostrarNavbar = !rotasSemNavbar.includes(location.pathname);

    return (
        <>
            {mostrarNavbar && <BarraNavegacaoOficial />}
            <div className={mostrarNavbar ? estilosNavbar['conteudo-com-navbar'] : undefined}>
                <Routes>
                    <Route path="/login" element={<TelaDeLogin />} />
                    <Route path="/registrar" element={<TelaDeRegistrar />} />
                    <Route path="/" element={<TelaInicial />} />
                    <Route path="/produtos" element={<TelaProdutos />} />
                    <Route path="/configuracoes-equipe" element={<TelaConfiguracoesEquipe />} />
                    <Route path="/recuperar-senha" element={<TelaRecuperarSenha />} />
                    <Route path="/ambiente-aparelhos" element={<Navigate to="/ambiente-aparelhos/demo-equipe" replace />} />
                    <Route path="/ambiente-aparelhos/:equipeId" element={<TelaRotinaAparelhos />} />
                    <Route path="/ambiente-3d/:equipeId" element={<TelaRotinaAparelhos />} />
                    <Route path="/rotinas" element={<Navigate to="/rotinas/demo-equipe" replace />} />
                    <Route path="/rotinas/:equipeId" element={<TelaRotinas />} />
                    <Route path="/solucaoFhive" element={<TelaSolucao />} />
                    <Route path="/analisarDados/:equipeId" element={<TelaAnaliseDados />} />
                    <Route path="/quemSomos" element={<TelaQuemSomos />} />
                </Routes>
            </div>
        </>
    );
}