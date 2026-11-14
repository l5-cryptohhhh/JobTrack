// Gli id corrispondono all'enum ApplicationStatus del backend.
export const STATUSES = [
  { id: 'WISHLIST', label: 'Da inviare', empty: 'Salva qui gli annunci che ti interessano.' },
  { id: 'APPLIED', label: 'Inviate', empty: 'Trascina qui una candidatura quando la invii.' },
  { id: 'INTERVIEW', label: 'Colloquio', empty: 'Qui finiscono le aziende che ti richiamano.' },
  { id: 'OFFER', label: 'Offerta', empty: 'Le offerte ricevute compaiono qui.' },
  { id: 'REJECTED', label: 'Chiuse', empty: 'Le candidature andate male o ritirate.' },
];

export const EMPTY_FORM = {
  company: '',
  role: '',
  url: '',
  status: 'WISHLIST',
  appliedAt: '',
  notes: '',
  jobDescription: '',
};
