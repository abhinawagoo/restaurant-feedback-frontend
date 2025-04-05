// src/app/admin/feedback/analytics/[formId]/questions/[questionId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BarChart2, MessageSquare, AlertTriangle, CalendarRange, Download } from "lucide-react";
import { feedbackService } from "@/lib/api";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Sector,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from &apos;recharts&apos;;

export default function QuestionAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const { formId, questionId } = params;

  useEffect(() => {
    async function loadQuestionAnalytics() {
      try {
        setLoading(true);
        
        // Load question data
        const questionResponse = await feedbackService.getQuestion(questionId);
        setQuestion(questionResponse.data.data);
        
        // Load question analytics
        const analyticsResponse = await feedbackService.getQuestionAnalytics(questionId);
        setAnalytics(analyticsResponse.data.data);
        
        // Load responses for this question
        const responsesResponse = await feedbackService.getQuestionResponses(questionId, { page: 1, limit: 100 });
        setResponses(responsesResponse.data.data);
      } catch (error) {
        console.error("Error loading question analytics", error);
        toast.error("Failed to load question analytics");
      } finally {
        setLoading(false);
      }
    }

    loadQuestionAnalytics();
  }, [questionId]);

  // Filter responses based on search term
  const filteredResponses = responses.filter(response => {
    if (!searchTerm) return true;
    
    // Search in response text (for text questions)
    if (response.value && typeof response.value === &apos;string&apos;) {
      return response.value.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Search in customer info
    if (response.customer) {
      const nameMatch = response.customer.name && 
        response.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = response.customer.email && 
        response.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch;
    }
    
    return false;
  });

  // Render appropriate visualization based on question type
  const renderVisualization = () => {
    if (!analytics || !analytics.data) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }
    
    switch (question.type) {
      case &apos;rating&apos;:
        return renderRatingVisualization();
      case &apos;multiplechoice&apos;:
      case &apos;checkbox&apos;:
      case &apos;dropdown&apos;:
        return renderChoiceVisualization();
      case &apos;text&apos;:
        return renderTextAnalysis();
      default:
        return <div className="text-center py-8 text-gray-500">Visualization not available for this question type</div>;
    }
  };
  
  // Render rating visualization
  const renderRatingVisualization = () => {
    const { data } = analytics;
    
    // Format data for chart
    const chartData = Object.entries(data.distribution || {}).map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: (count / data.total) * 100
    })).sort((a, b) => a.rating - b.rating);
    
    const COLORS = [&apos;#FF8042&apos;, &apos;#FFBB28&apos;, &apos;#00C49F&apos;, &apos;#0088FE&apos;, &apos;#8884d8&apos;];
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Average Rating</div>
              <div className="text-4xl font-bold">{data.average?.toFixed(1) || &apos;N/A&apos;}</div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(data.average || 0)
                        ? &apos;text-yellow-400&apos;
                        : &apos;text-gray-300&apos;
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Total Responses</div>
              <div className="text-4xl font-bold">{data.total || 0}</div>
              <div className="text-sm text-gray-500 mt-2">
                From {analytics.firstResponseDate || &apos;N/A&apos;} to {analytics.lastResponseDate || &apos;N/A&apos;}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Most Common Rating</div>
              <div className="text-4xl font-bold">{data.mode || &apos;N/A&apos;}</div>
              <div className="text-sm text-gray-500 mt-2">
                Given by {data.distribution && data.distribution[data.mode] || 0} respondents
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>
                Breakdown of ratings from {data.total || 0} responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, &apos;Count&apos;]}
                      labelFormatter={(label) => `Rating: ${label}`}
                    />
                    <Bar dataKey="count" name="Responses" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rating Trend</CardTitle>
              <CardDescription>
                Average rating over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.trendData || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip 
                      formatter={(value) => [value.toFixed(1), &apos;Average Rating&apos;]}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render choice visualization (multiple choice, checkbox, dropdown)
  const renderChoiceVisualization = () => {
    const { data } = analytics;
    
    if (!data.distribution) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }
    
    // Format data for charts
    const chartData = Object.entries(data.distribution).map(([option, count]) => ({
      option,
      count,
      percentage: (count / data.total) * 100
    })).sort((a, b) => b.count - a.count);
    
    const COLORS = [&apos;#0088FE&apos;, &apos;#00C49F&apos;, &apos;#FFBB28&apos;, &apos;#FF8042&apos;, &apos;#8884d8&apos;, &apos;#83a6ed&apos;, &apos;#8dd1e1&apos;, &apos;#a4de6c&apos;];
    
    // Active shape for pie chart
    const renderActiveShape = (props) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, count } = props;
      const sin = Math.sin(-midAngle * Math.PI / 180);
      const cos = Math.cos(-midAngle * Math.PI / 180);
      const sx = cx + (outerRadius + 10) * cos;
      const sy = cy + (outerRadius + 10) * sin;
      const mx = cx + (outerRadius + 30) * cos;
      const my = cy + (outerRadius + 30) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? &apos;start&apos; : &apos;end&apos;;
    
      return (
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
            {`${payload.option}`}
          </text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
            {`${count} (${(percent * 100).toFixed(1)}%)`}
          </text>
        </g>
      );
    };
    
    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Total Responses</div>
              <div className="text-4xl font-bold">{data.total || 0}</div>
              <div className="text-sm text-gray-500 mt-2">
                From {analytics.firstResponseDate || &apos;N/A&apos;} to {analytics.lastResponseDate || &apos;N/A&apos;}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Most Popular Choice</div>
              <div className="text-2xl font-bold truncate">{chartData[0]?.option || &apos;N/A&apos;}</div>
              <div className="text-sm text-gray-500 mt-2">
                Selected by {chartData[0]?.count || 0} respondents ({chartData[0]?.percentage.toFixed(1) || 0}%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Least Popular Choice</div>
              <div className="text-2xl font-bold truncate">{chartData[chartData.length - 1]?.option || &apos;N/A&apos;}</div>
              <div className="text-sm text-gray-500 mt-2">
                Selected by {chartData[chartData.length - 1]?.count || 0} respondents ({chartData[chartData.length - 1]?.percentage.toFixed(1) || 0}%)
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Distribution</CardTitle>
              <CardDescription>
                Breakdown of responses from {data.total || 0} submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      onMouseEnter={onPieEnter}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Percentage</CardTitle>
              <CardDescription>
                Percentage breakdown of each option
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-sm truncate max-w-[200px]">{item.option}</span>
                      </div>
                      <span className="text-sm">{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render text analysis
  const renderTextAnalysis = () => {
    const { data } = analytics;
    
    if (!data.responses || data.responses.length === 0) {
      return <div className="text-center py-8 text-gray-500">No text responses yet</div>;
    }
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Total Responses</div>
              <div className="text-4xl font-bold">{data.total || 0}</div>
              <div className="text-sm text-gray-500 mt-2">
                From {analytics.firstResponseDate || &apos;N/A&apos;} to {analytics.lastResponseDate || &apos;N/A&apos;}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Average Length</div>
              <div className="text-4xl font-bold">{data.averageLength || 0}</div>
              <div className="text-sm text-gray-500 mt-2">
                characters per response
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 mb-1">Response Rate</div>
              <div className="text-4xl font-bold">{data.responseRate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-500 mt-2">
                of all form submissions
              </div>
            </CardContent>
          </Card>
        </div>
        
        {data.commonWords && data.commonWords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Common Words & Phrases</CardTitle>
              <CardDescription>
                Frequently mentioned terms in responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.commonWords.map((word, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm py-1 px-3"
                    style={{
                      fontSize: `${Math.max(0.8, Math.min(1.5, 0.8 + (word.count / data.total) * 3))}rem`,
                    }}
                  >
                    {word.text} ({word.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  // Render response list for all question types
  const renderResponseList = () => {
    if (!responses || responses.length === 0) {
      return <div className="text-center py-8 text-gray-500">No responses yet</div>;
    }
    
    return (
      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="space-y-4 mt-4">
          {filteredResponses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No matching responses</div>
          ) : (
            filteredResponses.map((response, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        {question.type === &apos;rating&apos; ? (
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < response.value ? &apos;text-yellow-400&apos; : &apos;text-gray-300&apos;
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 font-medium">{response.value}/5</span>
                          </div>
                        ) : (
                          <p className="text-lg font-medium break-words">
                            {typeof response.value === &apos;string&apos; ? response.value : JSON.stringify(response.value)}
                          </p>
                        )}
                        
                        {response.customer && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-2">
                              {response.customer.name ? response.customer.name.charAt(0).toUpperCase() : &apos;A&apos;}
                            </div>
                            <div>
                              <p className="font-medium">{response.customer.name || &apos;Anonymous&apos;}</p>
                              {response.customer.email && (
                                <p className="text-sm text-gray-500">{response.customer.email}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {response.feedbackId && (
                      <div className="mt-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/admin/feedback/responses/${response.feedbackId}`)}
                        >
                          View Full Response
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {responses.length > 10 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {Math.min(filteredResponses.length, 10)} of {filteredResponses.length} responses
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!question || !analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Question data not found</h3>
          <Button onClick={() => router.push(`/admin/feedback/analytics/${formId}`)}>
            Back to Analytics
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/feedback/analytics/${formId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Question Analysis</h1>
            <p className="text-gray-500">
              Detailed analytics for this question
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{question.text}</CardTitle>
                {question.description && (
                  <CardDescription className="mt-1">{question.description}</CardDescription>
                )}
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary">
                  {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                </Badge>
                {question.required && (
                  <Badge variant="outline">Required</Badge>
                )}
                {analytics?.hasBeenModified && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Modified
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="visualization">
              <BarChart2 className="h-4 w-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="responses">
              <MessageSquare className="h-4 w-4 mr-2" />
              Individual Responses
            </TabsTrigger>
            <TabsTrigger value="trend">
              <CalendarRange className="h-4 w-4 mr-2" />
              Trend Over Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="mt-0">
            {renderVisualization()}
          </TabsContent>

          <TabsContent value="responses" className="mt-0">
            {renderResponseList()}
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.trendData || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Responses"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  {question.type === &apos;rating&apos; && (
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Average Rating"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      yAxisId={1}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}