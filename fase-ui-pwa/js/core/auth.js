// Roles y sesión: "cliente" y "admin". Registro/login de clientes en localStorage (contraseña con hash SHA-256).
import { ADMIN_USER, ADMIN_PASS } from './config.js';
const KR = 'eliteRol', KU = 'eliteUsuario', KL = 'eliteUsuarios';
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export const getRol = () => localStorage.getItem(KR);
export const getUsuario = () => leer(KU, { nombre: 'Invitado', email: '' });
export const irA = rol => { location.href = rol === 'admin' ? 'pages/admin.html' : 'pages/cliente.html'; };

async function hash(s) {
    try {
        const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('elite|' + s));
        return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    } catch { return btoa(unescape(encodeURIComponent('elite|' + s))); }
}
function iniciar(rol, usuario) {
    localStorage.setItem(KR, rol); localStorage.setItem(KU, JSON.stringify(usuario));
    return { ok: true, rol };
}
export async function registrar({ nombre, email, tel, pass }) {
    const us = leer(KL, []); email = email.trim().toLowerCase();
    if (us.some(u => u.email === email)) return { ok: false, msg: 'Ese correo ya está registrado' };
    us.push({ nombre: nombre.trim(), email, tel, hash: await hash(pass) });
    localStorage.setItem(KL, JSON.stringify(us));
    return iniciar('cliente', { nombre: nombre.trim(), email });
}
export async function loginCliente(email, pass) {
    const u = leer(KL, []).find(x => x.email === email.trim().toLowerCase());
    if (!u || u.hash !== await hash(pass)) return { ok: false, msg: 'Correo o contraseña incorrectos' };
    return iniciar('cliente', { nombre: u.nombre, email: u.email });
}
export async function loginAdmin(user, pass) {
    const u = user.trim().toLowerCase();
    if (![ADMIN_USER, ADMIN_USER + '@elitesport.com'].includes(u) || pass !== ADMIN_PASS) return { ok: false, msg: 'Credenciales de administrador incorrectas' };
    return iniciar('admin', { nombre: 'Administrador', email: ADMIN_USER + '@elitesport.com' });
}
export const entrarInvitado = () => iniciar('cliente', { nombre: 'Invitado', email: '' });

export function requerirRol(rol) {
    const r = getRol();
    if (r === rol || (rol === 'cliente' && r === 'admin')) return true;
    location.replace('../index.html'); return false;
}
export function logout() { localStorage.removeItem(KR); localStorage.removeItem(KU); location.href = '../index.html'; }
