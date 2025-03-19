import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: string;
  color?: string;
  subtext?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon = "bi-bar-chart",
  color = "primary",
  subtext
}) => {
  return (
    <Card className="mb-4 shadow-sm h-100 border border-gray-100 dark:border-dark-border dark:bg-dark-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2 dark:text-dark-text-secondary">{title}</h6>
            <h2 className={`mb-0 text-${color} dark:text-${color}`}>{value}</h2>
            {subtext && <small className="text-muted dark:text-dark-text-secondary">{subtext}</small>}
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded dark:bg-opacity-20`}>
            <i className={`bi ${icon} text-${color} fs-4 dark:text-${color}`}></i>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
