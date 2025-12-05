import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MeuPerfil from './pages/MeuPerfil';
import MinhaOrganizacao from './pages/MinhaOrganizacao';
import Membros from './pages/Membros';
import Assembleias from './pages/Assembleias';
import AssembleiaDetalhes from './pages/AssembleiaDetalhes';
import Checkin from './pages/Checkin';
import Usuarios from './pages/Usuarios';
import Logs from './pages/Logs';
import Procuracoes from './pages/Procuracoes';
import PaymentSuccess from './pages/PaymentSuccess';
import NotFound from './pages/NotFound';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "MeuPerfil": MeuPerfil,
    "MinhaOrganizacao": MinhaOrganizacao,
    "Membros": Membros,
    "Assembleias": Assembleias,
    "AssembleiaDetalhes": AssembleiaDetalhes,
    "Checkin": Checkin,
    "Usuarios": Usuarios,
    "Logs": Logs,
    "Procuracoes": Procuracoes,
    "PaymentSuccess": PaymentSuccess,
    "NotFound": NotFound,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};