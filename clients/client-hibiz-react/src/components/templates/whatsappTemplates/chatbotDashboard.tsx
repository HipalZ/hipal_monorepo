import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  Bot,
  BotIcon,
  Calendar,
  Clock,
  Pencil,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';

// Helper function
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export function ChatbotDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const chatbots = [
    {
      _id: '66a25e423318398937eb87f9',
      businessId: '66a25e423318398937eb87f9',
      chatbotName: 'SmileBright Dental Assistant',
      version: 2,
      active: true,
      createdAt: '2025-11-03T12:00:00Z',
      updatedAt: '2025-11-04T09:45:00Z',
      stats: {
        totalSessions: 135,
        completedSessions: 87,
        dropOffSessions: 48,
        avgCompletionRate: 64.4,
      },
    },
    {
      _id: '66a25e423318398937eb87fa0',
      businessId: '66a25e423318398937eb87f9',
      chatbotName: 'HiPalz Restaurant Bot',
      version: 2,
      active: false,
      createdAt: '2025-10-25T07:30:00Z',
      updatedAt: '2025-11-01T18:10:00Z',
      stats: {
        totalSessions: 79,
        completedSessions: 62,
        dropOffSessions: 17,
        avgCompletionRate: 78.5,
      },
    },
  ];

  // Calculate total stats
  const totalSessions = chatbots.reduce((sum, bot) => sum + bot.stats.totalSessions, 0);
  const totalCompleted = chatbots.reduce((sum, bot) => sum + bot.stats.completedSessions, 0);
  const totalDropOffs = chatbots.reduce((sum, bot) => sum + bot.stats.dropOffSessions, 0);
  const totalActive = chatbots.filter((bot) => bot.active).length;
  const avgCompletionRate = totalSessions > 0 ? (totalCompleted / totalSessions) * 100 : 0;

  const filteredChatbots = chatbots.filter((bot) => bot.chatbotName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Bot className="h-8 w-8 text-blue-600" />
            My Chatbots
          </h1>
          <p className="mt-1 text-gray-600">Manage and monitor your AI-powered chatbots</p>
        </div>
        <Button className="mt-4 flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 sm:mt-0">
          <Plus className="h-4 w-4" />
          Create New Chatbot
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={totalSessions}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          trendIcon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Avg. Completion"
          value={`${avgCompletionRate.toFixed(1)}%`}
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          trendIcon={avgCompletionRate > 50 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
        />
        <StatCard
          title="Total Drop-offs"
          value={totalDropOffs}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          trendIcon={<TrendingDown className="h-4 w-4 text-red-500" />}
        />
        <StatCard
          trendIcon={<BotIcon className="h-4 w-4 text-red-500" />}
          title="Active Bots"
          value={`${totalActive} / ${chatbots.length}`}
          icon={<Bot className="h-5 w-5 text-gray-500" />}
        />
      </div>

      {/* Search and Filter */}
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

      {/* Chatbot Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChatbots.map((bot) => (
          <Card key={bot._id} className="group overflow-hidden rounded-xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{bot.chatbotName}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Version {bot.version}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={bot.active ? 'default' : 'secondary'}
                    className={bot.active ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-gray-200 bg-red-100 text-gray-800'}
                  >
                    {bot.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Created</span>
                      <span className="block font-medium">{formatDate(bot.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Updated</span>
                      <span className="block font-medium">{formatDate(bot.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Sessions Stats */}
                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Sessions</span>
                    <span className="font-semibold text-gray-900">{bot.stats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{bot.stats.completedSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Drop-Off</span>
                    <span className="font-semibold text-red-600">{bot.stats.dropOffSessions}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-semibold text-blue-600">{bot.stats.avgCompletionRate.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={bot.stats.avgCompletionRate}
                    className="h-2 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredChatbots.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <Bot className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No chatbots found</h3>
          <p className="mx-auto mb-6 max-w-xs text-gray-500">
            {searchTerm ? `No chatbots match "${searchTerm}". Try a different search.` : 'Get started by creating your first chatbot.'}
          </p>
          <Button className="mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create First Chatbot
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for stat cards
function StatCard({ title, value, icon, trendIcon }) {
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
