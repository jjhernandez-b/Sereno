// server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z as z3 } from "zod";

// shared/crisis.ts
var HOTLINES = [
  {
    country: "Venezuela",
    flag: "\u{1F1FB}\u{1F1EA}",
    lines: [
      {
        label: "L\xEDnea de Ayuda Psicol\xF3gica (LAPSI)",
        number: "0424 2907338",
        tel: "04242907338",
        note: "Federaci\xF3n de Psic\xF3logos de Venezuela"
      },
      { label: "Emergencias", number: "911", tel: "911", note: "24 h" }
    ]
  },
  {
    country: "M\xE9xico",
    flag: "\u{1F1F2}\u{1F1FD}",
    lines: [
      { label: "L\xEDnea de la Vida", number: "800 911 2000", tel: "8009112000", note: "24 h" },
      { label: "Emergencias", number: "911", tel: "911", note: "24 h" }
    ]
  },
  {
    country: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    lines: [
      {
        label: "Centro de Asistencia al Suicida",
        number: "135",
        tel: "135",
        note: "CABA y GBA. Tambi\xE9n (011) 5275-1135"
      },
      { label: "Emergencias", number: "911", tel: "911", note: "24 h" }
    ],
    note: "La l\xEDnea 135 puede variar seg\xFAn la provincia; consulta tu l\xEDnea local."
  },
  {
    country: "Colombia",
    flag: "\u{1F1E8}\u{1F1F4}",
    lines: [
      { label: "L\xEDnea Psicol\xF3gica", number: "106", tel: "106", note: "Bogot\xE1, 24 h" },
      { label: "Emergencias", number: "123", tel: "123", note: "24 h" }
    ],
    note: "Fuera de Bogot\xE1, consulta la l\xEDnea de tu departamento o usa 123."
  },
  {
    country: "Chile",
    flag: "\u{1F1E8}\u{1F1F1}",
    lines: [
      {
        label: "L\xEDnea Preventiva del Suicidio",
        number: "*4141",
        tel: "*4141",
        note: "Desde celulares"
      },
      { label: "SAMU", number: "131", tel: "131", note: "Emergencias, 24 h" }
    ]
  },
  {
    country: "Per\xFA",
    flag: "\u{1F1F5}\u{1F1EA}",
    lines: [
      { label: "Salud Mental", number: "113, opci\xF3n 5", tel: "113", note: "24 h" },
      { label: "SAMU", number: "105", tel: "105", note: "Emergencias" }
    ]
  },
  {
    country: "Uruguay",
    flag: "\u{1F1FA}\u{1F1FE}",
    lines: [
      { label: "L\xEDnea Vida", number: "0800 0767", tel: "08000767", note: "24 h" },
      { label: "Emergencias", number: "911", tel: "911", note: "24 h" }
    ]
  },
  {
    country: "Estados Unidos",
    flag: "\u{1F1FA}\u{1F1F8}",
    lines: [
      {
        label: "988 Suicide & Crisis Lifeline",
        number: "988",
        tel: "988",
        note: "24 h. Pulsa 2 para espa\xF1ol"
      },
      { label: "Emergencias", number: "911", tel: "911", note: "24 h" }
    ]
  },
  {
    country: "Internacional",
    flag: "\u{1F30E}",
    lines: [
      {
        label: "Find A Helpline",
        number: "findahelpline.com",
        tel: "",
        note: "Directorio de l\xEDneas por pa\xEDs"
      }
    ],
    note: "Si tu pa\xEDs no aparece aqu\xED, busca tu l\xEDnea local de crisis o acude al servicio de emergencias m\xE1s cercano."
  }
];

// shared/contact.ts
import { z as z2 } from "zod";

// shared/professionals.ts
import { z } from "zod";
var SPECIALTIES = [
  {
    id: "ansiedad",
    label: "Ansiedad",
    blurb: "Preocupaci\xF3n constante, ataques de p\xE1nico, fobias y nerviosismo."
  },
  {
    id: "depresion",
    label: "Depresi\xF3n y \xE1nimo",
    blurb: "Tristeza persistente, falta de energ\xEDa, desmotivaci\xF3n o vac\xEDo."
  },
  {
    id: "estres",
    label: "Estr\xE9s y burnout",
    blurb: "Agotamiento, presi\xF3n laboral, dificultad para desconectar."
  },
  {
    id: "duelo",
    label: "Duelo y p\xE9rdida",
    blurb: "P\xE9rdida de un ser querido, rupturas, cambios vitales."
  },
  {
    id: "pareja",
    label: "Pareja y familia",
    blurb: "Conflictos, comunicaci\xF3n, l\xEDmites y v\xEDnculos familiares."
  },
  {
    id: "autoestima",
    label: "Autoestima",
    blurb: "Autocr\xEDtica, inseguridad, dificultad para poner l\xEDmites."
  },
  {
    id: "trauma",
    label: "Trauma",
    blurb: "Experiencias dif\xEDciles, estr\xE9s postraum\xE1tico y seguridad emocional."
  },
  {
    id: "tdah",
    label: "TDAH adulto",
    blurb: "Concentraci\xF3n, impulsividad, organizaci\xF3n y sobrecarga."
  },
  {
    id: "adolescentes",
    label: "Adolescentes",
    blurb: "Acompa\xF1amiento a j\xF3venes y orientaci\xF3n a sus familias."
  },
  {
    id: "tca",
    label: "Conducta alimentaria",
    blurb: "Relaci\xF3n con la comida, la imagen corporal y el cuerpo."
  },
  {
    id: "sueno",
    label: "Sue\xF1o",
    blurb: "Insomnio, rutinas de descanso y ansiedad nocturna."
  },
  {
    id: "adicciones",
    label: "Adicciones",
    blurb: "Consumo de sustancias, juego y conductas compulsivas."
  }
];
var ROLES = ["psicologo", "psiquiatra"];
var MODALITIES = ["video", "chat", "telefono"];
var ROLE_LABELS = {
  psicologo: "Psic\xF3logo/a cl\xEDnico/a",
  psiquiatra: "Psiquiatra"
};
var PROFESSIONALS = [
  {
    slug: "valentina-rios",
    name: "Valentina R\xEDos",
    role: "psicologo",
    title: "Psic\xF3loga cl\xEDnica \xB7 Terapia cognitivo-conductual",
    verification: "demo",
    experienceYears: 9,
    location: "Ciudad de M\xE9xico",
    country: "M\xE9xico",
    languages: ["Espa\xF1ol", "Ingl\xE9s"],
    specialties: ["ansiedad", "estres", "sueno"],
    modalities: ["video", "chat"],
    priceUsd: 45,
    bio: "Acompa\xF1o a personas adultas que viven con ansiedad, preocupaci\xF3n constante o dificultades para descansar. Mi trabajo se centra en entender qu\xE9 mantiene el malestar y construir herramientas que puedas usar en tu d\xEDa a d\xEDa.",
    approach: 'Trabajo desde la terapia cognitivo-conductual con un enfoque c\xE1lido y colaborativo. No se trata de "pensar positivo", sino de mirar tus pensamientos y h\xE1bitos con curiosidad, sin juicio, y probar cambios peque\xF1os y sostenibles.',
    focusTags: ["ataques de p\xE1nico", "preocupaci\xF3n excesiva", "insomnio", "presi\xF3n laboral"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "M\xE1ster en Psicolog\xEDa Cl\xEDnica y de la Salud (demo)",
      "Formaci\xF3n en terapia cognitivo-conductual para ansiedad (demo)",
      "C\xE9dula profesional 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Videollamada de 50 minutos",
      "Plan de trabajo personalizado",
      "Ejercicios pr\xE1cticos entre sesiones",
      "Mensajer\xEDa breve para dudas puntuales"
    ],
    availabilityNote: "Atiende de lunes a jueves, con horarios de ma\xF1ana y tarde.",
    nextSlot: "Esta semana",
    featured: true,
    avatarTone: 0
  },
  {
    slug: "mateo-herrera",
    name: "Mateo Herrera",
    role: "psiquiatra",
    title: "Psiquiatra \xB7 Adultos",
    verification: "demo",
    experienceYears: 12,
    location: "Bogot\xE1",
    country: "Colombia",
    languages: ["Espa\xF1ol"],
    specialties: ["depresion", "ansiedad", "tdah"],
    modalities: ["video", "telefono"],
    priceUsd: 70,
    bio: "Atiendo a personas adultas con depresi\xF3n, ansiedad y dificultades de atenci\xF3n. Mi objetivo es que entiendas tu situaci\xF3n y las opciones disponibles, incluyendo \u2014cuando hace falta\u2014 el papel de la medicaci\xF3n.",
    approach: "Realizo una evaluaci\xF3n cuidadosa antes de proponer cualquier tratamiento. Explico beneficios, riesgos y alternativas, y reviso contigo la evoluci\xF3n. La medicaci\xF3n nunca sustituye el acompa\xF1amiento psicol\xF3gico ni tu propio contexto de vida.",
    focusTags: ["depresi\xF3n", "trastorno de ansiedad", "TDAH adulto", "evaluaci\xF3n psiqui\xE1trica"],
    credentials: [
      "M\xE9dico cirujano \u2014 universidad acreditada (demo)",
      "Especialidad en Psiquiatr\xEDa (demo)",
      "Formaci\xF3n en evaluaci\xF3n y seguimiento de trastornos del estado de \xE1nimo (demo)",
      "Registro profesional 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Primera evaluaci\xF3n de 60 minutos",
      "Revisi\xF3n de historia cl\xEDnica y objetivos",
      "Plan de tratamiento explicado",
      "Seguimiento y ajustes cuando corresponda"
    ],
    availabilityNote: "Primera consulta en 60 minutos; seguimientos de 30 minutos.",
    nextSlot: "En 2 d\xEDas",
    featured: true,
    avatarTone: 1
  },
  {
    slug: "camila-duarte",
    name: "Camila Duarte",
    role: "psicologo",
    title: "Psic\xF3loga cl\xEDnica \xB7 Trauma y duelo",
    verification: "demo",
    experienceYears: 11,
    location: "Buenos Aires",
    country: "Argentina",
    languages: ["Espa\xF1ol", "Portugu\xE9s"],
    specialties: ["duelo", "trauma", "ansiedad"],
    modalities: ["video", "chat"],
    priceUsd: 40,
    bio: "Acompa\xF1o procesos de duelo, rupturas y experiencias que dejaron una huella emocional. Mi prioridad es que te sientas en un espacio seguro, sin tener que contar todo de una vez.",
    approach: "Integro herramientas de terapia cognitivo-conductual y EMDR con una mirada respetuosa del ritmo de cada persona. Trabajamos estabilidad, recursos de regulaci\xF3n emocional y, cuando est\xE9s listo/a, el procesamiento de la experiencia.",
    focusTags: ["p\xE9rdida", "ruptura", "trauma", "regulaci\xF3n emocional"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "Especializaci\xF3n en Psicolog\xEDa Cl\xEDnica (demo)",
      "Formaci\xF3n en EMDR nivel II (demo)",
      "Matr\xEDcula profesional 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Videollamada de 50 minutos",
      "Acuerdos de seguridad y cuidado",
      "Herramientas de regulaci\xF3n emocional",
      "Seguimiento respetuoso del ritmo"
    ],
    availabilityNote: "Atiende martes, jueves y s\xE1bados.",
    nextSlot: "Esta semana",
    featured: true,
    avatarTone: 2
  },
  {
    slug: "andres-salas",
    name: "Andr\xE9s Salas",
    role: "psicologo",
    title: "Psic\xF3logo cl\xEDnico \xB7 Parejas y familias",
    verification: "demo",
    experienceYears: 14,
    location: "Santiago",
    country: "Chile",
    languages: ["Espa\xF1ol"],
    specialties: ["pareja", "autoestima", "estres"],
    modalities: ["video"],
    priceUsd: 55,
    bio: "Trabajo con parejas y familias que quieren entender sus conflictos y encontrar formas m\xE1s claras de comunicarse. Tambi\xE9n acompa\xF1o a personas que sienten que siempre est\xE1n cediendo demasiado.",
    approach: "Uso un enfoque sist\xE9mico: los problemas no viven en una sola persona, sino en la forma en que nos relacionamos. Trabajamos patrones, l\xEDmites y acuerdos concretos, con tareas para probar entre sesiones.",
    focusTags: ["comunicaci\xF3n", "conflictos de pareja", "l\xEDmites", "familia"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "M\xE1ster en Terapia Familiar Sist\xE9mica (demo)",
      "Formaci\xF3n en mediaci\xF3n de conflictos (demo)",
      "Registro profesional 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Sesi\xF3n de pareja o familia de 60 minutos",
      "Mapa de patrones y acuerdos",
      "Tareas concretas entre sesiones",
      "Sesiones individuales si se requieren"
    ],
    availabilityNote: "Atiende mi\xE9rcoles a viernes y s\xE1bados por la ma\xF1ana.",
    nextSlot: "Pr\xF3xima semana",
    avatarTone: 3
  },
  {
    slug: "lucia-ferrer",
    name: "Luc\xEDa Ferrer",
    role: "psiquiatra",
    title: "Psiquiatra \xB7 Ansiedad y TDAH adulto",
    verification: "demo",
    experienceYears: 8,
    location: "Madrid",
    country: "Espa\xF1a",
    languages: ["Espa\xF1ol", "Ingl\xE9s"],
    specialties: ["ansiedad", "tdah", "depresion"],
    modalities: ["video"],
    priceUsd: 65,
    bio: "Me dedico a la evaluaci\xF3n y seguimiento de ansiedad, TDAH adulto y trastornos del estado de \xE1nimo. Explico cada paso con claridad para que puedas decidir de forma informada.",
    approach: "Mi pr\xE1ctica combina evaluaci\xF3n cl\xEDnica rigurosa, psicoeducaci\xF3n y un plan de tratamiento dialogado. Cuando la medicaci\xF3n es una opci\xF3n, revisamos expectativas, efectos y alternativas antes de comenzar.",
    focusTags: ["ansiedad", "TDAH adulto", "medicaci\xF3n", "evaluaci\xF3n"],
    credentials: [
      "Licenciatura en Medicina \u2014 universidad acreditada (demo)",
      "Especialidad en Psiquiatr\xEDa (demo)",
      "Formaci\xF3n en TDAH en adultos (demo)",
      "N\xFAmero de colegiado 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Evaluaci\xF3n inicial de 60 minutos",
      "Revisi\xF3n de antecedentes y objetivos",
      "Plan de tratamiento por escrito",
      "Seguimientos de 30 minutos"
    ],
    availabilityNote: "Atiende lunes, martes y jueves por la tarde.",
    nextSlot: "En 3 d\xEDas",
    avatarTone: 4
  },
  {
    slug: "renata-alves",
    name: "Renata Alves",
    role: "psicologo",
    title: "Psic\xF3loga cl\xEDnica \xB7 Autoestima y cuerpo",
    verification: "demo",
    experienceYears: 7,
    location: "Lima",
    country: "Per\xFA",
    languages: ["Espa\xF1ol", "Portugu\xE9s"],
    specialties: ["autoestima", "tca", "ansiedad"],
    modalities: ["video", "chat"],
    priceUsd: 35,
    bio: "Acompa\xF1o a personas que quieren mejorar su relaci\xF3n consigo mismas, con su cuerpo y con la comida. Trabajo sin discursos de culpa ni metas imposibles.",
    approach: "Parto de una mirada compasiva y basada en evidencia. Exploramos de d\xF3nde vienen tus exigencias, c\xF3mo afectan tu d\xEDa a d\xEDa y qu\xE9 cambios peque\xF1os pueden ayudarte a sentir m\xE1s calma y libertad.",
    focusTags: ["autoestima", "imagen corporal", "relaci\xF3n con la comida", "autocr\xEDtica"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "Especializaci\xF3n en Psicolog\xEDa Cl\xEDnica (demo)",
      "Formaci\xF3n en trastornos de la conducta alimentaria (demo)",
      "Colegiatura 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Sesi\xF3n de 50 minutos",
      "Espacio libre de juicios",
      "Ejercicios de autoobservaci\xF3n",
      "Coordinaci\xF3n con otros profesionales si hace falta"
    ],
    availabilityNote: "Atiende de lunes a viernes por la ma\xF1ana y noche.",
    nextSlot: "Esta semana",
    avatarTone: 5
  },
  {
    slug: "julian-mora",
    name: "Juli\xE1n Mora",
    role: "psicologo",
    title: "Psic\xF3logo cl\xEDnico \xB7 Adolescentes",
    verification: "demo",
    experienceYears: 10,
    location: "Monterrey",
    country: "M\xE9xico",
    languages: ["Espa\xF1ol"],
    specialties: ["adolescentes", "ansiedad", "pareja"],
    modalities: ["video", "telefono"],
    priceUsd: 50,
    bio: "Trabajo con adolescentes y sus familias en etapas de cambios, conflictos y presi\xF3n escolar o social. Incluyo a la familia cuando es \xFAtil, siempre cuidando la confidencialidad del joven.",
    approach: "Construyo primero un v\xEDnculo de confianza. Despu\xE9s trabajamos habilidades para manejar ansiedad, comunicaci\xF3n y toma de decisiones. Con los cuidadores acordamos pautas claras y realistas.",
    focusTags: ["adolescentes", "familia", "ansiedad escolar", "comunicaci\xF3n"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "M\xE1ster en Psicolog\xEDa Infantil y Adolescente (demo)",
      "Formaci\xF3n en terapia familiar (demo)",
      "C\xE9dula profesional 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Primera entrevista con el/la adolescente",
      "Sesi\xF3n de orientaci\xF3n con cuidadores",
      "Plan de acompa\xF1amiento",
      "Coordinaci\xF3n con la escuela si se autoriza"
    ],
    availabilityNote: "Atiende lunes a viernes despu\xE9s de las 15:00.",
    nextSlot: "Pr\xF3xima semana",
    avatarTone: 6
  },
  {
    slug: "sofia-ledesma",
    name: "Sof\xEDa Ledesma",
    role: "psicologo",
    title: "Psic\xF3loga cl\xEDnica \xB7 Estr\xE9s y burnout",
    verification: "demo",
    experienceYears: 13,
    location: "Valencia",
    country: "Espa\xF1a",
    languages: ["Espa\xF1ol", "Ingl\xE9s"],
    specialties: ["estres", "ansiedad", "sueno"],
    modalities: ["video", "chat"],
    priceUsd: 48,
    bio: "Ayudo a personas que sienten que ya no pueden m\xE1s con el trabajo, el estudio o las responsabilidades. Mi enfoque es pr\xE1ctico y humano: recuperar energ\xEDa, poner l\xEDmites y volver a sentirte t\xFA.",
    approach: "Combino terapia cognitivo-conductual, psicoeducaci\xF3n sobre estr\xE9s y pr\xE1cticas de mindfulness basadas en evidencia. Revisamos tu carga real de demandas y dise\xF1amos cambios sostenibles, no soluciones m\xE1gicas.",
    focusTags: ["burnout", "agotamiento", "l\xEDmites", "descanso"],
    credentials: [
      "Licenciatura en Psicolog\xEDa \u2014 universidad acreditada (demo)",
      "M\xE1ster en Psicolog\xEDa Cl\xEDnica (demo)",
      "Formaci\xF3n en mindfulness basado en evidencia (demo)",
      "N\xFAmero de colegiado 00000000 (dato de muestra)"
    ],
    sessionIncludes: [
      "Sesi\xF3n de 50 minutos",
      "An\xE1lisis de fuentes de estr\xE9s",
      "Plan de recuperaci\xF3n y l\xEDmites",
      "Pr\xE1cticas breves de regulaci\xF3n"
    ],
    availabilityNote: "Atiende de martes a viernes por la tarde.",
    nextSlot: "Esta semana",
    avatarTone: 7
  }
];
function getSpecialty(id) {
  return SPECIALTIES.find((specialty) => specialty.id === id);
}
function specialtyLabel(id) {
  return getSpecialty(id)?.label ?? id;
}
var SPECIALTY_ID_VALUES = SPECIALTIES.map((specialty) => specialty.id);
var professionalInputSchema = z.object({
  name: z.string().trim().min(3, { message: "Escribe el nombre completo (m\xEDnimo 3 caracteres)." }).max(80, { message: "El nombre es demasiado largo." }),
  specialties: z.array(z.enum(SPECIALTY_ID_VALUES, { message: "Selecciona una especialidad v\xE1lida." })).min(1, { message: "Selecciona al menos una especialidad." }).max(3, { message: "Puedes seleccionar hasta tres especialidades." }),
  languages: z.array(
    z.string().trim().min(2, { message: "Cada idioma debe tener al menos 2 caracteres." }).max(30, { message: "El nombre del idioma es demasiado largo." })
  ).min(1, { message: "Indica al menos un idioma." }).max(8, { message: "Puedes indicar hasta ocho idiomas." }),
  experienceYears: z.number({ message: "Indica los a\xF1os de experiencia." }).int({ message: "Los a\xF1os de experiencia deben ser un n\xFAmero entero." }).min(1, { message: "Indica al menos un a\xF1o de experiencia." }).max(60, { message: "Los a\xF1os de experiencia no pueden superar 60." }),
  priceUsd: z.number({ message: "Indica el precio por sesi\xF3n." }).int({ message: "El precio debe ser un n\xFAmero entero de d\xF3lares." }).min(1, { message: "El precio debe ser mayor que cero." }).max(1e3, { message: "El precio no puede superar US$1000." }),
  role: z.enum(ROLES).default("psicologo"),
  modalities: z.array(z.enum(MODALITIES)).min(1, { message: "Selecciona al menos una modalidad." }).max(3).default(["video"]),
  title: z.string().trim().max(140, { message: "El t\xEDtulo es demasiado largo." }).optional(),
  location: z.string().trim().max(80, { message: "La ubicaci\xF3n es demasiado larga." }).optional(),
  country: z.string().trim().max(60, { message: "El pa\xEDs es demasiado largo." }).optional(),
  bio: z.string().trim().max(1e3, { message: "La biograf\xEDa no puede superar 1000 caracteres." }).optional(),
  approach: z.string().trim().max(1e3, { message: "El enfoque no puede superar 1000 caracteres." }).optional(),
  nextSlot: z.string().trim().max(40, { message: "La disponibilidad es demasiado larga." }).optional(),
  availabilityNote: z.string().trim().max(200, { message: "La nota de disponibilidad es demasiado larga." }).optional(),
  featured: z.boolean().default(false)
});

// shared/contact.ts
var AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+", "menor-18"];
var AGE_RANGE_LABELS = {
  "18-24": "18 a 24 a\xF1os",
  "25-34": "25 a 34 a\xF1os",
  "35-44": "35 a 44 a\xF1os",
  "45-54": "45 a 54 a\xF1os",
  "55+": "55 a\xF1os o m\xE1s",
  "menor-18": "Menor de 18 a\xF1os"
};
var CONTACT_REASONS = [...SPECIALTIES.map((specialty) => specialty.id), "no-se"];
var CONTACT_REASON_LABELS = {
  ...Object.fromEntries(SPECIALTIES.map((specialty) => [specialty.id, specialty.label])),
  "no-se": "No estoy seguro/a todav\xEDa"
};
var PREFERRED_TIMES = ["manana", "tarde", "noche", "fin-de-semana", "flexible"];
var PREFERRED_TIME_LABELS = {
  manana: "Ma\xF1ana (08:00\u201312:00)",
  tarde: "Tarde (12:00\u201318:00)",
  noche: "Noche (18:00\u201322:00)",
  "fin-de-semana": "Fin de semana",
  flexible: "Me adapto / flexible"
};
var CONTACT_MODALITIES = ["video", "chat", "telefono", "indiferente"];
var CONTACT_MODALITY_LABELS = {
  video: "Videollamada",
  chat: "Mensajer\xEDa",
  telefono: "Llamada telef\xF3nica",
  indiferente: "Me es indiferente"
};
var contactRequestSchema = z2.object({
  professionalSlug: z2.string().trim().min(1).max(80),
  fullName: z2.string().trim().min(2, { message: "Escribe tu nombre (m\xEDnimo 2 caracteres)." }).max(80, { message: "El nombre es demasiado largo." }),
  email: z2.email({ message: "Escribe un correo electr\xF3nico v\xE1lido." }).max(160, { message: "El correo es demasiado largo." }),
  phone: z2.string().trim().max(30, { message: "El tel\xE9fono es demasiado largo." }).optional().default(""),
  ageRange: z2.enum(AGE_RANGES, { message: "Selecciona tu rango de edad." }),
  country: z2.string().trim().max(60, { message: "El pa\xEDs o ciudad es demasiado largo." }).optional().default(""),
  reason: z2.enum(CONTACT_REASONS, { message: "Selecciona un motivo de consulta." }),
  message: z2.string().trim().min(20, { message: "Cu\xE9ntanos un poco m\xE1s (m\xEDnimo 20 caracteres)." }).max(1200, { message: "El mensaje no puede superar los 1200 caracteres." }),
  preferredTime: z2.enum(PREFERRED_TIMES, { message: "Selecciona un horario de preferencia." }),
  modality: z2.enum(CONTACT_MODALITIES, { message: "Selecciona una modalidad." }),
  consentPrivacy: z2.boolean().refine((value) => value === true, {
    message: "Necesitamos tu consentimiento para tratar tus datos."
  }),
  consentContact: z2.boolean().refine((value) => value === true, {
    message: "Necesitamos tu permiso para contactarte."
  }),
  acknowledgeEmergency: z2.boolean().refine((value) => value === true, {
    message: "Confirma que entiendes que este servicio no es una l\xEDnea de emergencia."
  }),
  /** Campo trampa para bots: debe llegar vacío. */
  website: z2.string().max(0).optional().default("")
});
function toFieldErrors(error) {
  const result = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

// server/email.ts
var RESEND_ENDPOINT = "https://api.resend.com/emails";
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function buildText(request) {
  return [
    `Nueva solicitud de cita \u2014 ${request.reference}`,
    "",
    `Profesional: ${request.professionalName} (${request.professionalSlug})`,
    `Nombre: ${request.fullName}`,
    `Correo: ${request.email}`,
    `Tel\xE9fono: ${request.phone || "No indicado"}`,
    `Edad: ${AGE_RANGE_LABELS[request.ageRange] ?? request.ageRange}`,
    `Pa\xEDs/ciudad: ${request.country || "No indicado"}`,
    `Motivo: ${CONTACT_REASON_LABELS[request.reason] ?? request.reason}`,
    `Horario preferido: ${PREFERRED_TIME_LABELS[request.preferredTime] ?? request.preferredTime}`,
    `Modalidad: ${CONTACT_MODALITY_LABELS[request.modality] ?? request.modality}`,
    "",
    "Mensaje:",
    request.message,
    "",
    `Fecha: ${request.createdAt}`,
    "",
    "Este correo contiene datos personales y de salud. Tr\xE1talo de forma confidencial."
  ].join("\n");
}
function buildHtml(request) {
  const rows = [
    ["Profesional", `${request.professionalName} (${request.professionalSlug})`],
    ["Nombre", request.fullName],
    ["Correo", request.email],
    ["Tel\xE9fono", request.phone || "No indicado"],
    ["Edad", AGE_RANGE_LABELS[request.ageRange] ?? request.ageRange],
    ["Pa\xEDs/ciudad", request.country || "No indicado"],
    ["Motivo", CONTACT_REASON_LABELS[request.reason] ?? request.reason],
    ["Horario preferido", PREFERRED_TIME_LABELS[request.preferredTime] ?? request.preferredTime],
    ["Modalidad", CONTACT_MODALITY_LABELS[request.modality] ?? request.modality]
  ];
  const table = rows.map(
    ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e7e1d5;color:#52645f;font-size:13px;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e7e1d5;color:#12211f;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
  ).join("");
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f7f2e8;font-family:Arial,Helvetica,sans-serif;color:#12211f;">
    <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e7e1d5;border-radius:20px;overflow:hidden;">
      <div style="background:#0c2b27;padding:24px 28px;color:#f7f2e8;">
        <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.7;">Sereno \xB7 Nueva solicitud</p>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${escapeHtml(request.reference)}</h1>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">${table}</table>
        <h2 style="font-size:14px;margin:24px 0 8px;color:#52645f;">Mensaje</h2>
        <p style="margin:0;white-space:pre-wrap;background:#f0f7f4;border-radius:12px;padding:16px;font-size:14px;line-height:1.6;">${escapeHtml(request.message)}</p>
        <p style="margin:24px 0 0;font-size:12px;color:#52645f;line-height:1.6;">
          Creada el ${escapeHtml(new Date(request.createdAt).toLocaleString("es-ES"))}.<br />
          Este correo contiene datos personales y de salud. Tr\xE1talo de forma confidencial y responde dentro de tus canales seguros.
        </p>
      </div>
    </div>
  </body>
</html>`;
}
async function sendContactNotification(request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "Sereno <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.info(
      `[sereno] Correo no configurado; solicitud ${request.reference} no notificada. Define RESEND_API_KEY y CONTACT_NOTIFICATION_EMAIL para activar los avisos.`
    );
    return { sent: false };
  }
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: request.email,
        subject: `Nueva solicitud ${request.reference} \u2014 ${request.professionalName}`,
        text: buildText(request),
        html: buildHtml(request)
      }),
      signal: AbortSignal.timeout(8e3)
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend respondi\xF3 ${response.status}: ${detail.slice(0, 200)}`);
    }
    return { sent: true };
  } catch (error) {
    console.error(`[sereno] No se pudo enviar la notificaci\xF3n de ${request.reference}.`, error);
    return { sent: false };
  }
}

// server/store.ts
import { randomBytes } from "node:crypto";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}
var cachedClient = null;
function getSupabaseClient(config) {
  if (cachedClient?.url === config.url && cachedClient.key === config.key) {
    return cachedClient.client;
  }
  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { "X-Client-Info": "sereno-web" },
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8e3) })
    }
  });
  cachedClient = { ...config, client };
  return client;
}
function storageMode() {
  return getSupabaseConfig() ? "supabase" : "memory";
}

// server/store.ts
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var TABLE = "contact_requests";
function createReference() {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return `SR-${code}`;
}
var memoryStore = [];
function fromContactRequestRow(row) {
  return {
    reference: row.reference,
    createdAt: row.created_at,
    professionalSlug: row.professional_slug,
    professionalName: row.professional_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    ageRange: row.age_range,
    country: row.country ?? "",
    reason: row.reason,
    message: row.message,
    preferredTime: row.preferred_time,
    modality: row.modality,
    status: row.status === "new" ? "new" : "new",
    source: "web"
  };
}
function toContactRequestRow(request) {
  return {
    reference: request.reference,
    created_at: request.createdAt,
    professional_slug: request.professionalSlug,
    professional_name: request.professionalName,
    full_name: request.fullName,
    email: request.email,
    phone: request.phone,
    age_range: request.ageRange,
    country: request.country,
    reason: request.reason,
    message: request.message,
    preferred_time: request.preferredTime,
    modality: request.modality,
    status: request.status,
    source: request.source
  };
}
async function persistContactRequest(request) {
  const config = getSupabaseConfig();
  if (!config) {
    memoryStore.push(request);
    console.info(
      `[sereno] Solicitud ${request.reference} creada (modo sin persistencia). Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para guardarla.`
    );
    return { persisted: false };
  }
  try {
    const client = getSupabaseClient(config);
    const { error } = await client.from(TABLE).insert(toContactRequestRow(request));
    if (error) {
      throw new Error(error.message);
    }
    return { persisted: true };
  } catch (error) {
    console.error(`[sereno] No se pudo persistir la solicitud ${request.reference}.`, error);
    memoryStore.push(request);
    return { persisted: false };
  }
}
async function listContactRequests() {
  const config = getSupabaseConfig();
  if (!config) {
    return { storage: "memory", requests: [...memoryStore].reverse() };
  }
  const client = getSupabaseClient(config);
  const { data, error } = await client.from(TABLE).select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return {
    storage: "supabase",
    requests: (data ?? []).map((row) => fromContactRequestRow(row))
  };
}
function toStoredRequest(data, professionalName) {
  return {
    reference: createReference(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    professionalSlug: data.professionalSlug,
    professionalName,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? "",
    ageRange: data.ageRange,
    country: data.country ?? "",
    reason: data.reason,
    message: data.message,
    preferredTime: data.preferredTime,
    modality: data.modality,
    status: "new",
    source: "web"
  };
}

// server/admin-auth.ts
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
var DEFAULT_SESSION_HOURS = 8;
function adminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
}
function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || adminPassword();
}
function sessionTtlMs() {
  const configured = Number(process.env.ADMIN_SESSION_HOURS);
  const hours = Number.isFinite(configured) && configured > 0 ? Math.min(configured, 168) : DEFAULT_SESSION_HOURS;
  return hours * 60 * 60 * 1e3;
}
function safeEqual(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
function digest(value) {
  return createHash("sha256").update(value).digest();
}
function isAdminConfigured() {
  return adminPassword() !== null;
}
function verifyAdminPassword(candidate) {
  const password = adminPassword();
  if (!password) return false;
  return timingSafeEqual(digest(candidate), digest(password));
}
function createAdminToken(now = Date.now()) {
  const secret = adminSecret();
  if (!secret) return null;
  const expiresAt = now + sessionTtlMs();
  const payload = { sub: "developer", iat: now, exp: expiresAt };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return { token: `${encoded}.${signature}`, expiresAt: new Date(expiresAt).toISOString() };
}
function verifyAdminToken(token, now = Date.now()) {
  const secret = adminSecret();
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (payload.sub !== "developer") return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    if (typeof payload.iat !== "number") return null;
    return payload;
  } catch {
    return null;
  }
}
function requireAdmin(req, res, next) {
  if (!isAdminConfigured()) {
    res.status(503).json({
      ok: false,
      error: "admin_disabled",
      message: "El panel no est\xE1 configurado. Define ADMIN_PASSWORD en las variables del servidor."
    });
    return;
  }
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  const session = scheme?.toLowerCase() === "bearer" ? verifyAdminToken(token) : null;
  if (!session) {
    res.status(401).json({
      ok: false,
      error: "unauthorized",
      message: "La sesi\xF3n del panel no es v\xE1lida o ha caducado. Vuelve a iniciar sesi\xF3n."
    });
    return;
  }
  next();
}

// server/professionals-store.ts
import { randomBytes as randomBytes2 } from "node:crypto";
var TABLE2 = "professionals";
var ProfessionalStorageNotConfiguredError = class extends Error {
  constructor() {
    super(
      "Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para guardar profesionales en la base de datos."
    );
    this.name = "ProfessionalStorageNotConfiguredError";
  }
};
function uniqueValues(values) {
  return Array.from(new Set(values));
}
function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function avatarToneFor(name) {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 8;
  }
  return hash;
}
function buildProfessional(input, slug) {
  const specialties = uniqueValues(input.specialties);
  const primarySpecialty = specialties[0] ?? "ansiedad";
  const title = input.title?.trim() || `${ROLE_LABELS[input.role]} \xB7 ${specialtyLabel(primarySpecialty)}`;
  return {
    slug,
    name: input.name.trim(),
    role: input.role,
    title,
    verification: "verified",
    experienceYears: input.experienceYears,
    location: input.location?.trim() ?? "",
    country: input.country?.trim() ?? "",
    languages: uniqueValues(input.languages.map((language) => language.trim()).filter(Boolean)),
    specialties,
    modalities: uniqueValues(input.modalities),
    priceUsd: input.priceUsd,
    bio: input.bio?.trim() ?? "",
    approach: input.approach?.trim() ?? "",
    focusTags: [],
    credentials: [],
    sessionIncludes: [],
    availabilityNote: input.availabilityNote?.trim() || "Horario a coordinar directamente con el profesional.",
    nextSlot: input.nextSlot?.trim() || "Disponible",
    featured: input.featured,
    avatarTone: avatarToneFor(input.name)
  };
}
function toProfessionalRow(professional) {
  return {
    slug: professional.slug,
    name: professional.name,
    role: professional.role,
    title: professional.title,
    verification: professional.verification,
    experience_years: professional.experienceYears,
    location: professional.location,
    country: professional.country,
    languages: professional.languages,
    specialties: professional.specialties,
    modalities: professional.modalities,
    price_usd: professional.priceUsd,
    bio: professional.bio,
    approach: professional.approach,
    focus_tags: professional.focusTags,
    credentials: professional.credentials,
    session_includes: professional.sessionIncludes,
    availability_note: professional.availabilityNote,
    next_slot: professional.nextSlot,
    featured: Boolean(professional.featured),
    avatar_tone: professional.avatarTone
  };
}
function fromProfessionalRow(row) {
  const role = row.role === "psiquiatra" ? "psiquiatra" : "psicologo";
  const specialties = row.specialties?.length ? row.specialties : ["ansiedad"];
  return {
    slug: row.slug,
    name: row.name,
    role,
    title: row.title || `${ROLE_LABELS[role]} \xB7 ${specialtyLabel(specialties[0] ?? "ansiedad")}`,
    verification: row.verification === "demo" ? "demo" : "verified",
    experienceYears: Number(row.experience_years) || 0,
    location: row.location ?? "",
    country: row.country ?? "",
    languages: row.languages?.length ? row.languages : ["Espa\xF1ol"],
    specialties,
    modalities: row.modalities?.length ? row.modalities : ["video"],
    priceUsd: Number(row.price_usd) || 0,
    bio: row.bio ?? "",
    approach: row.approach ?? "",
    focusTags: row.focus_tags ?? [],
    credentials: row.credentials ?? [],
    sessionIncludes: row.session_includes ?? [],
    availabilityNote: row.availability_note ?? "",
    nextSlot: row.next_slot || "Disponible",
    featured: Boolean(row.featured),
    avatarTone: Number.isFinite(row.avatar_tone) ? row.avatar_tone : 0
  };
}
async function listDatabaseProfessionals() {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    const client = getSupabaseClient(config);
    const { data, error } = await client.from(TABLE2).select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => fromProfessionalRow(row));
  } catch (error) {
    console.error("[sereno] No se pudieron leer los profesionales de Supabase.", error);
    return null;
  }
}
async function listPublicProfessionals() {
  const database = await listDatabaseProfessionals();
  if (database && database.length > 0) {
    return { professionals: database, source: "database" };
  }
  return { professionals: PROFESSIONALS, source: "demo" };
}
async function findPublicProfessional(slug) {
  if (!slug) return void 0;
  const { professionals } = await listPublicProfessionals();
  return professionals.find((professional) => professional.slug === slug);
}
async function reserveSlug(client, base) {
  let candidate = base;
  for (let attempt = 2; attempt < 100; attempt += 1) {
    const { data, error } = await client.from(TABLE2).select("slug").eq("slug", candidate).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return candidate;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${randomBytes2(3).toString("hex")}`;
}
async function createDatabaseProfessional(input) {
  const config = getSupabaseConfig();
  if (!config) throw new ProfessionalStorageNotConfiguredError();
  const client = getSupabaseClient(config);
  const baseSlug = slugify(input.name) || "profesional";
  const slug = await reserveSlug(client, baseSlug);
  const professional = buildProfessional(input, slug);
  const { data, error } = await client.from(TABLE2).insert(toProfessionalRow(professional)).select("*").single();
  if (error) throw new Error(error.message);
  return fromProfessionalRow(data);
}
async function deleteDatabaseProfessional(slug) {
  const config = getSupabaseConfig();
  if (!config) throw new ProfessionalStorageNotConfiguredError();
  const client = getSupabaseClient(config);
  const { data, error } = await client.from(TABLE2).delete().eq("slug", slug).select("slug");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

// server/app.ts
var app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
var configuredOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(
  cors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
  })
);
app.use(express.json({ limit: "32kb" }));
var configuredLimit = Number(process.env.CONTACT_RATE_LIMIT_MAX);
var contactLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 5;
var contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1e3,
  limit: contactLimit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    ok: false,
    error: "rate_limited",
    message: "Recibimos varias solicitudes desde esta conexi\xF3n. Int\xE9ntalo de nuevo en unos minutos."
  }
});
var adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    ok: false,
    error: "rate_limited",
    message: "Demasiados intentos de acceso. Espera unos minutos antes de volver a intentarlo."
  }
});
var adminLoginSchema = z3.object({
  password: z3.string().min(1, { message: "Escribe la contrase\xF1a del panel." }).max(200)
});
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "sereno-api",
    storage: storageMode(),
    adminConfigured: isAdminConfigured(),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/professionals", async (_req, res) => {
  const { professionals, source } = await listPublicProfessionals();
  res.json({ ok: true, count: professionals.length, source, professionals });
});
app.get("/api/professionals/:slug", async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const professional = await findPublicProfessional(slug);
  if (!professional) {
    res.status(404).json({ ok: false, error: "not_found", message: "Profesional no encontrado." });
    return;
  }
  res.json({ ok: true, professional });
});
app.get("/api/crisis-resources", (_req, res) => {
  res.json({ ok: true, hotlines: HOTLINES });
});
app.post("/api/contact-requests", contactLimiter, async (req, res) => {
  const parsed = contactRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "validation_error",
      message: "Revisa los campos marcados e int\xE9ntalo de nuevo.",
      fieldErrors: toFieldErrors(parsed.error)
    });
    return;
  }
  const data = parsed.data;
  const professional = await findPublicProfessional(data.professionalSlug);
  if (!professional) {
    res.status(404).json({
      ok: false,
      error: "professional_not_found",
      message: "El profesional seleccionado ya no est\xE1 disponible."
    });
    return;
  }
  const request = toStoredRequest(data, professional.name);
  const [storageResult, emailResult] = await Promise.all([
    persistContactRequest(request),
    sendContactNotification(request)
  ]);
  console.info(
    `[sereno] Solicitud ${request.reference} \xB7 ${professional.slug} \xB7 almacenada=${storageResult.persisted} \xB7 email=${emailResult.sent}`
  );
  res.status(201).json({
    ok: true,
    reference: request.reference,
    receivedAt: request.createdAt,
    persisted: storageResult.persisted,
    emailNotified: emailResult.sent,
    message: "Tu solicitud fue enviada. El equipo de Sereno te contactar\xE1 por correo en un plazo orientativo de 24 a 48 horas h\xE1biles."
  });
});
app.post("/api/admin/login", adminLoginLimiter, (req, res) => {
  if (!isAdminConfigured()) {
    res.status(503).json({
      ok: false,
      error: "admin_disabled",
      message: "El panel no est\xE1 configurado. Define ADMIN_PASSWORD en las variables del servidor."
    });
    return;
  }
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "validation_error",
      message: "Escribe la contrase\xF1a del panel."
    });
    return;
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    res.status(401).json({
      ok: false,
      error: "invalid_credentials",
      message: "La contrase\xF1a no es correcta."
    });
    return;
  }
  const session = createAdminToken();
  if (!session) {
    res.status(503).json({
      ok: false,
      error: "admin_disabled",
      message: "No se pudo crear la sesi\xF3n del panel. Revisa la configuraci\xF3n del servidor."
    });
    return;
  }
  res.json({ ok: true, token: session.token, expiresAt: session.expiresAt });
});
app.get("/api/admin/session", requireAdmin, (req, res) => {
  const header = req.header("authorization") ?? "";
  const token = header.split(" ")[1];
  const session = verifyAdminToken(token);
  res.json({
    ok: true,
    expiresAt: session ? new Date(session.exp).toISOString() : null,
    storage: storageMode()
  });
});
app.post("/api/admin/logout", requireAdmin, (_req, res) => {
  res.json({ ok: true, message: "Sesi\xF3n finalizada en este dispositivo." });
});
app.get("/api/admin/professionals", requireAdmin, async (_req, res) => {
  if (storageMode() === "memory") {
    res.json({ ok: true, storage: "memory", professionals: [] });
    return;
  }
  const professionals = await listDatabaseProfessionals();
  if (!professionals) {
    res.status(500).json({
      ok: false,
      error: "storage_error",
      message: "No pudimos leer los profesionales de Supabase. Revisa la configuraci\xF3n y los logs."
    });
    return;
  }
  res.json({ ok: true, storage: "supabase", professionals });
});
app.get("/api/admin/contact-requests", requireAdmin, async (_req, res) => {
  try {
    const { storage, requests } = await listContactRequests();
    res.json({ ok: true, storage, count: requests.length, requests });
  } catch (error) {
    console.error("[sereno] No se pudieron leer las solicitudes de contacto.", error);
    res.status(500).json({
      ok: false,
      error: "storage_error",
      message: "No pudimos leer las solicitudes de Supabase. Revisa la configuraci\xF3n y los logs del servidor."
    });
  }
});
app.post("/api/admin/professionals", requireAdmin, async (req, res) => {
  const parsed = professionalInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "validation_error",
      message: "Revisa los campos marcados antes de guardar el profesional.",
      fieldErrors: toFieldErrors(parsed.error)
    });
    return;
  }
  try {
    const professional = await createDatabaseProfessional(parsed.data);
    console.info(
      `[sereno] Profesional ${professional.slug} a\xF1adido al directorio (${professional.name}).`
    );
    res.status(201).json({ ok: true, professional });
  } catch (error) {
    if (error instanceof ProfessionalStorageNotConfiguredError) {
      res.status(503).json({
        ok: false,
        error: "storage_not_configured",
        message: error.message
      });
      return;
    }
    console.error("[sereno] No se pudo guardar el profesional.", error);
    res.status(500).json({
      ok: false,
      error: "storage_error",
      message: "No pudimos guardar el profesional en Supabase. Revisa la configuraci\xF3n y los logs."
    });
  }
});
app.delete("/api/admin/professionals/:slug", requireAdmin, async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  if (!slug) {
    res.status(400).json({ ok: false, error: "invalid_slug", message: "Slug no v\xE1lido." });
    return;
  }
  try {
    const deleted = await deleteDatabaseProfessional(slug);
    if (!deleted) {
      res.status(404).json({
        ok: false,
        error: "not_found",
        message: "Ese profesional ya no existe en la base de datos."
      });
      return;
    }
    console.info(`[sereno] Profesional ${slug} retirado del directorio.`);
    res.json({ ok: true, deleted: true });
  } catch (error) {
    if (error instanceof ProfessionalStorageNotConfiguredError) {
      res.status(503).json({
        ok: false,
        error: "storage_not_configured",
        message: error.message
      });
      return;
    }
    console.error("[sereno] No se pudo retirar el profesional.", error);
    res.status(500).json({
      ok: false,
      error: "storage_error",
      message: "No pudimos retirar el profesional de Supabase. Revisa la configuraci\xF3n y los logs."
    });
  }
});
app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, error: "not_found", message: "Ruta no encontrada." });
});
app.use((error, _req, res, _next) => {
  const isBodyError = typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed";
  if (isBodyError) {
    res.status(400).json({ ok: false, error: "invalid_json", message: "El cuerpo de la solicitud no es v\xE1lido." });
    return;
  }
  console.error("[sereno] Error inesperado en la API.", error);
  res.status(500).json({
    ok: false,
    error: "internal_error",
    message: "Ocurri\xF3 un error inesperado. Int\xE9ntalo de nuevo m\xE1s tarde."
  });
});

// server/vercel-entry.ts
var expressApp = app;
var handler = (req, res) => {
  try {
    expressApp(req, res);
  } catch (error) {
    console.error("[sereno] Error inesperado en la API de Vercel.", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error: "vercel_function_error",
          message: error instanceof Error ? error.message : String(error)
        })
      );
    }
  }
};
var vercel_entry_default = handler;
export {
  vercel_entry_default as default
};
