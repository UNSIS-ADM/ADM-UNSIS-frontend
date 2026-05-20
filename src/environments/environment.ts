export const environment = {
  production: true,
  // URL base del backend

  apiUrl: '', // Pon aquí el puerto real de tu backend (ej. 8080, 3000, 5000)
  
  // Endpoints (se mantienen igual, pero asegúrate de que el servicio 
  // en Angular los concatene correctamente con apiUrl)
  getalumnosEndpoint: '/api/applicants',
  loginEndpoint: '/auth/login',
  getresultadosEndpoint: '/api/admin/results',
  getresultmostrarEndpoint: '/api/applicant/me',
  postsecretariasEndpoint: '/auth/users',
  fichasdispiniblesEndpoint: '/api/admin/vacancies', // Agregué /api/ si es que tu backend lo requiere
  cambiodecarreraEndpoint: '/api/applicant',
  respuestasolicitudEndpoint: '/api/applicant/change-career/requests',
  accessRestrictionEndpoint: '/api/admin/access-restriction',
  getApplicantbyid: '/api/admin/applicants',
  getUsuariosEndpoint: '/api/admin/users',
  generatePdfEndpoint: '/api/admin/generate-pdf',
  uploadaplicants: '/api/admin/upload-applicants',
  available: '/api/admin/vacancies/available',
  uploadresults: '/api/admin/upload-results',
  vacantes: '/api/admin/vacancies',
  cambiocarrera: '/api/admin/change-career/requests',
  templates: '/api/templates',
};