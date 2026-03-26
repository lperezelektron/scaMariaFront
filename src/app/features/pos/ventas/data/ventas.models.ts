export interface VentaDetallePayload {
    articulo_id: number;
    lote_id: number;     // Inventario.id
    cantidad: number;    // min 0.001
    empaque?: number;    // opcional
    precio: number;
    impuestos?: number;
}

export interface VentaStorePayload {
    fecha: string; // YYYY-MM-DD
    cliente_id: number;
    almacen_id: number;
    f_pago_id: number;

    empleado_id?: number | null;

    credito?: boolean;
    dias_credito?: number;

    subtotal: number;
    impuestos?: number;
    total: number;

    detalles: VentaDetallePayload[];
}

export interface VentaStoreResponse {
    message: string;
    venta: any;
}

export interface LoteDisponible {
    id: number;
    almacen_id: number;
    articulo_id: number;
    variedad: string | null;
    existencia: number | string;

    precio: number | string;
    precio_min: number | string;
    costo: number | string;
    empaque: number | string;

    created_at?: string;
    updated_at?: string;

    articulo?: {
        id: number;
        nombre: string;
        nombre_corto: string;
        unidad: string;
        categoria_id: number;
        activo: boolean;
        imagen: string | null;

        categoria?: {
            id: number;
            descripcion: string;
            activo: boolean;
        } | null;
    } | null;
}