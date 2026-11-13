/**
 * Líneas de ayuda y recursos de crisis.
 *
 * Los números pueden cambiar. Antes de publicar, verifica cada línea con la
 * fuente oficial del país y añade un enlace a la fecha de última revisión.
 * Fuente de referencia internacional: https://findahelpline.com
 */

export interface Hotline {
  country: string
  flag: string
  lines: Array<{
    label: string
    number: string
    tel: string
    note?: string
  }>
  note?: string
}

export const HOTLINES: Hotline[] = [
  {
    country: 'Venezuela',
    flag: '🇻🇪',
    lines: [
      {
        label: 'Línea de Ayuda Psicológica (LAPSI)',
        number: '0424 2907338',
        tel: '04242907338',
        note: 'Federación de Psicólogos de Venezuela',
      },
      { label: 'Emergencias', number: '911', tel: '911', note: '24 h' },
    ],
  },
  {
    country: 'México',
    flag: '🇲🇽',
    lines: [
      { label: 'Línea de la Vida', number: '800 911 2000', tel: '8009112000', note: '24 h' },
      { label: 'Emergencias', number: '911', tel: '911', note: '24 h' },
    ],
  },
  {
    country: 'Argentina',
    flag: '🇦🇷',
    lines: [
      {
        label: 'Centro de Asistencia al Suicida',
        number: '135',
        tel: '135',
        note: 'CABA y GBA. También (011) 5275-1135',
      },
      { label: 'Emergencias', number: '911', tel: '911', note: '24 h' },
    ],
    note: 'La línea 135 puede variar según la provincia; consulta tu línea local.',
  },
  {
    country: 'Colombia',
    flag: '🇨🇴',
    lines: [
      { label: 'Línea Psicológica', number: '106', tel: '106', note: 'Bogotá, 24 h' },
      { label: 'Emergencias', number: '123', tel: '123', note: '24 h' },
    ],
    note: 'Fuera de Bogotá, consulta la línea de tu departamento o usa 123.',
  },
  {
    country: 'Chile',
    flag: '🇨🇱',
    lines: [
      {
        label: 'Línea Preventiva del Suicidio',
        number: '*4141',
        tel: '*4141',
        note: 'Desde celulares',
      },
      { label: 'SAMU', number: '131', tel: '131', note: 'Emergencias, 24 h' },
    ],
  },
  {
    country: 'Perú',
    flag: '🇵🇪',
    lines: [
      { label: 'Salud Mental', number: '113, opción 5', tel: '113', note: '24 h' },
      { label: 'SAMU', number: '105', tel: '105', note: 'Emergencias' },
    ],
  },
  {
    country: 'Uruguay',
    flag: '🇺🇾',
    lines: [
      { label: 'Línea Vida', number: '0800 0767', tel: '08000767', note: '24 h' },
      { label: 'Emergencias', number: '911', tel: '911', note: '24 h' },
    ],
  },
  {
    country: 'Estados Unidos',
    flag: '🇺🇸',
    lines: [
      {
        label: '988 Suicide & Crisis Lifeline',
        number: '988',
        tel: '988',
        note: '24 h. Pulsa 2 para español',
      },
      { label: 'Emergencias', number: '911', tel: '911', note: '24 h' },
    ],
  },
  {
    country: 'Internacional',
    flag: '🌎',
    lines: [
      {
        label: 'Find A Helpline',
        number: 'findahelpline.com',
        tel: '',
        note: 'Directorio de líneas por país',
      },
    ],
    note: 'Si tu país no aparece aquí, busca tu línea local de crisis o acude al servicio de emergencias más cercano.',
  },
]

export const EMERGENCY_REMINDER =
  'Sereno no es un servicio de emergencias. Si tú o alguien está en peligro inmediato, llama al número de emergencias de tu país.'
