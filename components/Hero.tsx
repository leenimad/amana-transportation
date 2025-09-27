import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-green-600 text-white text-center py-12 shadow-inner">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold">Amana Transportation</h1>
        <p className="mt-2 text-lg md:text-xl text-white">Proudly Servicing Malaysian Bus Riders Since 2019!</p>
      </div>
    </section>
  );
};

export default Hero;
