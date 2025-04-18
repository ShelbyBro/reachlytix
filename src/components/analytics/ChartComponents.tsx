
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ChartProps {
  data: any[];
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function AreaChartComponent({ data, width = "100%", height = 300, className }: ChartProps) {
  // Check if data has 'status' field - for email analytics time series
  const hasStatusField = data.length > 0 && 'status' in data[0];
  
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickFormatter={(value) => {
            // For date strings, try to shorten them
            if (typeof value === 'string' && value.includes('-')) {
              const dateParts = value.split('-');
              if (dateParts.length === 3) {
                return `${dateParts[1]}/${dateParts[2]}`;
              }
            }
            return value;
          }}
        />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString(), '']}
          labelFormatter={(label) => {
            // For date strings, format them nicely
            if (typeof label === 'string' && label.includes('-')) {
              const date = new Date(label);
              if (!isNaN(date.getTime())) {
                return new Intl.DateTimeFormat('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric'
                }).format(date);
              }
            }
            return label;
          }}
        />
        <Legend />
        
        {hasStatusField ? (
          // For email analytics with status field, render multiple areas
          <>
            <Area
              type="monotone"
              dataKey={(entry) => entry.status === 'delivered' ? entry.value || entry.count : 0}
              name="Delivered"
              stroke="#4ade80"
              fillOpacity={1}
              fill="url(#colorDelivered)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey={(entry) => entry.status === 'failed' ? entry.value || entry.count : 0}
              name="Failed"
              stroke="#f87171"
              fillOpacity={1}
              fill="url(#colorFailed)"
              stackId="1"
            />
          </>
        ) : (
          // For standard analytics
          <Area
            type="monotone"
            dataKey="emails"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorEmails)"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartComponent({ data, width = "100%", height = 300, className }: ChartProps) {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          height={50}
          tickFormatter={(value) => {
            // If value is too long, truncate
            if (value && value.length > 15) {
              return `${value.substring(0, 12)}...`;
            }
            return value;
          }}
        />
        <YAxis />
        <Tooltip formatter={(value: number) => [value.toLocaleString(), '']} />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({ data, width = "100%", height = 300, className }: ChartProps) {
  // Custom colors for different status types
  const COLORS = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa', '#8884D8'];

  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value.toLocaleString(), '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
