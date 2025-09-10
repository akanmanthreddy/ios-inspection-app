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
      <div className="bg-primary text-primary-foreground px-6 pt-16 pb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Haven Realty</h1>
          <p className="text-primary-foreground/80 text-lg">Property Inspection Platform</p>
        </div>
      </div>

      {/* Main Action */}
      <div className="px-6 -mt-8 mb-8">
        <Card
          className="p-6 cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 bg-card border-0 shadow-xl"
          onClick={onNavigateToCommunities}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">Browse Communities</h3>
              <p className="text-muted-foreground">Start your property inspections</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground ml-4" />
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 text-foreground">Quick Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 text-center bg-card shadow-lg border-0">
            <div className="text-3xl font-bold text-secondary mb-2">24</div>
            <div className="text-sm font-medium text-muted-foreground">Communities</div>
          </Card>
          <Card className="p-6 text-center bg-card shadow-lg border-0">
            <div className="text-3xl font-bold text-secondary mb-2">156</div>
            <div className="text-sm font-medium text-muted-foreground">Properties</div>
          </Card>
        </div>
      </div>



      {/* Bottom Safe Area for Bottom Navigation */}
      <div className="h-20"></div>
    </div>
  );
}