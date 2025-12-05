import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MeuPerfil from './pages/MeuPerfil';
import MinhaOrganizacao from './pages/MinhaOrganizacao';
import Membros from './pages/Membros';
import Assembleias from './pages/Assembleias';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "MeuPerfil": MeuPerfil,
    "MinhaOrganizacao": MinhaOrganizacao,
    "Membros": Membros,
    "Assembleias": Assembleias,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};