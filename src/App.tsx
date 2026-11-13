import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RootLayout } from './components/Layout'

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const Directory = lazy(() =>
  import('./pages/Directory').then((module) => ({ default: module.Directory })),
)
const ProfessionalProfile = lazy(() =>
  import('./pages/ProfessionalProfile').then((module) => ({
    default: module.ProfessionalProfile,
  })),
)
const ContactRequestPage = lazy(() =>
  import('./pages/ContactRequestPage').then((module) => ({
    default: module.ContactRequestPage,
  })),
)
const RequestReceived = lazy(() =>
  import('./pages/RequestReceived').then((module) => ({ default: module.RequestReceived })),
)
const TestsIndex = lazy(() =>
  import('./pages/TestsIndex').then((module) => ({ default: module.TestsIndex })),
)
const TestPage = lazy(() =>
  import('./pages/TestPage').then((module) => ({ default: module.TestPage })),
)
const Progress = lazy(() =>
  import('./pages/Progress').then((module) => ({ default: module.Progress })),
)
const Crisis = lazy(() => import('./pages/Crisis').then((module) => ({ default: module.Crisis })))
const Privacy = lazy(() => import('./pages/Legal').then((module) => ({ default: module.Privacy })))
const Terms = lazy(() => import('./pages/Legal').then((module) => ({ default: module.Terms })))
const MedicalDisclaimer = lazy(() =>
  import('./pages/Legal').then((module) => ({ default: module.MedicalDisclaimer })),
)
const NotFound = lazy(() =>
  import('./pages/NotFound').then((module) => ({ default: module.NotFound })),
)

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="profesionales" element={<Directory />} />
        <Route path="profesionales/:slug" element={<ProfessionalProfile />} />
        <Route path="solicitar/:slug" element={<ContactRequestPage />} />
        <Route path="solicitud-recibida" element={<RequestReceived />} />
        <Route path="tests" element={<TestsIndex />} />
        <Route path="tests/:testId" element={<TestPage />} />
        <Route path="mi-progreso" element={<Progress />} />
        <Route path="crisis" element={<Crisis />} />
        <Route path="privacidad" element={<Privacy />} />
        <Route path="terminos" element={<Terms />} />
        <Route path="aviso-medico" element={<MedicalDisclaimer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
