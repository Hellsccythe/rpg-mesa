import type { UsuarioAutenticado } from "../cls/usuario-autenticado.interface.js";

declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: UsuarioAutenticado;
    }
  }
}
