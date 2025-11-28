import { ReactNode } from 'react';
import { ContactsProvider } from './ContactsContext';
import { ProjectsProvider } from './ProjectsContext';
import { TasksProvider } from './TasksContext';
// ❌ DISABLED: EventsProvider uses Supabase - need to migrate to backend API
// import { EventsProvider } from './EventsContext';
// ❌ DISABLED: Still using Supabase, no backend API yet
// import { ResourcesProvider } from './ResourcesContext';
// import { CrewAvailabilityProvider } from './CrewAvailabilityContext';
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
            {/* ❌ DISABLED: EventsProvider uses Supabase - need to migrate to backend API */}
            {/* <EventsProvider> */}
              {/* ❌ DISABLED: Supabase providers removed - no backend API yet */}
              {/* <ResourcesProvider> */}
              {/*   <CrewAvailabilityProvider> */}
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
              {/*   </CrewAvailabilityProvider> */}
              {/* </ResourcesProvider> */}
            {/* </EventsProvider> */}
          </TasksProvider>
        </ProjectsProvider>
      </ContactsProvider>
    </ClientAuthProvider>
  );
}
