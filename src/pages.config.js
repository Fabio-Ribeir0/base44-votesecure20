import AssembleiaDetalhes from './pages/AssembleiaDetalhes';
import Checkin from './pages/Checkin';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Logs from './pages/Logs';
import Membros from './pages/Membros';
import MeuPerfil from './pages/MeuPerfil';
import MinhaOrganizacao from './pages/MinhaOrganizacao';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import Procuracoes from './pages/Procuracoes';
import Usuarios from './pages/Usuarios';
import VotacaoMembro from './pages/VotacaoMembro';
import Assembleias from './pages/Assembleias';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AssembleiaDetalhes": AssembleiaDetalhes,
    "Checkin": Checkin,
    "Dashboard": Dashboard,
    "Home": Home,
    "Logs": Logs,
    "Membros": Membros,
    "MeuPerfil": MeuPerfil,
    "MinhaOrganizacao": MinhaOrganizacao,
    "NotFound": NotFound,
    "PaymentSuccess": PaymentSuccess,
    "Procuracoes": Procuracoes,
    "Usuarios": Usuarios,
    "VotacaoMembro": VotacaoMembro,
    "Assembleias": Assembleias,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};