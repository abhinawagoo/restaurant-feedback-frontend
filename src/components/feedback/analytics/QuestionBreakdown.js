// src/components/feedback/analytics/QuestionBreakdown.js
import React, { useState } from &apos;react&apos;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, AlertTriangle, BarChart3 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from &apos;recharts&apos;;

const QuestionBreakdown = ({ questions, analytics, onViewDetail }) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  
  const toggleExpand = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  // Helper to get analytics for a specific question
  const getQuestionAnalytics = (questionId) => {
    return analytics.find(a => a.questionId === questionId) || {};
  };

  // Helper to render the appropriate visualization based on question type
  const renderQuestionVisualization = (question, questionAnalytics) => {
    if (!questionAnalytics || !questionAnalytics.data) {
      return <div className="text-gray-500 text-center py-6">No data available</div>;
    }
    
    switch (question.type) {
      case &apos;rating&apos;:
        return renderRatingVisualization(questionAnalytics.data);
      case &apos;multiplechoice&apos;:
      case &apos;checkbox&apos;:
      case &apos;dropdown&apos;:
        return renderChoiceVisualization(questionAnalytics.data, question.options);
      case &apos;text&apos;:
        return renderTextResponses(questionAnalytics.data);
      default:
        return <div className="text-gray-500 text-center py-6">Visualization not available for this question type</div>;
    }
  };
  
  // Render rating visualization (bar chart)
  const renderRatingVisualization = (data) => {
    // Format data for chart
    const chartData = Object.entries(data.distribution || {}).map(([rating, count]) => ({
      rating: Number(rating),
      count
    })).sort((a, b) => a.rating - b.rating);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">Average Rating: <span className="font-bold">{data.average?.toFixed(1) || &apos;N/A&apos;}</span></div>
          <div className="text-gray-500">{data.total || 0} responses</div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="#8884d8"
                name="Responses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {data.recentRatings && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Recent ratings</h4>
            <div className="space-y-2">
              {data.recentRatings.map((rating, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                      {rating.value}
                    </div>
                    <div className="ml-2">
                      {rating.comment && <p className="text-gray-700">{rating.comment}</p>}
                      <p className="text-xs text-gray-500">{rating.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render choice visualization (bar chart for multiple choice/checkbox/dropdown)
  const renderChoiceVisualization = (data, options) => {
    if (!data.distribution) return <div className="text-gray-500 text-center py-6">No data available</div>;
    
    // Format data for chart
    const chartData = Object.entries(data.distribution).map(([option, count]) => ({
      option,
      count,
      percentage: (count / data.total) * 100
    })).sort((a, b) => b.count - a.count);
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500">{data.total || 0} responses</div>
        
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.option}</span>
                <span>{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
        
        {data.otherResponses && data.otherResponses.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">"Other" responses</h4>
            <div className="space-y-2">
              {data.otherResponses.map((response, index) => (
                <div key={index} className="text-sm p-2 rounded-md bg-gray-50">
                  {response}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render text responses
  const renderTextResponses = (data) => {
    if (!data.responses || data.responses.length === 0) {
      return <div className="text-gray-500 text-center py-6">No text responses yet</div>;
    }
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500">{data.responses.length} text responses</div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.responses.slice(0, 10).map((response, index) => (
            <div key={index} className="p-3 rounded-md bg-gray-50 text-sm">
              <p className="text-gray-700">{response.text}</p>
              <p className="text-xs text-gray-500 mt-1">{response.date}</p>
            </div>
          ))}
          
          {data.responses.length > 10 && (
            <div className="text-center text-sm text-gray-500">
              +{data.responses.length - 10} more responses
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const questionAnalytics = getQuestionAnalytics(question._id);
        const isExpanded = expandedQuestionId === question._id;
        
        return (
          <Card key={question._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">
                    {question.text}
                    {questionAnalytics.hasBeenModified && (
                      <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Modified
                      </Badge>
                    )}
                  </CardTitle>
                  {question.description && (
                    <CardDescription className="mt-1">{question.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-gray-500">
                    {questionAnalytics.responseCount || 0} responses
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className={isExpanded ? "" : "hidden"}>
              <Separator className="mb-6" />
              {renderQuestionVisualization(question, questionAnalytics)}
            </CardContent>
            
            <CardFooter className="flex justify-between py-3 px-6 bg-gray-50">
              <Button variant="ghost" size="sm" onClick={() => toggleExpand(question._id)}>
                {isExpanded ? "Hide Details" : "Show Preview"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetail(question._id)} 
                className="flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Detailed Analysis
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default QuestionBreakdown;