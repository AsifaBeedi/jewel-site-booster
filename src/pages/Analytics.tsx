import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, MousePointerClick, Eye, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalVisits: number;
  totalClicks: number;
  topButtons: Array<{ button_id: string; count: number }>;
  utmSources: Array<{ utm_source: string; count: number }>;
  recentVisits: Array<any>;
  recentClicks: Array<any>;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalVisits: 0,
    totalClicks: 0,
    topButtons: [],
    utmSources: [],
    recentVisits: [],
    recentClicks: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchAnalytics();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch total visits
      const { count: visitsCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true });

      // Fetch total clicks
      const { count: clicksCount } = await supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true });

      // Fetch top clicked buttons
      const { data: clickData } = await supabase
        .from('click_events')
        .select('button_id');

      const buttonCounts = clickData?.reduce((acc: any, curr) => {
        acc[curr.button_id] = (acc[curr.button_id] || 0) + 1;
        return acc;
      }, {});

      const topButtons = Object.entries(buttonCounts || {})
        .map(([button_id, count]) => ({ button_id, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Fetch UTM sources
      const { data: visitData } = await supabase
        .from('page_visits')
        .select('utm_source')
        .not('utm_source', 'is', null);

      const utmCounts = visitData?.reduce((acc: any, curr) => {
        if (curr.utm_source) {
          acc[curr.utm_source] = (acc[curr.utm_source] || 0) + 1;
        }
        return acc;
      }, {});

      const utmSources = Object.entries(utmCounts || {})
        .map(([utm_source, count]) => ({ utm_source, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Fetch recent visits
      const { data: recentVisits } = await supabase
        .from('page_visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent clicks
      const { data: recentClicks } = await supabase
        .from('click_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setData({
        totalVisits: visitsCount || 0,
        totalClicks: clicksCount || 0,
        topButtons,
        utmSources,
        recentVisits: recentVisits || [],
        recentClicks: recentClicks || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      // Fetch all data
      const { data: visits } = await supabase
        .from('page_visits')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: clicks } = await supabase
        .from('click_events')
        .select('*')
        .order('created_at', { ascending: false });

      // Create CSV for visits
      const visitsCSV = [
        ['Type', 'Timestamp', 'Page Path', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Referrer', 'Session ID'].join(','),
        ...(visits || []).map(v => 
          ['Page Visit', v.created_at, v.page_path, v.utm_source || '', v.utm_medium || '', v.utm_campaign || '', v.referrer || '', v.session_id || ''].join(',')
        ),
      ].join('\n');

      // Create CSV for clicks
      const clicksCSV = [
        ['Type', 'Timestamp', 'Button ID', 'Button Text', 'Page Path', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Session ID'].join(','),
        ...(clicks || []).map(c => 
          ['Click Event', c.created_at, c.button_id, c.button_text || '', c.page_path, c.utm_source || '', c.utm_medium || '', c.utm_campaign || '', c.session_id || ''].join(',')
        ),
      ].join('\n');

      // Combine both CSVs
      const combinedCSV = visitsCSV + '\n' + clicksCSV;

      // Download CSV
      const blob = new Blob([combinedCSV], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Analytics data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground font-sans">Track your website performance and user engagement</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={fetchAnalytics} variant="outline">
              Refresh
            </Button>
            <Button onClick={() => navigate('/')}>
              Back to Site
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-sans">Total Page Visits</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{data.totalVisits}</div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-sans">Total Clicks</CardTitle>
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{data.totalClicks}</div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-sans">Conversion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">
                {data.totalVisits > 0 ? ((data.totalClicks / data.totalVisits) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">Click-through rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Top Clicked Buttons</CardTitle>
              <CardDescription className="font-sans">Most popular CTAs on your site</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topButtons.length > 0 ? (
                <div className="space-y-3">
                  {data.topButtons.map((button, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-sans text-sm">{button.button_id}</span>
                      <span className="font-serif font-semibold">{button.count} clicks</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm font-sans">No click data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Traffic Sources</CardTitle>
              <CardDescription className="font-sans">UTM sources bringing visitors</CardDescription>
            </CardHeader>
            <CardContent>
              {data.utmSources.length > 0 ? (
                <div className="space-y-3">
                  {data.utmSources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-sans text-sm">{source.utm_source}</span>
                      <span className="font-serif font-semibold">{source.count} visits</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm font-sans">No UTM data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
            <CardDescription className="font-sans">Latest clicks and visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentClicks.slice(0, 5).map((click, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-sans font-medium text-sm">Click: {click.button_id}</p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {click.utm_source && `Source: ${click.utm_source} • `}
                      {new Date(click.created_at).toLocaleString()}
                    </p>
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

export default Analytics;
