import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

const dateFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });

function formatDate(isoDate) {
  // "2026-11-14" -> data locale, senza slittamenti di fuso orario
  const [year, month, day] = isoDate.split('-').map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

export default function ApplicationCard({ application, index, onOpen }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const notesId = `notes-${application.id}`;

  return (
    <Draggable draggableId={String(application.id)} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card${snapshot.isDragging ? ' card--dragging' : ''}`}
          onClick={() => onOpen(application)}
          onKeyDown={(event) => {
            // Invio apre la card; Spazio resta alla libreria per il drag da tastiera
            if (event.key === 'Enter') onOpen(application);
            else provided.dragHandleProps?.onKeyDown?.(event);
          }}
        >
          <h3 className="card__company">{application.company}</h3>
          <p className="card__role">{application.role}</p>
          {application.appliedAt && (
            <p className="card__meta">Inviata il {formatDate(application.appliedAt)}</p>
          )}
          {application.notes && (
            <>
              <button
                className={`card__toggle${notesOpen ? ' card__toggle--open' : ''}`}
                type="button"
                aria-expanded={notesOpen}
                aria-controls={notesId}
                onClick={(event) => {
                  event.stopPropagation(); // non aprire la finestra di modifica
                  setNotesOpen((open) => !open);
                }}
                onKeyDown={(event) => event.stopPropagation()} // Invio/Spazio restano al pulsante
              >
                <span className="card__chevron" aria-hidden="true" />
                {notesOpen ? 'Nascondi note' : 'Mostra note'}
              </button>
              {notesOpen && (
                <p className="card__notes" id={notesId}>
                  {application.notes}
                </p>
              )}
            </>
          )}
        </article>
      )}
    </Draggable>
  );
}
