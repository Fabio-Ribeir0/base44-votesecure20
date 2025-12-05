import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MeuPerfil from './pages/MeuPerfil';
import MinhaOrganizacao from './pages/MinhaOrganizacao';
import Membros from './pages/Membros';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "MeuPerfil": MeuPerfil,
    "MinhaOrganizacao": MinhaOrganizacao,
    "Membros": Membros,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};