import { Droppable } from '@hello-pangea/dnd';
import ApplicationCard from './ApplicationCard.jsx';

export default function Column({ status, applications, filtered, onOpen }) {
  return (
    <section className="column" data-status={status.id} aria-label={status.label}>
      <header className="column__header">
        <h2 className="column__title">{status.label}</h2>
        <span className="column__count">{applications.length}</span>
      </header>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column__list${snapshot.isDraggingOver ? ' column__list--over' : ''}`}
          >
            {applications.map((application, index) => (
              <ApplicationCard
                key={application.id}
                application={application}
                index={index}
                onOpen={onOpen}
              />
            ))}
            {provided.placeholder}
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <p className="column__empty">{filtered ? 'Nessun risultato.' : status.empty}</p>
            )}
          </div>
        )}
      </Droppable>
    </section>
  );
}
