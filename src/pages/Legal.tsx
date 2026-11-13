import { Link } from 'react-router-dom'
import { LegalLayout } from '../components/LegalLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { SCREENINGS } from '../lib/screening'

export function Privacy() {
  usePageMeta({
    title: 'Política de privacidad',
    description:
      'Cómo Sereno trata los datos de contacto, los resultados de los tests y la información de salud en esta demostración.',
  })

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Política de privacidad"
      intro="Queremos que sepas qué datos tratamos, para qué y cómo puedes controlarlos. Esta política describe la demostración; antes de publicar debe adaptarse a la normativa aplicable en tu país."
      updatedAt="11 de noviembre de 2026"
    >
      <h2>1. Quiénes somos</h2>
      <p>
        Sereno es una plataforma de demostración de orientación y contacto con profesionales de
        salud mental. En esta versión no se presta atención clínica real. El responsable del
        tratamiento en producción deberá identificarse con su nombre legal, domicilio y datos de
        contacto, y designar un delegado de protección de datos cuando la ley lo exija.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <h3>Datos del formulario de contacto</h3>
      <ul>
        <li>Nombre, correo electrónico y, opcionalmente, teléfono.</li>
        <li>Rango de edad, país o ciudad y motivo de consulta.</li>
        <li>Mensaje libre que decidas escribir y preferencias de horario y modalidad.</li>
        <li>Fecha de la solicitud, referencia y estado de gestión.</li>
      </ul>
      <p>
        Algunos de estos datos pueden revelar información sobre tu salud, que es una categoría
        especialmente protegida. Por eso pedimos tu consentimiento explícito antes de enviar el
        formulario y te recomendamos no incluir detalles clínicos innecesarios.
      </p>

      <h3>Resultados de los tests</h3>
      <p>
        Los resultados y las respuestas de los tests de tamizaje se guardan únicamente en el
        almacenamiento local de tu navegador (<code>localStorage</code>). No se envían a nuestros
        servidores, no se asocian a tu identidad y puedes eliminarlos desde{' '}
        <Link to="/mi-progreso">Mi progreso</Link>. Si borras los datos de tu navegador o usas otro
        dispositivo, no podremos recuperarlos.
      </p>

      <h3>Datos técnicos</h3>
      <p>
        El proveedor de alojamiento puede registrar direcciones IP, fecha y hora de acceso, agente
        de usuario y errores técnicos con fines de seguridad y funcionamiento. En producción deben
        definirse los plazos de conservación y el tratamiento de registros.
      </p>
      <p>
        La referencia de tu última solicitud se guarda temporalmente en el almacenamiento de sesión
        de tu navegador para que siga visible si recargas la página de confirmación. Se elimina al
        cerrar la pestaña y no se comparte con terceros.
      </p>

      <h2>3. Para qué usamos los datos</h2>
      <ul>
        <li>Gestionar y responder a tu solicitud de primera conversación.</li>
        <li>Compartir con el profesional elegido la información necesaria para preparar el contacto.</li>
        <li>Enviar avisos operativos relacionados con tu solicitud.</li>
        <li>Prevenir abuso, spam y fraude, y mantener la seguridad del servicio.</li>
        <li>Cumplir obligaciones legales que sean aplicables.</li>
      </ul>
      <p>
        No vendemos tus datos ni los usamos para publicidad comportamental. Si en el futuro se
        incorporan analíticas o cookies no esenciales, se pedirá consentimiento y se detallará en
        esta política.
      </p>

      <h2>4. Base legal</h2>
      <p>
        En el Espacio Económico Europeo, el tratamiento se apoyaría en tu consentimiento explícito
        para datos de salud, la ejecución de una relación precontractual a tu solicitud y el interés
        legítimo en mantener la seguridad del servicio. En otras jurisdicciones deben identificarse
        las bases legales equivalentes.
      </p>

      <h2>5. Con quién compartimos datos</h2>
      <p>
        Los datos de la solicitud pueden compartirse con el profesional sanitario elegido y con
        proveedores tecnológicos que actúan como encargados del tratamiento, por ejemplo alojamiento,
        base de datos y envío de correo transaccional. Estos proveedores deben ofrecer garantías
        contractuales adecuadas y no pueden usar los datos para fines propios.
      </p>
      <p>
        En esta demostración, la persistencia opcional se realiza con Supabase
        (PostgreSQL) y las notificaciones por correo con Resend. Sin esas variables
        configuradas, la solicitud solo se conserva en memoria y en los registros del
        servidor durante la vida de la instancia.
      </p>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Algunos proveedores pueden tratar datos fuera de tu país. En producción deben existir
        mecanismos legales válidos para esas transferencias, como cláusulas contractuales tipo o
        decisiones de adecuación, y una evaluación de impacto cuando corresponda.
      </p>

      <h2>7. Conservación</h2>
      <p>
        Las solicitudes de contacto se conservan el tiempo necesario para gestionarlas y atender
        posibles responsabilidades legales. En la implementación de referencia se aplica una
        caducidad de 180 días en la base de datos, que debe revisarse según la normativa local. Los
        resultados de los tests permanecen en tu dispositivo hasta que los borres.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas razonables: cifrado en tránsito mediante HTTPS, validación de
        datos en cliente y servidor, limitación de solicitudes y minimización de la información
        recogida. Ningún sistema es infalible. Si se produce una brecha que afecte a tus derechos,
        se notificará según los plazos legales aplicables.
      </p>

      <h2>9. Tus derechos</h2>
      <p>
        Según tu jurisdicción, puedes tener derecho a acceder, rectificar o suprimir tus datos,
        oponerte o limitar su tratamiento, retirar tu consentimiento y solicitar la portabilidad.
        Para ejercerlos, escribe al canal de contacto que se habilite en producción. También puedes
        reclamar ante la autoridad de protección de datos de tu país.
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        El servicio está pensado para personas adultas. El formulario permite indicar «menor de 18
        años» únicamente para orientar el caso, pero en producción no se debe tratar una solicitud de
        un menor sin la intervención y el consentimiento de su tutor legal, y sin evaluar la
        idoneidad del servicio.
      </p>

      <h2>11. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o técnicos. Publicaremos la
        fecha de la última revisión y, cuando los cambios sean sustanciales, informaremos por los
        canales habituales.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Para dudas sobre privacidad, en producción debe existir una dirección de correo dedicada y,
        cuando sea obligatorio, un delegado de protección de datos. Esta demostración no recoge
        solicitudes reales de ejercicio de derechos.
      </p>
    </LegalLayout>
  )
}

export function Terms() {
  usePageMeta({
    title: 'Términos de uso',
    description:
      'Condiciones de uso de la plataforma de demostración Sereno: naturaleza del servicio, límites, responsabilidades y contacto.',
  })

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Términos de uso"
      intro="Estas condiciones explican qué es Sereno, qué no es y qué puedes esperar de esta demostración. Al usar el sitio, aceptas estos términos en su versión vigente."
      updatedAt="11 de noviembre de 2026"
    >
      <h2>1. Naturaleza del servicio</h2>
      <p>
        Sereno es una plataforma de demostración que muestra cómo podría funcionar un servicio de
        orientación y contacto con profesionales de salud mental. No es un centro sanitario, no
        presta atención clínica, no emite diagnósticos ni receta medicamentos. Los perfiles
        profesionales incluidos son ficticios y están marcados como datos de muestra.
      </p>

      <h2>2. No es un servicio de emergencias</h2>
      <p>
        Sereno no monitoriza mensajes en tiempo real ni atiende urgencias. Si tú o alguien está en
        peligro inmediato, llama al número de emergencias de tu país o acude al servicio de
        urgencias más cercano. Consulta las <Link to="/crisis">líneas de crisis</Link>.
      </p>

      <h2>3. Tests de tamizaje</h2>
      <p>
        Los tests disponibles son instrumentos de tamizaje autoadministrados. Ayudan a orientar
        sobre la presencia e intensidad de ciertos síntomas, pero no sustituyen una evaluación
        clínica, no confirman ni descartan diagnósticos y pueden verse afectados por el contexto, la
        salud física, el sueño o la interpretación de las preguntas. Lee el{' '}
        <Link to="/aviso-medico">aviso médico</Link> antes de utilizarlos.
      </p>

      <h2>4. Uso permitido</h2>
      <ul>
        <li>Usar el sitio para informarte y, en producción, solicitar orientación profesional.</li>
        <li>Aportar información veraz y no suplantar la identidad de otra persona.</li>
        <li>No intentar acceder a datos de terceros, alterar el servicio ni automatizar solicitudes abusivas.</li>
        <li>No usar el contenido para diagnosticar o tratar a otras personas sin cualificación.</li>
      </ul>

      <h2>5. Profesionales y verificación</h2>
      <p>
        En producción, la publicación de un perfil requerirá verificar identidad, titulación,
        licencia o registro profesional vigente, experiencia y estado ético, con revisión periódica.
        La plataforma debe informar con claridad del alcance de esa verificación y de cualquier
        limitación. Salvo que se indique lo contrario, Sereno no garantiza resultados terapéuticos.
      </p>

      <h2>6. Precios y pagos</h2>
      <p>
        Los precios mostrados en esta demostración son orientativos, en dólares estadounidenses y
        por sesión de 50 minutos. No se realiza ningún cobro al enviar el formulario. En un servicio
        real, las tarifas, la duración, la política de cancelación y los impuestos deben mostrarse
        antes de contratar y procesarse por pasarelas seguras.
      </p>

      <h2>7. Contenido y propiedad intelectual</h2>
      <p>
        El diseño, los textos y el código de esta demostración se ofrecen como base de trabajo. Los
        instrumentos de tamizaje citados pertenecen a sus autores y se usan con fines de
        demostración. Antes de un uso comercial, revisa las condiciones de licencia de cada
        instrumento y de las traducciones que utilices.
      </p>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        En la medida permitida por la ley, Sereno no será responsable de decisiones tomadas a partir
        de esta demostración ni de daños derivados de un uso distinto al previsto. Nada en estos
        términos excluye responsabilidades que no puedan limitarse legalmente, en particular las
        relacionadas con la salud o el consumo.
      </p>

      <h2>9. Enlaces externos</h2>
      <p>
        El sitio puede enlazar a recursos de terceros, como líneas de crisis o fuentes científicas.
        No controlamos esos sitios y no respondemos por su contenido, disponibilidad o políticas de
        privacidad.
      </p>

      <h2>10. Cambios y legislación aplicable</h2>
      <p>
        Podemos modificar estos términos. La versión vigente será la publicada en esta página. En
        producción deben indicarse la legislación aplicable, el fuero competente y los mecanismos de
        resolución de conflictos, con revisión de un abogado local.
      </p>
    </LegalLayout>
  )
}

export function MedicalDisclaimer() {
  usePageMeta({
    title: 'Aviso médico',
    description:
      'Qué son los tests de tamizaje, qué no pueden hacer, sus limitaciones y por qué consultar a un psicólogo o psiquiatra es importante.',
  })

  return (
    <LegalLayout
      eyebrow="Salud y transparencia"
      title="Aviso médico"
      intro="Los tests de Sereno son herramientas de orientación, no diagnósticos. Este aviso explica qué miden, cuáles son sus límites y por qué una conversación con un profesional sigue siendo el paso más importante."
      updatedAt="11 de noviembre de 2026"
    >
      <h2>1. Un test no es un diagnóstico</h2>
      <p>
        Un diagnóstico de salud mental requiere una evaluación clínica individual. Un profesional
        explora tus síntomas, su duración, tu historia, tu contexto, otras condiciones médicas y
        los factores que pueden explicar lo que sientes. Un cuestionario autoadministrado no puede
        hacer ese trabajo.
      </p>
      <p>
        Por eso los resultados de Sereno se presentan siempre como orientativos. Un puntaje alto no
        confirma un trastorno y un puntaje bajo no descarta que necesites apoyo. Los rangos son
        referencias poblacionales, no etiquetas personales.
      </p>

      <h2>2. Qué miden los instrumentos</h2>
      <div className="not-prose my-5 space-y-3">
        {SCREENINGS.map((screening) => (
          <div
            key={screening.id}
            className="rounded-2xl border border-forest-900/10 bg-cream-100/60 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-[0.68rem] font-semibold text-forest-700">
                {screening.shortName}
              </span>
              <span className="text-[0.72rem] text-muted">
                {screening.category} · {screening.timeframe}
              </span>
            </div>
            <p className="mt-2 text-[0.8rem] leading-6 text-muted">{screening.description}</p>
            <p className="mt-2 text-[0.7rem] leading-5 text-muted/85">{screening.citation}</p>
          </div>
        ))}
      </div>

      <h2>3. Limitaciones que debes conocer</h2>
      <ul>
        <li>
          <strong>No descartan otras causas.</strong> Problemas de tiroides, anemia, falta de sueño,
          duelo, medicamentos o consumo de sustancias pueden producir síntomas parecidos.
        </li>
        <li>
          <strong>Dependen de tu interpretación.</strong> Las preguntas son autorreportadas y pueden
          entenderse de forma distinta según el contexto cultural o el momento vital.
        </li>
        <li>
          <strong>Son una foto reciente.</strong> Preguntan por las últimas dos semanas. No capturan
          tu historia completa ni tu funcionamiento diario.
        </li>
        <li>
          <strong>No sustituyen una entrevista.</strong> La alianza terapéutica, la observación
          clínica y el juicio profesional son parte esencial de cualquier evaluación.
        </li>
        <li>
          <strong>Las traducciones deben validarse.</strong> Aunque las versiones en español son
          utilizadas, antes de un uso clínico formal se recomienda revisar la adaptación con
          profesionales y las licencias correspondientes.
        </li>
      </ul>

      <h2>4. Por qué consultar a un psicólogo o psiquiatra</h2>
      <p>
        Un profesional puede ayudarte a entender qué está pasando, descartar otras causas, definir
        objetivos realistas y proponer un plan basado en evidencia. También puede valorar riesgos,
        coordinar con otros especialistas y ajustar el tratamiento con el tiempo. Pedir ayuda antes
        de que el malestar sea insoportable suele ser más fácil que esperar.
      </p>
      <p>
        Si tus síntomas afectan tu trabajo, tus estudios, tus relaciones o tu capacidad de cuidarte,
        o si duran semanas, una evaluación profesional está indicada. No necesitas un diagnóstico
        previo ni saber qué especialidad elegir.
      </p>

      <h2>5. Situaciones urgentes</h2>
      <p>
        Si tienes pensamientos de hacerte daño, de que estarías mejor muerto/a o de dañar a otra
        persona, o si sientes que no puedes mantenerte a salvo, busca ayuda inmediata. Llama al
        número de emergencias de tu país o a una línea de crisis. Sereno no atiende urgencias ni
        monitoriza mensajes en tiempo real.
      </p>
      <p>
        <Link to="/crisis" className="font-semibold">
          Ver líneas de ayuda por país
        </Link>
        .
      </p>

      <h2>6. Medicación</h2>
      <p>
        Ningún test de esta plataforma indica si necesitas medicación. Solo un médico psiquiatra
        puede prescribir y supervisar psicofármacos tras una evaluación. No inicies, suspendas ni
        modifiques un tratamiento por tu cuenta.
      </p>

      <h2>7. Fuentes y verificación</h2>
      <p>
        Las referencias de cada instrumento aparecen en su ficha y en el resultado del test. Los
        números de las líneas de crisis deben verificarse periódicamente con la fuente oficial de
        cada país. Si detectas un error, en producción debe existir un canal para reportarlo.
      </p>

      <h2>8. Resumen</h2>
      <p>
        Los tests pueden ayudarte a poner en palabras lo que sientes y a decidir si conviene
        consultar. No pueden diagnosticarte ni reemplazar a un profesional. Si algo te preocupa, el
        mejor siguiente paso es hablar con un psicólogo/a o psiquiatra.
      </p>
    </LegalLayout>
  )
}
