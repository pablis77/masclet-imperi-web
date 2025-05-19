import React from 'react';
import { Chart } from 'react-chartjs-2';

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard title="Total Animales" />
      <GenderDistributionChart />
      <AlleteringStatusChart />
      <RecentActivityList />
    </div>
  );
};