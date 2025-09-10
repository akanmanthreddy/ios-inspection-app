import { Building2, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';

interface MobileLandingPageProps {
  onNavigateToCommunities: () => void;
}

export function MobileLandingPage({
  onNavigateToCommunities
}: MobileLandingPageProps) {



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-medium mb-2">Property Inspector</h1>
          <p className="text-primary-foreground/80">Real Estate Inspection Platform</p>
        </div>
      </div>

      {/* Main Action */}
      <div className="px-6 -mt-4 mb-8">
        <Card
          className="p-6 cursor-pointer transition-all duration-200 active:scale-95 shadow-lg border-0"
          onClick={onNavigateToCommunities}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Browse Communities</h3>
              <p className="text-muted text-sm">Start property inspections</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted ml-4" />
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-8">
        <h2 className="font-medium mb-4">Quick Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-medium text-primary mb-1">24</div>
            <div className="text-sm text-muted">Communities</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-medium text-secondary mb-1">156</div>
            <div className="text-sm text-muted">Properties</div>
          </Card>
        </div>
      </div>



      {/* Bottom Safe Area for Bottom Navigation */}
      <div className="h-20"></div>
    </div>
  );
}