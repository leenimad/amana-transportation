import React from 'react';

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 leading-relaxed">
            {children}
        </p>
    </div>
);

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">About Amana Transportation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting communities with safe, reliable, and comfortable public transit since 2019.
          </p>
        </header>

        <main className="space-y-12">
          <InfoCard 
            title="Our Mission"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          >
            To provide a modern, efficient, and accessible public bus service that enhances the daily lives of Malaysian commuters. We are committed to punctuality, passenger comfort, and continuous innovation in urban mobility.
          </InfoCard>

          <InfoCard 
            title="Our History"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            Founded in Kuala Lumpur in 2019, Amana Transportation started with a vision to revolutionize city travel. Beginning with just a handful of routes, we have grown into a trusted network covering key areas, always focused on reliability and leveraging technology to improve our services.
          </InfoCard>

          <InfoCard 
            title="Our Values"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          >
            <strong>Safety First:</strong> Our highest priority is the safety of our passengers and staff.
            <br/>
            <strong>Customer-Centric:</strong> We listen to our riders and continuously strive to meet their needs.
            <br/>
            <strong>Integrity:</strong> We operate with transparency and accountability in all that we do.
          </InfoCard>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;