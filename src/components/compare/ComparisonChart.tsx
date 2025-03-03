
import React from "react";
import { Partner } from "@/components/partners/PartnerList";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonChartProps {
  selectedPartners: Partner[];
}

export const ComparisonChart = ({ selectedPartners }: ComparisonChartProps) => {
  // Skip rendering if there are no partners or only one partner
  if (!selectedPartners.length || selectedPartners.length < 2) {
    return null;
  }

  // Generate synthetic scores based on partner information
  // In a real app, these scores would come from AI analysis
  const chartData = selectedPartners.map((partner) => {
    // Calculate a score between 0-100 based on status
    const statusScore = {
      active: 90,
      potential: 70,
      inactive: 40,
      archived: 20,
    }[partner.status] || 50;

    // Use the AI analysis if available to influence the score
    let analysisScore = 50; // Default
    if (partner.ai_analysis?.analysis) {
      // Simple heuristic: count positive words vs negative words
      const text = partner.ai_analysis.analysis.toLowerCase();
      const positiveWords = ['good', 'great', 'excellent', 'beneficial', 'potential', 'strong'];
      const negativeWords = ['concern', 'issue', 'problem', 'risk', 'weakness', 'challenge'];
      
      let positiveCount = positiveWords.reduce((count, word) => 
        count + (text.match(new RegExp(word, 'g')) || []).length, 0);
      let negativeCount = negativeWords.reduce((count, word) => 
        count + (text.match(new RegExp(word, 'g')) || []).length, 0);
      
      analysisScore = Math.min(100, Math.max(0, 50 + 5 * (positiveCount - negativeCount)));
    }

    // Final score is a weighted average
    const finalScore = Math.round(0.6 * statusScore + 0.4 * analysisScore);

    return {
      name: partner.company_name,
      score: finalScore,
      industry: partner.industry,
      status: partner.status,
    };
  });

  // Sort by score to show ranking
  chartData.sort((a, b) => b.score - a.score);
  
  // Color generator based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#4ade80"; // green-400
    if (score >= 60) return "#22c55e"; // green-500
    if (score >= 40) return "#f59e0b"; // amber-500
    if (score >= 20) return "#ef4444"; // red-500
    return "#b91c1c"; // red-700
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Partner Comparison Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
              />
              <YAxis 
                label={{ 
                  value: 'Compatibility Score', 
                  angle: -90, 
                  position: 'insideLeft' 
                }} 
                domain={[0, 100]} 
              />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Compatibility Score']}
                labelFormatter={(value) => `${value}`}
              />
              <Legend />
              <Bar dataKey="score" name="Compatibility Score">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Chart shows relative partnership compatibility based on partner status and AI analysis.</p>
        </div>
      </CardContent>
    </Card>
  );
};
