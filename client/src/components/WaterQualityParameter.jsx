import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Droplet } from "lucide-react";
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';
import { formatIndianDateTime } from '@/utils/dateFormat';

export function WaterQualityParameter({ parameterData, stations, selectedStation }) {
  const [activeParameter, setActiveParameter] = useState('pH');
  const parameters = ['pH', 'temperature', 'ec', 'tds', 'turbidity'];

  const getParameterStatus = (value, parameter) => {
    const standards = WATER_QUALITY_STANDARDS[parameter];
    if (value < standards.min) return 'low';
    if (value > standards.max) return 'high';
    return 'normal';
  };

  const getSolution = (value, parameter) => {
    const status = getParameterStatus(value, parameter);
    const standards = WATER_QUALITY_STANDARDS[parameter];
    return status === 'normal' ? 'Parameters are within acceptable range' :
           status === 'low' ? standards.lowSolution : standards.highSolution;
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Water Quality Parameters</h2>
        <Select value={activeParameter} onValueChange={setActiveParameter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select parameter" />
          </SelectTrigger>
          <SelectContent>
            {parameters.map(param => (
              <SelectItem key={param} value={param}>
                {param.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {/* Parameter Value Card */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{activeParameter.toUpperCase()}</h3>
            <Droplet className="h-6 w-6 text-blue-500 animate-bounce" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {parameterData[activeParameter]?.toFixed(2)}
            {activeParameter === 'temperature' ? '°C' : ''}
          </div>
          <div className="flex items-center gap-2">
            {getParameterStatus(parameterData[activeParameter], activeParameter) === 'normal' ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <AlertTriangle className="text-yellow-500" />
            )}
            <span className="text-sm">
              Range: {WATER_QUALITY_STANDARDS[activeParameter].min} - 
              {WATER_QUALITY_STANDARDS[activeParameter].max}
            </span>
          </div>
        </Card>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={parameterData.history || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => formatIndianDateTime(value)}
              />
              <YAxis domain={[
                WATER_QUALITY_STANDARDS[activeParameter].min - 1,
                WATER_QUALITY_STANDARDS[activeParameter].max + 1
              ]} />
              <Tooltip 
                labelFormatter={(value) => formatIndianDateTime(value)}
                formatter={(value) => [
                  `${value.toFixed(2)}${activeParameter === 'temperature' ? '°C' : ''}`,
                  activeParameter.toUpperCase()
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={activeParameter}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Solutions Card */}
        <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold mb-2">Analysis & Solutions</h3>
          <p className="text-sm text-gray-700">
            {getSolution(parameterData[activeParameter], activeParameter)}
          </p>
          {selectedStation && (
            <p className="text-sm text-blue-600 mt-2">
              Specific to: {stations.find(s => s._id === selectedStation)?.stationName}
            </p>
          )}
        </Card>
      </div>

      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
    </Card>
  );
}