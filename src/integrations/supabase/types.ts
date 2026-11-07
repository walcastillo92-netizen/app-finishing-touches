export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bloqueos: {
        Row: {
          bloqueado: string
          bloqueador: string
          creado_en: string
        }
        Insert: {
          bloqueado: string
          bloqueador?: string
          creado_en?: string
        }
        Update: {
          bloqueado?: string
          bloqueador?: string
          creado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "bloqueos_bloqueado_fkey"
            columns: ["bloqueado"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloqueos_bloqueador_fkey"
            columns: ["bloqueador"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          activa: boolean
          id: string
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          activa?: boolean
          id?: string
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          activa?: boolean
          id?: string
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      comercios: {
        Row: {
          activo: boolean
          actualizado_en: string
          categoria_id: string | null
          creado_en: string
          descripcion: string | null
          direccion_publica: string | null
          horarios: string | null
          id: string
          lat: number | null
          lng: number | null
          logo_url: string | null
          mostrar_en_mapa: boolean
          nombre: string
          perfil_id: string
          zona_id: string | null
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          categoria_id?: string | null
          creado_en?: string
          descripcion?: string | null
          direccion_publica?: string | null
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mostrar_en_mapa?: boolean
          nombre: string
          perfil_id: string
          zona_id?: string | null
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          categoria_id?: string | null
          creado_en?: string
          descripcion?: string | null
          direccion_publica?: string | null
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mostrar_en_mapa?: boolean
          nombre?: string
          perfil_id?: string
          zona_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comercios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercios_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercios_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          comprador_id: string
          confirmado_en: string | null
          creado_en: string
          estado: string
          id: string
          publicacion_id: string
          vendedor_id: string
        }
        Insert: {
          comprador_id: string
          confirmado_en?: string | null
          creado_en?: string
          estado?: string
          id?: string
          publicacion_id: string
          vendedor_id: string
        }
        Update: {
          comprador_id?: string
          confirmado_en?: string | null
          creado_en?: string
          estado?: string
          id?: string
          publicacion_id?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contactos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncias: {
        Row: {
          creado_en: string
          denunciante_id: string
          detalle: string | null
          estado: string
          id: string
          motivo: string
          objeto_id: string
          resolucion: string | null
          resuelta_en: string | null
          resuelta_por: string | null
          tipo_objeto: string
        }
        Insert: {
          creado_en?: string
          denunciante_id: string
          detalle?: string | null
          estado?: string
          id?: string
          motivo: string
          objeto_id: string
          resolucion?: string | null
          resuelta_en?: string | null
          resuelta_por?: string | null
          tipo_objeto: string
        }
        Update: {
          creado_en?: string
          denunciante_id?: string
          detalle?: string | null
          estado?: string
          id?: string
          motivo?: string
          objeto_id?: string
          resolucion?: string | null
          resuelta_en?: string | null
          resuelta_por?: string | null
          tipo_objeto?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_denunciante_id_fkey"
            columns: ["denunciante_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes_trueque: {
        Row: {
          autor_id: string
          creado_en: string
          id: string
          propuesta_id: string
          texto: string
        }
        Insert: {
          autor_id?: string
          creado_en?: string
          id?: string
          propuesta_id: string
          texto: string
        }
        Update: {
          autor_id?: string
          creado_en?: string
          id?: string
          propuesta_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_trueque_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_trueque_propuesta_id_fkey"
            columns: ["propuesta_id"]
            isOneToOne: false
            referencedRelation: "propuestas_trueque"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          activo: boolean
          creado_en: string
          id: string
          nombre: string
          provincia: string
          slug: string
        }
        Insert: {
          activo?: boolean
          creado_en?: string
          id?: string
          nombre: string
          provincia?: string
          slug: string
        }
        Update: {
          activo?: boolean
          creado_en?: string
          id?: string
          nombre?: string
          provincia?: string
          slug?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          creado_en: string
          id: string
          leida: boolean
          propuesta_id: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          leida?: boolean
          propuesta_id?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          leida?: boolean
          propuesta_id?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_propuesta_id_fkey"
            columns: ["propuesta_id"]
            isOneToOne: false
            referencedRelation: "propuestas_trueque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opiniones: {
        Row: {
          autor_id: string
          comentario: string | null
          contacto_id: string | null
          creado_en: string
          estado: string
          id: string
          propuesta_id: string | null
          puntaje: number
          vendedor_id: string
        }
        Insert: {
          autor_id: string
          comentario?: string | null
          contacto_id?: string | null
          creado_en?: string
          estado?: string
          id?: string
          propuesta_id?: string | null
          puntaje: number
          vendedor_id: string
        }
        Update: {
          autor_id?: string
          comentario?: string | null
          contacto_id?: string | null
          creado_en?: string
          estado?: string
          id?: string
          propuesta_id?: string | null
          puntaje?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opiniones_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opiniones_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: true
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opiniones_propuesta_id_fkey"
            columns: ["propuesta_id"]
            isOneToOne: false
            referencedRelation: "propuestas_trueque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opiniones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          actualizado_en: string
          avatar_url: string | null
          creado_en: string
          descripcion: string | null
          id: string
          nivel_verificacion: string
          nombre_publico: string
          suspendido: boolean
          tipo: string
          verificado_en: string | null
          zona_id: string | null
        }
        Insert: {
          actualizado_en?: string
          avatar_url?: string | null
          creado_en?: string
          descripcion?: string | null
          id: string
          nivel_verificacion?: string
          nombre_publico: string
          suspendido?: boolean
          tipo?: string
          verificado_en?: string | null
          zona_id?: string | null
        }
        Update: {
          actualizado_en?: string
          avatar_url?: string | null
          creado_en?: string
          descripcion?: string | null
          id?: string
          nivel_verificacion?: string
          nombre_publico?: string
          suspendido?: boolean
          tipo?: string
          verificado_en?: string | null
          zona_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles_contacto: {
        Row: {
          actualizado_en: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          actualizado_en?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          actualizado_en?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_contacto_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promociones: {
        Row: {
          activa: boolean
          comercio_id: string | null
          creado_en: string
          descripcion: string | null
          enlace: string | null
          id: string
          imagen_url: string | null
          inicia_en: string
          municipio_id: string | null
          publicacion_id: string | null
          termina_en: string
          tipo: string
          titulo: string
        }
        Insert: {
          activa?: boolean
          comercio_id?: string | null
          creado_en?: string
          descripcion?: string | null
          enlace?: string | null
          id?: string
          imagen_url?: string | null
          inicia_en?: string
          municipio_id?: string | null
          publicacion_id?: string | null
          termina_en: string
          tipo: string
          titulo: string
        }
        Update: {
          activa?: boolean
          comercio_id?: string | null
          creado_en?: string
          descripcion?: string | null
          enlace?: string | null
          id?: string
          imagen_url?: string | null
          inicia_en?: string
          municipio_id?: string | null
          publicacion_id?: string | null
          termina_en?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "promociones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promociones_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promociones_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      propuestas_trueque: {
        Row: {
          actualizado_en: string
          confirmo_destinatario: boolean
          confirmo_proponente: boolean
          contrapropuesta_de: string | null
          creado_en: string
          destinatario: string
          efectivo_monto: number | null
          estado: string
          id: string
          mensaje: string | null
          modalidad: string
          oferta_texto: string | null
          paga: string | null
          proponente: string
          publicacion_destino: string
          publicacion_ofrecida: string | null
        }
        Insert: {
          actualizado_en?: string
          confirmo_destinatario?: boolean
          confirmo_proponente?: boolean
          contrapropuesta_de?: string | null
          creado_en?: string
          destinatario: string
          efectivo_monto?: number | null
          estado?: string
          id?: string
          mensaje?: string | null
          modalidad: string
          oferta_texto?: string | null
          paga?: string | null
          proponente?: string
          publicacion_destino: string
          publicacion_ofrecida?: string | null
        }
        Update: {
          actualizado_en?: string
          confirmo_destinatario?: boolean
          confirmo_proponente?: boolean
          contrapropuesta_de?: string | null
          creado_en?: string
          destinatario?: string
          efectivo_monto?: number | null
          estado?: string
          id?: string
          mensaje?: string | null
          modalidad?: string
          oferta_texto?: string | null
          paga?: string | null
          proponente?: string
          publicacion_destino?: string
          publicacion_ofrecida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propuestas_trueque_contrapropuesta_de_fkey"
            columns: ["contrapropuesta_de"]
            isOneToOne: false
            referencedRelation: "propuestas_trueque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propuestas_trueque_destinatario_fkey"
            columns: ["destinatario"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propuestas_trueque_proponente_fkey"
            columns: ["proponente"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propuestas_trueque_publicacion_destino_fkey"
            columns: ["publicacion_destino"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propuestas_trueque_publicacion_ofrecida_fkey"
            columns: ["publicacion_ofrecida"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      publicacion_fotos: {
        Row: {
          alto: number | null
          ancho: number | null
          bytes: number | null
          creado_en: string
          id: string
          orden: number
          publicacion_id: string
          storage_path: string
        }
        Insert: {
          alto?: number | null
          ancho?: number | null
          bytes?: number | null
          creado_en?: string
          id?: string
          orden?: number
          publicacion_id: string
          storage_path: string
        }
        Update: {
          alto?: number | null
          ancho?: number | null
          bytes?: number | null
          creado_en?: string
          id?: string
          orden?: number
          publicacion_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_fotos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      publicaciones: {
        Row: {
          actualizado_en: string
          busco_a_cambio: string | null
          busqueda: unknown
          categoria_id: string | null
          comercio_id: string | null
          condicion: string | null
          creado_en: string
          descripcion: string | null
          destacada_hasta: string | null
          disponibilidad: string
          estado: string
          faltantes: string[]
          id: string
          lat_aprox: number | null
          lng_aprox: number | null
          modalidad_trueque: string | null
          precio_ars: number | null
          publicado_en: string | null
          titulo: string | null
          vendedor_id: string
          zona_id: string | null
        }
        Insert: {
          actualizado_en?: string
          busco_a_cambio?: string | null
          busqueda?: unknown
          categoria_id?: string | null
          comercio_id?: string | null
          condicion?: string | null
          creado_en?: string
          descripcion?: string | null
          destacada_hasta?: string | null
          disponibilidad?: string
          estado?: string
          faltantes?: string[]
          id?: string
          lat_aprox?: number | null
          lng_aprox?: number | null
          modalidad_trueque?: string | null
          precio_ars?: number | null
          publicado_en?: string | null
          titulo?: string | null
          vendedor_id: string
          zona_id?: string | null
        }
        Update: {
          actualizado_en?: string
          busco_a_cambio?: string | null
          busqueda?: unknown
          categoria_id?: string | null
          comercio_id?: string | null
          condicion?: string | null
          creado_en?: string
          descripcion?: string | null
          destacada_hasta?: string | null
          disponibilidad?: string
          estado?: string
          faltantes?: string[]
          id?: string
          lat_aprox?: number | null
          lng_aprox?: number | null
          modalidad_trueque?: string | null
          precio_ars?: number | null
          publicado_en?: string | null
          titulo?: string | null
          vendedor_id?: string
          zona_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publicaciones_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicaciones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicaciones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicaciones_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_moderacion: {
        Row: {
          accion: string
          creado_en: string
          detalle: string | null
          id: string
          objeto_id: string
          objeto_tipo: string
          staff_id: string | null
        }
        Insert: {
          accion: string
          creado_en?: string
          detalle?: string | null
          id?: string
          objeto_id: string
          objeto_tipo: string
          staff_id?: string | null
        }
        Update: {
          accion?: string
          creado_en?: string
          detalle?: string | null
          id?: string
          objeto_id?: string
          objeto_tipo?: string
          staff_id?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          creado_en: string
          rol: string
          user_id: string
        }
        Insert: {
          creado_en?: string
          rol: string
          user_id: string
        }
        Update: {
          creado_en?: string
          rol?: string
          user_id?: string
        }
        Relationships: []
      }
      zonas: {
        Row: {
          activa: boolean
          id: string
          lat: number | null
          lng: number | null
          municipio_id: string
          nombre: string
          padre_id: string | null
          tipo: string
        }
        Insert: {
          activa?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          municipio_id: string
          nombre: string
          padre_id?: string | null
          tipo?: string
        }
        Update: {
          activa?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          municipio_id?: string
          nombre?: string
          padre_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "zonas_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zonas_padre_id_fkey"
            columns: ["padre_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      reputacion_vendedores: {
        Row: {
          cantidad: number | null
          promedio: number | null
          vendedor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opiniones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      buscar_publicaciones: {
        Args: {
          p_categoria?: string
          p_desde?: number
          p_lat?: number
          p_limite?: number
          p_lng?: number
          p_municipio?: string
          p_radio_km?: number
          p_texto?: string
          p_zona?: string
        }
        Returns: {
          condicion: string
          destacada: boolean
          distancia_km: number
          foto_principal: string
          id: string
          precio_ars: number
          publicado_en: string
          titulo: string
          vendedor_id: string
          zona_id: string
          zona_nombre: string
        }[]
      }
      comercios_para_mapa: {
        Args: {
          p_lat?: number
          p_lng?: number
          p_municipio?: string
          p_radio_km?: number
        }
        Returns: {
          categoria_id: string
          direccion_publica: string
          distancia_km: number
          id: string
          lat: number
          lng: number
          nombre: string
          verificado: boolean
          zona_id: string
        }[]
      }
      confirmar_operacion: {
        Args: { p_confirmar?: boolean; p_contacto: string }
        Returns: undefined
      }
      contactar_publicacion: { Args: { p_publicacion: string }; Returns: Json }
      contacto_trueque: { Args: { p_id: string }; Returns: Json }
      responder_propuesta: {
        Args: { p_accion: string; p_id: string }
        Returns: undefined
      }
      staff_moderar_opinion: {
        Args: { p_motivo?: string; p_ocultar: boolean; p_opinion: string }
        Returns: undefined
      }
      staff_moderar_publicacion: {
        Args: { p_accion: string; p_motivo?: string; p_publicacion: string }
        Returns: undefined
      }
      staff_resolver_denuncia: {
        Args: { p_denuncia: string; p_estado: string; p_resolucion?: string }
        Returns: undefined
      }
      staff_suspender_perfil: {
        Args: { p_motivo?: string; p_perfil: string; p_suspender: boolean }
        Returns: undefined
      }
      staff_verificar_perfil: {
        Args: { p_nivel: string; p_perfil: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
