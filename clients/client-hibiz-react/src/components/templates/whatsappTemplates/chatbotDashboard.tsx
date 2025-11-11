import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAllChatbots, useChatbotSessions } from '@/hooks/useChatbotAnalytics';
import { Activity, AlertTriangle, BarChart3, Bot, Loader2, Plus, Search, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export function ChatbotDashboard() {
  const { data: chatbots, isLoading } = useAllChatbots();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBot, setSelectedBot] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Chatbots...
      </div>
    );
  }

  const filtered = (chatbots || []).filter((bot: any) => bot.chatbotName.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalSessions = filtered.reduce((a, b) => a + (b.stats?.totalSessions || 0), 0);
  const totalCompleted = filtered.reduce((a, b) => a + (b.stats?.completedSessions || 0), 0);
  const totalDropOff = filtered.reduce((a, b) => a + (b.stats?.dropOffSessions || 0), 0);
  const totalActive = filtered.filter((b: any) => b.active).length;
  const avgCompletionRate = totalSessions ? (totalCompleted / totalSessions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Bot className="h-8 w-8 text-blue-600" /> Chatbot Analytics
          </h1>
          <p className="mt-1 text-gray-600">Monitor engagement and performance across all WhatsApp flows</p>
        </div>
        <Button className="mt-4 flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 sm:mt-0">
          <Plus className="h-4 w-4" /> Create New Chatbot
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sessions" value={totalSessions} icon={<Users className="h-5 w-5 text-blue-500" />} />
        <StatCard
          title="Avg. Completion"
          value={`${avgCompletionRate.toFixed(1)}%`}
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          trendIcon={avgCompletionRate > 50 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
        />
        <StatCard title="Total Drop-offs" value={totalDropOff} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} />
        <StatCard title="Active Bots" value={`${totalActive} / ${filtered.length}`} icon={<Activity className="h-5 w-5 text-gray-500" />} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Search chatbots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-full border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm focus:border-blue-500"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Chatbot Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((bot: any) => (
          <Card key={bot._id} className="group overflow-hidden rounded-xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{bot.chatbotName}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Version {bot.version}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={bot.active ? 'default' : 'secondary'}
                  className={bot.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}
                >
                  {bot.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {formatDate(bot.createdAt)}</span>
                  <span>Updated: {formatDate(bot.updatedAt)}</span>
                </div>

                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Sessions</span>
                    <span className="font-semibold">{bot.stats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-semibold text-green-600">{bot.stats.completedSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Drop-offs</span>
                    <span className="font-semibold text-red-600">{bot.stats.dropOffSessions}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-semibold text-blue-600">{bot.stats.avgCompletionRate.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={bot.stats.avgCompletionRate}
                    className="h-2 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setSelectedBot(bot)}
                >
                  <BarChart3 className="h-4 w-4" /> View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <Bot className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No chatbots found</h3>
          <p className="mx-auto mb-6 max-w-xs text-gray-500">
            {searchTerm ? `No chatbots match "${searchTerm}". Try another search.` : 'Create your first chatbot to start tracking analytics.'}
          </p>
          <Button className="mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Create Chatbot
          </Button>
        </div>
      )}

      {selectedBot && <ChatbotSessionsModal bot={selectedBot} onClose={() => setSelectedBot(null)} />}
    </div>
  );
}

function StatCard({ title, value, icon, trendIcon }: any) {
  return (
    <Card className="rounded-xl border-0 bg-white shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
          <span>{title}</span>
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {trendIcon && <div className="ml-auto">{trendIcon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ChatbotSessionsModal({ bot, onClose }: any) {
  const { data: sessions, isLoading } = useChatbotSessions(bot._id);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" /> {bot.chatbotName} — Session Analytics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sessions...
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {sessions?.map((s: any) => (
              <div key={s._id} className="rounded-lg border border-gray-100 bg-slate-50 p-3 transition hover:bg-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-800">{s.userName || 'Unknown User'}</span>
                  <span className="text-gray-500">{new Date(s.startTime).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    {s.completed ? (
                      <span className="font-medium text-green-600">Completed</span>
                    ) : (
                      <span className="font-medium text-red-600">Dropped</span>
                    )}
                  </span>
                  {s.sessionDurationMs && <span>{Math.round(s.sessionDurationMs / 1000)} sec</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
