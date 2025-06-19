'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RevenueChart from './components/revenue-chart';
import ExpenseTracker from './components/expense-tracker';
import { DollarSign, Users, FileText, CheckSquare, TrendingUp, Calendar } from 'lucide-react';

interface RevenueData {
  month: number;
  year: number;
  total_revenue: number;
}

interface ExpenseData {
  category: string;
  amount: number;
}

export default function Dashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load revenue data
      const { data: revenue, error: revenueError } = await supabase
        .from('revenue_entries')
        .select('*')
        .eq('year', 2025)
        .order('month', { ascending: true });

      if (revenueError) {
        console.error('Error loading revenue data:', revenueError);
        setError(`Revenue data error: ${revenueError.message}`);
      } else {
        setRevenueData(revenue || []);
        const total = revenue?.reduce((sum, item) => sum + Number(item.total_revenue), 0) || 0;
        setTotalRevenue(total);
      }

      // Load expense data for current month
      const currentMonth = new Date().getMonth() + 1;
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('year', 2025)
        .eq('month', currentMonth);

      if (expenseError) {
        console.error('Error loading expense data:', expenseError);
        setError(prev => prev ? `${prev}; Expense data error: ${expenseError.message}` : `Expense data error: ${expenseError.message}`);
      } else if (expenses) {
        // Group expenses by category
        const groupedExpenses = expenses.reduce((acc: ExpenseData[], item) => {
          const existing = acc.find(e => e.category === item.category);
          if (existing) {
            existing.amount += Number(item.amount);
          } else {
            acc.push({ category: item.category, amount: Number(item.amount) });
          }
          return acc;
        }, []);
        setExpenseData(groupedExpenses);
        const totalExp = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        setTotalExpenses(totalExp);
      }

      // Load client count
      const { count: clientsCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientError) {
        console.error('Error loading client count:', clientError);
      } else {
        setClientCount(clientsCount || 0);
      }

      // Load pending tasks count
      const { count: tasksCount, error: taskError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (taskError) {
        console.error('Error loading task count:', taskError);
      } else {
        setTaskCount(tasksCount || 0);
      }

    } catch (err) {
      console.error('Unexpected error loading dashboard data:', err);
      setError('An unexpected error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    return totalRevenue - totalExpenses;
  };

  const calculateProfitMargin = () => {
    if (totalRevenue === 0) return 0;
    return ((calculateProfit() / totalRevenue) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateProfit().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Profit margin: {calculateProfitMargin()}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-muted-foreground">{taskCount} pending tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expense Tracking</TabsTrigger>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseTracker expenses={expenseData} onExpenseAdded={loadDashboardData} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Client management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}