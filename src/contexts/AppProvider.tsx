import { ReactNode } from 'react';
import { ContactsProvider } from './ContactsContext';
import { ProjectsProvider } from './ProjectsContext';
import { TasksProvider } from './TasksContext';
import { EventsProvider } from './EventsContext';
import { ResourcesProvider } from './ResourcesContext';
import { CrewAvailabilityProvider } from './CrewAvailabilityContext';
import { ClientPortalProvider } from './ClientPortalContext';
import { ClientAuthProvider } from './ClientAuthContext';
import { AssetsProvider } from './AssetsContext';
import { AccountingProvider } from './AccountingContext';
import { TeamProvider } from './TeamContext';
import { ProposalsProvider } from './ProposalsContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ClientAuthProvider>
      <ContactsProvider>
        <ProjectsProvider>
          <TasksProvider>
            <EventsProvider>
              <ResourcesProvider>
                <CrewAvailabilityProvider>
                  <ClientPortalProvider>
                    <AssetsProvider>
                      <AccountingProvider>
                        <TeamProvider>
                          <ProposalsProvider>
                            {children}
                          </ProposalsProvider>
                        </TeamProvider>
                      </AccountingProvider>
                    </AssetsProvider>
                  </ClientPortalProvider>
                </CrewAvailabilityProvider>
              </ResourcesProvider>
            </EventsProvider>
          </TasksProvider>
        </ProjectsProvider>
      </ContactsProvider>
    </ClientAuthProvider>
  );
}
