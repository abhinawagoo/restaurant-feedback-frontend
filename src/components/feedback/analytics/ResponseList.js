// src/components/feedback/analytics/ResponseList.js
import React, { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  FileDown, 
  Star, 
  MessageSquare 
} from "lucide-react";

export default function ResponseList ({ responses, onViewDetail }){
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [sortBy, setSortBy] = useState(&apos;date&apos;);
  const [sortOrder, setSortOrder] = useState(&apos;desc&apos;);

  // Function to get visible text response for preview
  const getTextPreview = (response) => {
    const textAnswers = response.answers.filter(answer => 
      answer.type === &apos;text&apos; && answer.value && answer.value.trim().length > 0
    );
    
    if (textAnswers.length === 0) return null;
    
    // Get the first non-empty text answer
    return textAnswers[0].value.length > 100 
      ? textAnswers[0].value.substring(0, 100) + &apos;...&apos; 
      : textAnswers[0].value;
  };

  // Function to get average rating from response
  const getAverageRating = (response) => {
    const ratingAnswers = response.answers.filter(answer => 
      answer.type === &apos;rating&apos; && !isNaN(Number(answer.value))
    );
    
    if (ratingAnswers.length === 0) return null;
    
    const sum = ratingAnswers.reduce((acc, answer) => acc + Number(answer.value), 0);
    return (sum / ratingAnswers.length).toFixed(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === &apos;asc&apos; ? &apos;desc&apos; : &apos;asc&apos;);
    } else {
      // New field, default to desc
      setSortBy(field);
      setSortOrder(&apos;desc&apos;);
    }
  };

  // Filter and sort responses
  const filteredAndSortedResponses = responses
  .filter(response => {
    if (!searchTerm) return true;
    
    // Search in all text answers
    const textAnswers = response.answers.filter(a => a.type === &apos;text&apos;);
    const textMatches = textAnswers.some(a => 
      a.value && a.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Search in customer info if available
    const customerMatch = response.customer && (
      (response.customer.name && response.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.customer.email && response.customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return textMatches || customerMatch;
  })
  .sort((a, b) => {
    const aVal = sortBy === &apos;date&apos; ? new Date(a.createdAt).getTime() :
                sortBy === &apos;rating&apos; ? (getAverageRating(a) || 0) :
                a[sortBy];
    const bVal = sortBy === &apos;date&apos; ? new Date(b.createdAt).getTime() :
                sortBy === &apos;rating&apos; ? (getAverageRating(b) || 0) :
                b[sortBy];
                
    return sortOrder === &apos;asc&apos; ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Individual Responses</CardTitle>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort(&apos;date&apos;)}>
                  Sort by Date {sortBy === &apos;date&apos; && (sortOrder === &apos;asc&apos; ? &apos;↑&apos; : &apos;↓&apos;)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort(&apos;rating&apos;)}>
                  Sort by Rating {sortBy === &apos;rating&apos; && (sortOrder === &apos;asc&apos; ? &apos;↑&apos; : &apos;↓&apos;)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead className="w-[150px]">Customer</TableHead>
                  <TableHead className="text-right w-[100px]">Rating</TableHead>
                  <TableHead className="text-right w-[150px]">Date</TableHead>
                  <TableHead className="text-right w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No responses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedResponses.map((response) => {
                    const textPreview = getTextPreview(response);
                    const avgRating = getAverageRating(response);
                    
                    return (
                      <TableRow key={response._id}>
                        <TableCell className="font-mono text-xs">
                          {response._id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {textPreview ? (
                            <p className="text-sm">{textPreview}</p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No text response</p>
                          )}
                          <div className="flex space-x-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {response.answers.length} answers
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {response.customer ? (
                            <div className="text-sm">
                              <div className="font-medium">{response.customer.name || &apos;Anonymous&apos;}</div>
                              {response.customer.email && (
                                <div className="text-xs text-gray-500">{response.customer.email}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {avgRating ? (
                            <div className="flex items-center justify-end">
                              <span className="font-medium mr-1">{avgRating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-500">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetail(response._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {responses.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {filteredAndSortedResponses.length} of {responses.length} responses
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

