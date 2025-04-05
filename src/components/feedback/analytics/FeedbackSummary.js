// src/components/feedback/analytics/FeedbackSummary.js
import React from &apos;react&apos;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from &apos;recharts&apos;;

const FeedbackSummary = ({ analyticsData, formData }) => {
  // Response rate calculation - sample data since we don&apos;t know your exact structure
  const responseRate = (analyticsData.totalResponses / analyticsData.totalViews) * 100 || 0;
  
  // Color constants for charts
  const COLORS = [&apos;#0088FE&apos;, &apos;#00C49F&apos;, &apos;#FFBB28&apos;, &apos;#FF8042&apos;, &apos;#8884d8&apos;];

  // Example NPS calculation - adjust according to your data structure
  const calculateNPS = () => {
    const promoters = analyticsData.npsData?.promoters || 0;
    const detractors = analyticsData.npsData?.detractors || 0;
    const total = analyticsData.npsData?.total || 1; // Avoid division by zero
    
    return ((promoters - detractors) / total) * 100;
  };

  const npsScore = calculateNPS();

  return (
    <div className="space-y-6">
      {/* Top metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.totalResponses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analyticsData.firstResponseDate} to {analyticsData.lastResponseDate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{responseRate.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={responseRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.totalResponses} of {analyticsData.totalViews} visitors provided feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-3xl font-bold">{analyticsData.averageRating?.toFixed(1) || &apos;N/A&apos;}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(analyticsData.averageRating || 0)
                      ? &apos;text-yellow-400&apos;
                      : &apos;text-gray-300&apos;
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                Based on {analyticsData.ratingResponseCount || 0} ratings
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response trend over time */}
      <Card>
        <CardHeader>
          <CardTitle>Response Trend</CardTitle>
          <CardDescription>
            Number of responses collected over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.responseTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Responses"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ratings distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of ratings provided by respondents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.ratingDistribution}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Responses" fill="#8884d8">
                    {analyticsData.ratingDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* NPS Score pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Sentiment</CardTitle>
            <CardDescription>
              Net Promoter Score: {npsScore.toFixed(1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: &apos;Promoters&apos;, value: analyticsData.npsData?.promoters || 0, fill: &apos;#00C49F&apos; },
                      { name: &apos;Passives&apos;, value: analyticsData.npsData?.passives || 0, fill: &apos;#FFBB28&apos; },
                      { name: &apos;Detractors&apos;, value: analyticsData.npsData?.detractors || 0, fill: &apos;#FF8042&apos; },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top feedback themes - if you have text analysis */}
      {analyticsData.feedbackThemes && (
        <Card>
          <CardHeader>
            <CardTitle>Common Feedback Themes</CardTitle>
            <CardDescription>
              Frequently mentioned topics in open-ended responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.feedbackThemes.map((theme, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{theme.name}</span>
                    <span className="text-sm text-gray-500">{theme.count} mentions</span>
                  </div>
                  <Progress value={(theme.count / analyticsData.totalResponses) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackSummary;