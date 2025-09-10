import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { DevelopmentNotice } from "./DevelopmentNotice";
import logo from "figma:asset/a9104ca5d97d973d81bd09faef4cc958aca2b5ac.png";

interface LandingPageProps {
  onNavigateToInspections: () => void;
  onNavigateToReports: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToAdmin: () => void;
}

export function LandingPage({
  onNavigateToInspections,
  onNavigateToReports,
  onNavigateToAnalytics,
  onNavigateToAdmin,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Development Notice */}
        <DevelopmentNotice />
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div></div>
          <img
            src={logo}
            alt="Haven Realty Capital"
            className="h-30 w-auto rounded-[35px]"
          />
          <Button
            onClick={onNavigateToAdmin}
            className="flex items-center gap-2"
            style={{ 
              backgroundColor: '#1b365d',
              color: '#ffffff'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">

        </div>

        {/* Main Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Reports & Analytics */}
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-0 shadow-md"
                style={{ backgroundColor: '#ffffff' }}
                onClick={onNavigateToReports}>
            <CardContent className="p-8 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#4698cb' }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-4" style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
                Reports & Analytics
              </h3>
              <p style={{ color: '#768692', fontSize: '1rem', lineHeight: '1.6' }}>
                Generate comprehensive reports, analyze trends, and export inspection data for stakeholders
              </p>
            </CardContent>
          </Card>

          {/* Advanced Analytics */}
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-0 shadow-md"
                style={{ backgroundColor: '#ffffff' }}
                onClick={onNavigateToAnalytics}>
            <CardContent className="p-8 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#768692' }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mb-4" style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
                Advanced Analytics
              </h3>
              <p style={{ color: '#768692', fontSize: '1rem', lineHeight: '1.6' }}>
                Predictive maintenance insights, portfolio performance analysis, and financial projections
              </p>
            </CardContent>
          </Card>
        </div>


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-[#4698cb]"
            onClick={onNavigateToInspections}
            style={{ borderColor: "#1b365d" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#1b365d" }}>
                Property Inspections
              </CardTitle>
              <CardDescription style={{ color: "#768692" }}>
                Manage and track property inspections across all
                your communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span style={{ color: "#4698cb" }}>
                  Access Module
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#4698cb" }}
                >
                  <span className="text-white">→</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-2"
            style={{ borderColor: "#768692", opacity: 0.6 }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#768692" }}>
                Financial Analytics
              </CardTitle>
              <CardDescription style={{ color: "#768692" }}>
                Coming soon - Comprehensive financial reporting
                and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span style={{ color: "#768692" }}>
                  Coming Soon
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#768692" }}
                >
                  <span className="text-white">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-2"
            style={{ borderColor: "#768692", opacity: 0.6 }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#768692" }}>
                Acquisitions
              </CardTitle>
              <CardDescription style={{ color: "#768692" }}>
                Coming soon - Client communication and document
                sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span style={{ color: "#768692" }}>
                  Coming Soon
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#768692" }}
                >
                  <span className="text-white">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div
            className="text-center p-6 rounded-lg"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div
              style={{
                color: "#1b365d",
                fontSize: "2rem",
                fontWeight: "600",
              }}
            >
              150+
            </div>
            <div style={{ color: "#768692" }}>Communities</div>
          </div>
          <div
            className="text-center p-6 rounded-lg"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div
              style={{
                color: "#1b365d",
                fontSize: "2rem",
                fontWeight: "600",
              }}
            >
              2,500+
            </div>
            <div style={{ color: "#768692" }}>Properties</div>
          </div>
          <div
            className="text-center p-6 rounded-lg"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div
              style={{
                color: "#1b365d",
                fontSize: "2rem",
                fontWeight: "600",
              }}
            >
              5,000+
            </div>
            <div style={{ color: "#768692" }}>Inspections</div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="text-center pt-8 border-t"
          style={{ borderColor: "#768692" }}
        >
          <p style={{ color: "#768692" }}>
            © 2024 Haven Realty Capital. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}