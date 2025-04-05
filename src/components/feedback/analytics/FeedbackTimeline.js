// src/components/feedback/analytics/FeedbackTimeline.js
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar as CalendarIcon, 
  LineChart, 
  PieChart as PieChartIcon, 
  ArrowRight, 
  ArrowLeft 
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FeedbackTimeline = ({ responseData }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [metric, setMetric] = useState('responses');
  const [currentPeriod, setCurrentPeriod] = useState(0); // 0 = current period, -1 = previous, etc.
  
  // Function to get the current data set based on time range and period
  const getCurrentData = () => {
    if (!responseData || !responseData[timeRange]) {
      return [];
    }
    
    // Get data for the current period
    return responseData[timeRange][metric][currentPeriod] || [];
  };
  
  // Get data for comparison (previous period)
  const getPreviousData = () => {
    if (!responseData || !responseData[timeRange]) {
      return [];
    }
    
    // Get data for the previous period
    return responseData[timeRange][metric][currentPeriod - 1] || [];
  };

  // Calculate period change percentage
  const calculateChange = () => {
    const currentTotal = getCurrentData().reduce((sum, item) => sum + item.value, 0);
    const previousTotal = getPreviousData().reduce((sum, item) => sum + item.value, 0);
    
    if (previousTotal === 0) return 100; // If previous was 0, it's a 100% increase
    
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };
  
  // Get period label
  const getPeriodLabel = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        // Format: "Week of January 1, 2025"
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (currentPeriod * 7));
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        
      case 'month':
        // Format: "January 2025"
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() + currentPeriod);
        return monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
      case 'quarter':
        // Format: "Q1 2025"
        const quarterDate = new Date(now);
        quarterDate.setMonth(now.getMonth() + (currentPeriod * 3));
        const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
        return `Q${quarter} ${quarterDate.getFullYear()}`;
        
      case 'year':
        // Format: "2025"
        const yearDate = new Date(now);
        yearDate.setFullYear(now.getFullYear() + currentPeriod);
        return yearDate.getFullYear().toString();
        
      default:
        return 'Current Period';
    }
  };
  
  // Function to navigate periods
  const navigatePeriod = (direction) => {
    setCurrentPeriod(currentPeriod + direction);
  };
  
  // Prepare data for comparison chart
  const prepareComparisonData = () => {
    const currentData = getCurrentData();
    const previousData = getPreviousData();
    
    // Create merged dataset with both current and previous period
    return currentData.map((item, index) => {
      const previousValue = previousData[index] ? previousData[index].value : 0;
      
      return {
        name: item.name,
        current: item.value,
        previous: previousValue
      };
    });
  };

  // Get metric label
  const getMetricLabel = () => {
    switch (metric) {
      case 'responses':
        return 'Responses';
      case 'ratings':
        return 'Average Rating';
      case 'completion':
        return 'Completion Rate (%)';
      default:
        return 'Value';
    }
  };

  // Render appropriate chart based on metric
  const renderChart = () => {
    const data = getCurrentData();
    const comparisonData = prepareComparisonData();
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available for this period
        </div>
      );
    }
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {timeRange === 'day' || metric === 'ratings' ? (
            // Line chart for daily data or rating metrics
            <RechartsLineChart
              data={comparisonData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="current" 
                name={`Current ${getMetricLabel()}`}
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="previous" 
                name={`Previous ${getMetricLabel()}`}
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            </RechartsLineChart>
          ) : (
            // Area chart for responses over time
            <AreaChart
              data={comparisonData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="current" 
                name={`Current ${getMetricLabel()}`}
                fill="#8884d8" 
                stroke="#8884d8"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="previous" 
                name={`Previous ${getMetricLabel()}`}
                fill="#82ca9d" 
                stroke="#82ca9d"
                fillOpacity={0.3}
                strokeDasharray="5 5"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const change = calculateChange();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback Timeline</CardTitle>
              <CardDescription>
                Track responses and ratings over time
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responses">Response Count</SelectItem>
                  <SelectItem value="ratings">Average Rating</SelectItem>
                  <SelectItem value="completion">Completion Rate</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">{getPeriodLabel()}</h3>
              <div className="flex items-center mt-1">
                <div className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </div>
                <span className="text-sm text-gray-500 ml-2">vs previous period</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigatePeriod(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant={currentPeriod === 0 ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setCurrentPeriod(0)}
                disabled={currentPeriod === 0}
              >
                Current
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigatePeriod(1)}
                disabled={currentPeriod >= 0}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {renderChart()}
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Total Responses</div>
                <div className="text-2xl font-bold">
                  {getCurrentData().reduce((sum, item) => sum + (item.responses || item.value || 0), 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Average Rating</div>
                <div className="text-2xl font-bold">
                  {responseData.averageRatings && responseData.averageRatings[timeRange]
                    ? responseData.averageRatings[timeRange][currentPeriod]?.toFixed(1) || 'N/A'
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
                <div className="text-2xl font-bold">
                  {responseData.completionRates && responseData.completionRates[timeRange]
                    ? `${responseData.completionRates[timeRange][currentPeriod]?.toFixed(1) || 'N/A'}%`
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackTimeline;