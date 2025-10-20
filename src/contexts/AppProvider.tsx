import { ReactNode } from 'react';
import { ContactsProvider } from './ContactsContext';
import { ProjectsProvider } from './ProjectsContext';
import { TasksProvider } from './TasksContext';
import { EventsProvider } from './EventsContext';
import { ResourcesProvider } from './ResourcesContext';
import { CrewAvailabilityProvider } from './CrewAvailabilityContext';
import { ClientPortalProvider } from './ClientPortalContext';
import { AssetsProvider } from './AssetsContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ContactsProvider>
      <ProjectsProvider>
        <TasksProvider>
          <EventsProvider>
            <ResourcesProvider>
              <CrewAvailabilityProvider>
                <ClientPortalProvider>
                  <AssetsProvider>
                    {children}
                  </AssetsProvider>
                </ClientPortalProvider>
              </CrewAvailabilityProvider>
            </ResourcesProvider>
          </EventsProvider>
        </TasksProvider>
      </ProjectsProvider>
    </ContactsProvider>
  );
}
