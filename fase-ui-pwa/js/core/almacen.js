// Capa de datos (localStorage + semilla JSON). Compartida por cliente y admin.
import { CARRUSEL_DEFECTO, LIGAS_DEFECTO, aplicarLigas } from './config.js';
const K = { p: 'eliteProductos', f: 'eliteFavoritos', c: 'eliteCarrusel', l: 'eliteLigas' };
const leer = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

const normalizar = p => ({
    ...p, id: Number(p.id) || Date.now() + Math.floor(Math.random() * 1000),
    precio: Number(p.precio) || 0, stock: Number(p.stock) || 0,
    tallas: Array.isArray(p.tallas) && p.tallas.length ? p.tallas : ['S', 'M'],
    liga: p.liga || 'laliga', temporada: p.temporada || '2025/26'
});

export async function cargarProductos() {
    let l = leer(K.p, null);
    if (l === null) {
        try { l = await (await fetch('../assets/data/productos.json')).json(); } catch { l = []; }
        l = l.map(normalizar); guardar(K.p, l);
    }
    return l.map(normalizar);
}
export const getProductos = () => leer(K.p, []).map(normalizar);
export const setProductos = l => guardar(K.p, l);   // devuelve false si el almacenamiento está lleno

export const getFavs = () => leer(K.f, []);
export function toggleFav(id) {
    const f = getFavs(), i = f.indexOf(id);
    i > -1 ? f.splice(i, 1) : f.push(id);
    guardar(K.f, f); return i === -1;
}

export const getCarrusel = () => { const c = leer(K.c, null); return c && c.length ? c : CARRUSEL_DEFECTO; };
export const setCarrusel = c => guardar(K.c, c);

export const getLigas = () => { const l = leer(K.l, null); return l && Object.keys(l).length ? l : LIGAS_DEFECTO; };
export const setLigas = l => { const ok = guardar(K.l, l); if (ok) aplicarLigas(l); return ok; };
export const sincronizarLigas = () => aplicarLigas(getLigas());

export function restablecerDemo() { Object.values(K).forEach(k => localStorage.removeItem(k)); }
