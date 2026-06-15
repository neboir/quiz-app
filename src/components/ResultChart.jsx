import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultChart({ correct, wrong, blank }) {
  const data = {
    labels: ['Đúng', 'Sai', 'Bỏ trống'],
    datasets: [
      {
        data: [correct, wrong, blank],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(148, 163, 184, 0.85)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(148, 163, 184, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { family: 'Inter', size: 13, weight: '600' },
          color: 'var(--text-secondary)',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = correct + wrong + blank;
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.parsed} câu (${pct}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
